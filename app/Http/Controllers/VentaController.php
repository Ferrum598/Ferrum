<?php

namespace App\Http\Controllers;

use App\Models\Comprobante;
use App\Models\Credito;
use App\Models\Lote;
use App\Models\Venta;
use App\Models\DetalleVenta;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class VentaController extends Controller
{
    // Pantalla del punto de venta
    public function index()
    {
        return Inertia::render('Ventas/Ventas');
    }

    private function formatearLote(Lote $lote): array
    {
        return [
            'id_lote' => $lote->id_lote,
            'nombre_lote' => $lote->nombre_lote,
            'precio_venta' => (string) $lote->precio_venta,
            'cantidad_disponible' => (int) $lote->cantidad_disponible,
            'fecha_ingreso' => $lote->fecha_ingreso?->format('Y-m-d'),
        ];
    }

    // Productos con sus lotes activos y con stock
    public function buscar(Request $request): JsonResponse
    {
        $q = trim((string) $request->query('q', ''));

        $paginado = \App\Models\Producto::query()
            ->where('activo', true)
            ->whereHas('lotesDisponibles')
            ->when($q !== '', fn($query) => $query->where('nombre_producto', 'like', "%{$q}%"))
            ->with(['categoria:id_categoria,nombre_categoria', 'lotesDisponibles' => fn($query) => $query->orderBy('fecha_ingreso')->orderBy('id_lote')])
            ->orderBy('nombre_producto')
            ->paginate(12)
            ->through(fn($p) => [
                'id_producto' => $p->id_producto,
                'nombre_producto' => $p->nombre_producto,
                'categoria' => $p->categoria?->nombre_categoria,
                'imagen' => $p->fk_imagen_producto
                    ? route('ventas.imagen', $p->id_producto) . '?v=' . $p->fk_imagen_producto
                    : '/assets/productos/no-hay-imagen.jpg',
                'lotes' => $p->lotesDisponibles->map(fn($l) => $this->formatearLote($l))->values(),
            ]);

        return response()->json($paginado);
    }

    // Sirve la imagen del producto como archivo cacheable (evita enviar base64 en el listado)
    public function imagen(int $id)
    {
        $producto = \App\Models\Producto::with('imagen')->findOrFail($id);
        $raw = $producto->imagen?->imagen;
        if (is_resource($raw)) {
            $raw = stream_get_contents($raw);
        }
        $binario = $raw ? base64_decode($raw, true) : false;
        if ($binario === false) {
            abort(404);
        }

        return response($binario, 200, [
            'Content-Type' => (new \finfo(FILEINFO_MIME_TYPE))->buffer($binario) ?: 'image/jpeg',
            'Cache-Control' => 'public, max-age=604800',
        ]);
    }

    // Lote activo con stock asociado a un código de barras
    public function porCodigo(string $codigo): JsonResponse
    {
        $lote = Lote::query()
            ->where('activo', true)
            ->where('cantidad_disponible', '>', 0)
            ->whereHas('codigos', fn($q) => $q->where('codigo', $codigo)->where('activo', true))
            ->with('producto')
            ->first();

        if (!$lote) {
            return response()->json(['found' => false, 'message' => 'No se encontró un lote disponible con ese código.'], 404);
        }

        return response()->json([
            'found' => true,
            'producto' => $lote->producto?->nombre_producto,
            'lote' => $this->formatearLote($lote),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.id_lote' => ['required', 'integer'],
            'items.*.cantidad' => ['required', 'integer', 'min:1'],
            'fk_cliente' => ['nullable', 'integer', 'exists:clientes,id_cliente'],
            'tipo_pago' => ['required', 'in:contado,credito'],
            'fecha_vencimiento' => ['required_if:tipo_pago,credito', 'nullable', 'date', 'after:today'],
            'descripcion' => ['nullable', 'string', 'max:255'],
        ], [
            'items.required' => 'Agregue al menos un producto a la venta.',
            'items.min' => 'Agregue al menos un producto a la venta.',
            'fecha_vencimiento.required_if' => 'La fecha de vencimiento es obligatoria para ventas a crédito.',
            'fecha_vencimiento.after' => 'La fecha de vencimiento debe ser posterior a hoy.',
            'fk_cliente.exists' => 'El cliente seleccionado no existe.',
        ]);

        $esCredito = $datos['tipo_pago'] === 'credito';
        if ($esCredito && empty($datos['fk_cliente'])) {
            throw ValidationException::withMessages(['fk_cliente' => 'Seleccione un cliente para una venta a crédito.']);
        }

        // Une ítems repetidos del mismo lote
        $cantidades = [];
        foreach ($datos['items'] as $item) {
            $id = (int) $item['id_lote'];
            $cantidades[$id] = ($cantidades[$id] ?? 0) + (int) $item['cantidad'];
        }
        ksort($cantidades);

        $comprobante = DB::transaction(function () use ($cantidades, $datos, $esCredito) {
            $lotes = Lote::whereIn('id_lote', array_keys($cantidades))
                ->orderBy('id_lote')
                ->lockForUpdate()
                ->get()
                ->keyBy('id_lote');

            $total = 0.0;
            $lineas = [];
            foreach ($cantidades as $idLote => $cantidad) {
                $lote = $lotes->get($idLote);
                if (!$lote || !$lote->activo) {
                    throw ValidationException::withMessages(['items' => "El lote #{$idLote} no está disponible."]);
                }
                if ($cantidad > $lote->cantidad_disponible) {
                    throw ValidationException::withMessages([
                        'items' => "Stock insuficiente en el lote {$lote->nombre_lote}: disponibles {$lote->cantidad_disponible}.",
                    ]);
                }
                $subtotal = round((float) $lote->precio_venta * $cantidad, 2);
                $total += $subtotal;
                $lineas[] = [$lote, $cantidad, $subtotal];
            }
            $total = round($total, 2);

            $venta = Venta::create([
                'fecha_venta' => now(),
                'total' => $total,
                'fk_cliente' => $datos['fk_cliente'] ?? null,
                'fk_usuario' => Auth::id(),
            ]);

            foreach ($lineas as [$lote, $cantidad, $subtotal]) {
                DetalleVenta::create([
                    'fk_venta' => $venta->id_venta,
                    'fk_lote' => $lote->id_lote,
                    'cantidad' => $cantidad,
                    'precio_unitario' => $lote->precio_venta,
                    'costo_unitario' => $lote->precio_compra,
                    'subtotal' => $subtotal,
                ]);
                $restante = $lote->cantidad_disponible - $cantidad;
                $lote->update([
                    'cantidad_disponible' => $restante,
                    'activo' => $restante > 0,
                ]);
            }

            $comprobante = Comprobante::create([
                'fk_venta' => $venta->id_venta,
                'fk_usuario' => Auth::id(),
                'numero_comprobante' => Comprobante::siguienteNumero(),
                'fecha_emision' => now(),
                'total' => $total,
                'veces_impreso' => 0,
            ]);

            if ($esCredito) {
                Credito::create([
                    'fk_cliente' => $datos['fk_cliente'],
                    'fk_venta' => $venta->id_venta,
                    'fk_usuario' => Auth::id(),
                    'monto_total' => $total,
                    'saldo_pendiente' => $total,
                    'fecha_inicio' => now()->toDateString(),
                    'fecha_vencimiento' => $datos['fecha_vencimiento'],
                    'estado' => 'pendiente',
                    'descripcion' => $datos['descripcion'] ?? null,
                ]);
            }

            return $comprobante;
        });

        return response()->json([
            'ok' => true,
            'id_venta' => $comprobante->fk_venta,
            'id_comprobante' => $comprobante->id_comprobante,
            'numero_comprobante' => $comprobante->numero_comprobante,
            'total' => (string) $comprobante->total,
        ], 201);
    }

    public function historial(Request $request)
    {
        $filtros = $request->only(['desde', 'hasta', 'cliente', 'tipo']);

        $ventas = Venta::query()
            ->with(['cliente', 'usuario', 'comprobante', 'credito'])
            ->when($filtros['desde'] ?? null, fn($q, $v) => $q->whereDate('fecha_venta', '>=', $v))
            ->when($filtros['hasta'] ?? null, fn($q, $v) => $q->whereDate('fecha_venta', '<=', $v))
            ->when($filtros['cliente'] ?? null, function ($q, $v) {
                $q->whereHas('cliente', function ($c) use ($v) {
                    $c->where('nombre_cliente', 'like', "%{$v}%")
                        ->orWhere('apellido_cliente', 'like', "%{$v}%");
                });
            })
            ->when(($filtros['tipo'] ?? null) === 'credito', fn($q) => $q->whereHas('credito'))
            ->when(($filtros['tipo'] ?? null) === 'contado', fn($q) => $q->whereDoesntHave('credito'))
            ->orderByDesc('fecha_venta')
            ->orderByDesc('id_venta')
            ->paginate(15)
            ->withQueryString()
            ->through(fn(Venta $v) => [
                'id_venta' => $v->id_venta,
                'fecha_venta' => $v->fecha_venta?->format('Y-m-d H:i'),
                'total' => (string) $v->total,
                'cliente' => $v->cliente ? trim($v->cliente->nombre_cliente . ' ' . $v->cliente->apellido_cliente) : null,
                'vendedor' => $v->usuario ? trim($v->usuario->nombre . ' ' . $v->usuario->apellido) : null,
                'tipo_pago' => $v->credito ? 'credito' : 'contado',
                'id_comprobante' => $v->comprobante?->id_comprobante,
                'numero_comprobante' => $v->comprobante?->numero_comprobante,
                'anulado' => (bool) $v->anulado,
            ]);

        return Inertia::render('Ventas/Historial', [
            'ventas' => $ventas,
            'filtros' => (object) $filtros,
        ]);
    }
}
