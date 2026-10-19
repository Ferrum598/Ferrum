<?php

namespace App\Http\Controllers;

use App\Models\Comprobante;
use App\Models\Lote;
use App\Models\ReporteGanancia;
use App\Models\ReporteVenta;
use App\Services\ReportesService;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ComprobanteController extends Controller
{
    public function index(Request $request)
    {
        $q = trim((string) $request->query('q', ''));
        $fecha = $request->query('fecha');

        $comprobantes = Comprobante::query()
            ->with(['venta.cliente', 'venta.credito'])
            ->when($q !== '', function ($query) use ($q) {
                $query->where(function ($w) use ($q) {
                    $w->where('numero_comprobante', 'like', "%{$q}%")
                        ->orWhereHas('venta.cliente', function ($c) use ($q) {
                            $c->where('nombre_cliente', 'like', "%{$q}%")
                                ->orWhere('apellido_cliente', 'like', "%{$q}%");
                        });
                });
            })
            ->when($fecha, fn($query, $f) => $query->whereDate('fecha_emision', $f))
            ->orderByDesc('id_comprobante')
            ->paginate(15)
            ->withQueryString()
            ->through(fn(Comprobante $c) => [
                'id_comprobante' => $c->id_comprobante,
                'numero_comprobante' => $c->numero_comprobante,
                'fecha_emision' => $c->fecha_emision?->format('Y-m-d H:i'),
                'total' => (string) $c->total,
                'cliente' => $c->venta?->cliente
                    ? trim($c->venta->cliente->nombre_cliente . ' ' . $c->venta->cliente->apellido_cliente)
                    : null,
                'tipo_pago' => $c->venta?->credito ? 'credito' : 'contado',
                'veces_impreso' => (int) $c->veces_impreso,
                'anulado' => (bool) $c->anulado,
            ]);

        return Inertia::render('Comprobantes/Comprobantes', [
            'comprobantes' => $comprobantes,
            'filtros' => ['q' => $q, 'fecha' => $fecha],
        ]);
    }

    public function show(int $id)
    {
        $c = Comprobante::with([
            'usuario',
            'venta.cliente',
            'venta.credito',
            'venta.detalles.lote.producto',
        ])->findOrFail($id);

        $venta = $c->venta;
        $credito = $venta->credito;

        return Inertia::render('Comprobantes/VerComprobante', [
            'comprobante' => [
                'id_comprobante' => $c->id_comprobante,
                'numero_comprobante' => $c->numero_comprobante,
                'fecha_emision' => $c->fecha_emision?->format('Y-m-d H:i'),
                'total' => (string) $c->total,
                'veces_impreso' => (int) $c->veces_impreso,
                'anulado' => (bool) $c->anulado,
                'fecha_anulacion' => $c->fecha_anulacion?->format('Y-m-d H:i'),
                'vendedor' => $c->usuario ? trim($c->usuario->nombre . ' ' . $c->usuario->apellido) : null,
                'cliente' => $venta->cliente ? [
                    'nombre' => trim($venta->cliente->nombre_cliente . ' ' . $venta->cliente->apellido_cliente),
                    'numero' => $venta->cliente->numero_cliente,
                ] : null,
                'tipo_pago' => $credito ? 'credito' : 'contado',
                'credito' => $credito ? [
                    'fecha_vencimiento' => $credito->fecha_vencimiento?->format('Y-m-d'),
                    'saldo_pendiente' => (string) $credito->saldo_pendiente,
                    'estado' => $credito->estado,
                ] : null,
                'detalles' => $venta->detalles->map(fn($d) => [
                    'id_detalle' => $d->id_detalle,
                    'producto' => $d->lote?->producto?->nombre_producto,
                    'lote' => $d->lote?->nombre_lote,
                    'cantidad' => (int) $d->cantidad,
                    'precio_unitario' => (string) $d->precio_unitario,
                    'subtotal' => (string) $d->subtotal,
                    'descuento_porcentaje' => (float) $d->descuento_porcentaje,
                    'descuento_monto' => (string) $d->descuento_monto,
                ])->values(),
            ],
        ]);
    }

    public function impreso(int $id): JsonResponse
    {
        $c = Comprobante::findOrFail($id);
        $c->increment('veces_impreso');

        return response()->json(['veces_impreso' => (int) $c->fresh()->veces_impreso]);
    }

    // Anula el comprobante: devuelve el stock, excluye la venta de los totales y no se puede revertir
    public function anular(Request $request, int $id, ReportesService $reportes)
    {
        $fechaVenta = null;

        try {
            DB::transaction(function () use ($id, $request, &$fechaVenta) {
                $c = Comprobante::whereKey($id)->lockForUpdate()->firstOrFail();
                if ($c->anulado) {
                    throw ValidationException::withMessages(['comprobante' => 'Este comprobante ya está anulado.']);
                }

                $venta = $c->venta()->with(['detalles', 'credito.abonos'])->firstOrFail();
                if ($venta->credito && $venta->credito->abonos->isNotEmpty()) {
                    throw ValidationException::withMessages(['comprobante' => 'No se puede anular: el crédito de esta venta ya tiene abonos registrados.']);
                }

                // Devuelve al inventario lo que se descontó en la venta
                foreach ($venta->detalles->sortBy('fk_lote')->groupBy('fk_lote') as $idLote => $detalles) {
                    $lote = Lote::whereKey($idLote)->lockForUpdate()->first();
                    if ($lote) {
                        $lote->update([
                            'cantidad_disponible' => $lote->cantidad_disponible + $detalles->sum('cantidad'),
                            'activo' => true,
                        ]);
                    }
                }

                // El crédito deja de ser deuda del cliente
                if ($venta->credito) {
                    $venta->credito->update(['saldo_pendiente' => '0.00', 'estado' => 'pagado']);
                }

                $venta->update(['anulado' => true]);
                $c->update([
                    'anulado' => true,
                    'fecha_anulacion' => now(),
                    'fk_usuario_anulacion' => $request->user()->getAuthIdentifier(),
                ]);
                $fechaVenta = $venta->fecha_venta;
            });
        } catch (ValidationException $e) {
            return back()->with('flash', ['title' => 'No se pudo anular', 'icon' => 'error', 'message' => collect($e->errors())->flatten()->first()]);
        }

        // Recalcula los reportes ya generados que incluían esta venta
        $usuario = (int) $request->user()->getAuthIdentifier();
        ReporteVenta::whereDate('fecha_inicio', '<=', $fechaVenta)->whereDate('fecha_fin', '>=', $fechaVenta)->get()
            ->each(fn (ReporteVenta $r) => $reportes->generarReporteVentas($r->tipo_periodo, Carbon::parse($r->fecha_inicio), $usuario));
        ReporteGanancia::where('mes', $fechaVenta->month)->where('anio', $fechaVenta->year)->get()
            ->each(fn (ReporteGanancia $r) => $reportes->generarReporteGanancias((int) $r->mes, (int) $r->anio, $usuario));

        return back()->with('flash', ['title' => 'Comprobante anulado', 'icon' => 'success', 'message' => 'El stock se devolvió al inventario y la venta ya no cuenta en los reportes.']);
    }
}
