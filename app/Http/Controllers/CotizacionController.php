<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use App\Models\Cotizacion;
use App\Models\Producto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CotizacionController extends Controller
{
    public function index(Request $request)
    {
        $q = trim((string) $request->query('q', ''));

        $cotizaciones = Cotizacion::query()
            ->with('cliente:id_cliente,nombre_cliente,apellido_cliente')
            ->when($q !== '', fn($query) => $query->where(function ($w) use ($q) {
                $like = '%' . mb_strtolower($q) . '%';
                $w->whereRaw('LOWER(numero_cotizacion) LIKE ?', [$like])->orWhereRaw('LOWER(nombre_cliente) LIKE ?', [$like]);
            }))
            ->orderByDesc('id_cotizacion')
            ->paginate(15)
            ->withQueryString()
            ->through(fn($c) => [
                'id_cotizacion' => $c->id_cotizacion,
                'numero_cotizacion' => $c->numero_cotizacion,
                'cliente' => $this->nombreCliente($c),
                'fecha_emision' => $c->fecha_emision?->format('Y-m-d'),
                'valida_hasta' => $c->valida_hasta?->format('Y-m-d'),
                'total' => (float) $c->total,
            ]);

        return Inertia::render('Cotizaciones/Cotizaciones', ['cotizaciones' => $cotizaciones, 'filtros' => ['q' => $q]]);
    }

    public function create()
    {
        $clientes = Cliente::orderBy('nombre_cliente')->get(['id_cliente', 'nombre_cliente', 'apellido_cliente']);

        return Inertia::render('Cotizaciones/CrearCotizacion', ['clientes' => $clientes]);
    }

    // Búsqueda de productos por texto (máx. 15 resultados) para el autocompletado
    public function buscarProductos(Request $request)
    {
        $q = trim((string) $request->query('q', ''));
        if (mb_strlen($q) < 2) {
            return response()->json([]);
        }

        $productos = Producto::where('activo', true)
            ->whereRaw('LOWER(nombre_producto) LIKE ?', ['%' . mb_strtolower($q) . '%'])
            ->whereHas('lotesDisponibles')
            ->with('lotesDisponibles')
            ->orderBy('nombre_producto')
            ->limit(15)
            ->get()
            ->map(fn($p) => [
                'id_producto' => $p->id_producto,
                'nombre' => $p->nombre_producto,
                'precio' => (float) $p->lotesDisponibles->min('precio_venta'),
            ]);

        return response()->json($productos);
    }

    public function store(Request $request)
    {
        $datos = $request->validate([
            'fk_cliente' => 'nullable|exists:clientes,id_cliente',
            'nombre_cliente' => 'nullable|string|max:150',
            'valida_hasta' => 'nullable|date|after_or_equal:today',
            'notas' => 'nullable|string|max:500',
            'items' => 'required|array|min:1',
            'items.*.descripcion' => 'required|string|max:200',
            'items.*.cantidad' => 'required|integer|min:1',
            'items.*.precio_unitario' => 'required|numeric|min:0',
        ], [
            'items.required' => 'Agrega al menos un producto a la cotización.',
            'items.min' => 'Agrega al menos un producto a la cotización.',
        ]);

        $cotizacion = DB::transaction(function () use ($datos, $request) {
            $total = collect($datos['items'])->sum(fn($i) => round($i['cantidad'] * $i['precio_unitario'], 2));

            $cotizacion = Cotizacion::create([
                'numero_cotizacion' => 'TMP-' . uniqid(),
                'fk_usuario' => $request->user()->getAuthIdentifier(),
                'fk_cliente' => $datos['fk_cliente'] ?? null,
                'nombre_cliente' => $datos['nombre_cliente'] ?? null,
                'fecha_emision' => now()->toDateString(),
                'valida_hasta' => $datos['valida_hasta'] ?? null,
                'total' => $total,
                'notas' => $datos['notas'] ?? null,
            ]);
            $cotizacion->update(['numero_cotizacion' => 'COT-' . now()->format('Y') . '-' . str_pad((string) $cotizacion->id_cotizacion, 5, '0', STR_PAD_LEFT)]);

            foreach ($datos['items'] as $item) {
                $cotizacion->detalles()->create([
                    'descripcion' => $item['descripcion'],
                    'cantidad' => $item['cantidad'],
                    'precio_unitario' => $item['precio_unitario'],
                    'subtotal' => round($item['cantidad'] * $item['precio_unitario'], 2),
                ]);
            }
            return $cotizacion;
        });

        return redirect()->route('cotizaciones.show', $cotizacion->id_cotizacion)
            ->with('flash', ['title' => 'Cotización creada', 'icon' => 'success', 'message' => 'La cotización se registró correctamente.']);
    }

    public function show(int $id)
    {
        $c = Cotizacion::with(['detalles', 'cliente', 'usuario'])->findOrFail($id);

        return Inertia::render('Cotizaciones/VerCotizacion', [
            'cotizacion' => [
                'id_cotizacion' => $c->id_cotizacion,
                'numero_cotizacion' => $c->numero_cotizacion,
                'cliente' => $this->nombreCliente($c),
                'atendio' => $c->usuario?->nombre ?? null,
                'fecha_emision' => $c->fecha_emision?->format('Y-m-d'),
                'valida_hasta' => $c->valida_hasta?->format('Y-m-d'),
                'total' => (float) $c->total,
                'notas' => $c->notas,
                'detalles' => $c->detalles->map(fn($d) => [
                    'id' => $d->id_detalle_cotizacion,
                    'descripcion' => $d->descripcion,
                    'cantidad' => (int) $d->cantidad,
                    'precio_unitario' => (float) $d->precio_unitario,
                    'subtotal' => (float) $d->subtotal,
                ]),
            ],
        ]);
    }

    public function destroy(int $id)
    {
        Cotizacion::findOrFail($id)->delete();
        return redirect()->route('cotizaciones.index')
            ->with('flash', ['title' => 'Cotización eliminada', 'icon' => 'success', 'message' => 'La cotización se eliminó correctamente.']);
    }

    private function nombreCliente(Cotizacion $c): string
    {
        if ($c->cliente) {
            return trim($c->cliente->nombre_cliente . ' ' . $c->cliente->apellido_cliente);
        }
        return $c->nombre_cliente ?: 'Cliente general';
    }
}
