<?php

namespace App\Http\Controllers;

use App\Models\Comprobante;
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
}
