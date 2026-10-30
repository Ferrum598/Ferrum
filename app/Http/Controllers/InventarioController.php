<?php

namespace App\Http\Controllers;

use App\Models\Categoria;
use App\Models\CodigoBarra;
use App\Models\ImagenProducto;
use App\Models\Lote;
use App\Models\Producto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class InventarioController extends Controller
{
    private const MENSAJES = [
        'nombre_producto.required' => 'El nombre del producto es obligatorio.',
        'nombre_producto.max' => 'El nombre del producto no puede superar 100 caracteres.',
        'descripcion.max' => 'La descripción no puede superar 255 caracteres.',
        'fk_categoria.exists' => 'La categoría seleccionada no existe.',
        'imagen.image' => 'El archivo debe ser una imagen.',
        'imagen.max' => 'La imagen no puede pesar más de 2 MB.',
        'nombre_lote.max' => 'El nombre del lote no puede superar 100 caracteres.',
        'precio_compra.required' => 'El precio de compra es obligatorio.',
        'precio_compra.numeric' => 'El precio de compra debe ser un número.',
        'precio_compra.min' => 'El precio de compra no puede ser negativo.',
        'precio_venta.required' => 'El precio de venta es obligatorio.',
        'precio_venta.numeric' => 'El precio de venta debe ser un número.',
        'precio_venta.min' => 'El precio de venta no puede ser negativo.',
        'cantidad.required' => 'La cantidad es obligatoria.',
        'cantidad.integer' => 'La cantidad debe ser un número entero.',
        'cantidad.min' => 'La cantidad no puede ser negativa.',
        'cantidad_disponible.required' => 'La cantidad disponible es obligatoria.',
        'cantidad_disponible.integer' => 'La cantidad disponible debe ser un número entero.',
        'cantidad_disponible.min' => 'La cantidad disponible no puede ser negativa.',
        'fecha_ingreso.required' => 'La fecha de ingreso es obligatoria.',
        'fecha_ingreso.date' => 'La fecha de ingreso no es válida.',
        'activo.required' => 'Indique si el lote está activo.',
    ];

    private const REGLAS_PRODUCTO = [
        'nombre_producto' => 'required|string|max:100',
        'descripcion' => 'nullable|string|max:255',
        'fk_categoria' => 'nullable|integer|exists:categorias,id_categoria',
        'imagen' => 'nullable|image|max:2048',
    ];

    private const REGLAS_LOTE = [
        'nombre_lote' => 'nullable|string|max:100',
        'precio_compra' => 'required|numeric|min:0|max:99999999.99',
        'precio_venta' => 'required|numeric|min:0|max:99999999.99',
        'fecha_ingreso' => 'required|date',
    ];

    private function flash(string $icon, string $title, string $message): array
    {
        return ['title' => $title, 'icon' => $icon, 'message' => $message];
    }

    public function index(Request $request)
    {
        $perPage = max(1, min(100, (int) $request->input('per_page', 10)));
        $buscar = trim((string) $request->input('buscar', ''));

        $query = Producto::with(['categoria', 'imagen', 'lotes' => fn ($q) => $q->orderByDesc('fecha_ingreso')->orderByDesc('id_lote')])
            ->where('activo', true)
            ->orderBy('nombre_producto');

        if ($buscar !== '') {
            $like = '%' . mb_strtolower($buscar) . '%';
            $query->where(function ($q) use ($like) {
                $q->whereRaw('LOWER(nombre_producto) LIKE ?', [$like])
                    ->orWhereHas('lotes.codigos', fn ($c) => $c->whereRaw('LOWER(codigo) LIKE ?', [$like]));
            });
        }

        $productos = $query->paginate($perPage)->withQueryString();

        $productos->getCollection()->transform(function (Producto $p) {
            return [
                'id_producto' => $p->id_producto,
                'nombre_producto' => $p->nombre_producto,
                'descripcion' => $p->descripcion,
                'categoria' => $p->categoria?->nombre_categoria,
                'imagen' => $p->imagen ? $p->imagen->dataUri() : '/assets/productos/no-hay-imagen.jpg',
                'existencias' => (int) $p->lotes->where('activo', true)->sum('cantidad_disponible'),
                'lotes' => $p->lotes->map(fn (Lote $l) => [
                    'id_lote' => $l->id_lote,
                    'nombre_lote' => $l->nombre_lote,
                    'precio_compra' => (float) $l->precio_compra,
                    'precio_venta' => (float) $l->precio_venta,
                    'cantidad' => $l->cantidad,
                    'cantidad_disponible' => $l->cantidad_disponible,
                    'fecha_ingreso' => $l->fecha_ingreso?->format('Y-m-d'),
                    'activo' => $l->activo,
                ])->values(),
            ];
        });

        return Inertia::render('Inventario/Inventario', [
            'productos' => $productos,
            'buscar' => $buscar,
            'totalCompra' => (float) Lote::where('activo', true)
                ->whereHas('producto', fn ($q) => $q->where('activo', true))
                ->selectRaw('COALESCE(SUM(precio_compra * cantidad_disponible), 0) as total')
                ->value('total'),
        ]);
    }

    // IDs de todos los productos activos que coinciden con la búsqueda (para "seleccionar todos")
    public function idsProductos(Request $request)
    {
        $buscar = trim((string) $request->query('buscar', ''));
        $query = Producto::where('activo', true);

        if ($buscar !== '') {
            $like = '%' . mb_strtolower($buscar) . '%';
            $query->where(function ($q) use ($like) {
                $q->whereRaw('LOWER(nombre_producto) LIKE ?', [$like])
                    ->orWhereHas('lotes.codigos', fn ($c) => $c->whereRaw('LOWER(codigo) LIKE ?', [$like]));
            });
        }

        return response()->json($query->pluck('id_producto'));
    }

    public function imprimir()
    {
        return Inertia::render('Inventario/ImprimirInventario');
    }

    // Datos de los productos elegidos para el reporte impreso
    public function datosImpresion(Request $request)
    {
        $datos = $request->validate(['ids' => 'required|array|min:1', 'ids.*' => 'integer']);

        $productos = Producto::with(['categoria', 'lotes' => fn ($q) => $q->where('activo', true)])
            ->where('activo', true)
            ->whereIn('id_producto', $datos['ids'])
            ->orderBy('nombre_producto')
            ->get()
            ->map(fn (Producto $p) => [
                'id_producto' => $p->id_producto,
                'nombre_producto' => $p->nombre_producto,
                'categoria' => $p->categoria?->nombre_categoria,
                'existencias' => (int) $p->lotes->sum('cantidad_disponible'),
                'precio_min' => $p->lotes->isNotEmpty() ? (float) $p->lotes->min('precio_venta') : null,
                'precio_max' => $p->lotes->isNotEmpty() ? (float) $p->lotes->max('precio_venta') : null,
            ]);

        return response()->json($productos);
    }

    public function crear()
    {
        return Inertia::render('AgregarProducto/AgregarProducto', [
            'categorias' => Categoria::orderBy('nombre_categoria')->get(['id_categoria', 'nombre_categoria']),
        ]);
    }

    public function guardar(Request $request)
    {
        $datos = $request->validate(array_merge(self::REGLAS_PRODUCTO, self::REGLAS_LOTE, [
            'cantidad' => 'required|integer|min:0|max:99999999',
        ]), self::MENSAJES);

        DB::transaction(function () use ($request, $datos) {
            $imagen = $request->hasFile('imagen') ? ImagenProducto::desdeArchivo($request->file('imagen')) : null;

            $producto = Producto::create([
                'nombre_producto' => $datos['nombre_producto'],
                'descripcion' => $datos['descripcion'] ?? null,
                'fk_categoria' => $datos['fk_categoria'] ?? null,
                'fk_imagen_producto' => $imagen?->id_imagen_producto,
                'activo' => true,
            ]);

            $lote = $producto->lotes()->create([
                'nombre_lote' => $datos['nombre_lote'] ?? null,
                'precio_compra' => $datos['precio_compra'],
                'precio_venta' => $datos['precio_venta'],
                'cantidad' => $datos['cantidad'],
                'cantidad_disponible' => $datos['cantidad'],
                'fecha_ingreso' => $datos['fecha_ingreso'],
                'activo' => true,
            ]);

            CodigoBarra::generarParaLote($lote, Auth::id());
        });

        return redirect()->route('inventario.index')->with('flash', $this->flash('success', 'Producto agregado', 'El producto y su primer lote se registraron correctamente.'));
    }

    public function editar(Producto $producto)
    {
        return Inertia::render('EditarProducto/EditarProducto', [
            'producto' => [
                'id_producto' => $producto->id_producto,
                'nombre_producto' => $producto->nombre_producto,
                'descripcion' => $producto->descripcion,
                'fk_categoria' => $producto->fk_categoria,
                'imagen' => $producto->imagen ? $producto->imagen->dataUri() : null,
            ],
            'categorias' => Categoria::orderBy('nombre_categoria')->get(['id_categoria', 'nombre_categoria']),
            'descuentos' => $producto->descuentos()->get(['id_descuento', 'cantidad_minima', 'porcentaje']),
        ]);
    }

    public function guardarDescuento(Request $request, Producto $producto)
    {
        $datos = $request->validate([
            'cantidad_minima' => 'required|integer|min:2|max:99999999',
            'porcentaje' => 'required|numeric|gt:0|max:100',
        ], [
            'cantidad_minima.required' => 'Indique desde qué cantidad aplica el descuento.',
            'cantidad_minima.min' => 'La cantidad mínima debe ser 2 o más.',
            'porcentaje.required' => 'Indique el porcentaje de descuento.',
            'porcentaje.gt' => 'El descuento debe ser mayor a 0.',
            'porcentaje.max' => 'El descuento no puede ser mayor a 100%.',
        ]);

        // Una sola regla por cantidad mínima: si ya existe, se actualiza su porcentaje
        $producto->descuentos()->updateOrCreate(['cantidad_minima' => $datos['cantidad_minima']], ['porcentaje' => $datos['porcentaje']]);

        return back()->with('flash', $this->flash('success', 'Descuento guardado', 'Se aplicará automáticamente en las ventas.'));
    }

    public function eliminarDescuento(\App\Models\DescuentoProducto $descuento)
    {
        $descuento->delete();

        return back()->with('flash', $this->flash('success', 'Descuento eliminado', 'La regla de descuento se eliminó.'));
    }

    public function actualizar(Request $request, Producto $producto)
    {
        $datos = $request->validate(self::REGLAS_PRODUCTO, self::MENSAJES);

        DB::transaction(function () use ($request, $datos, $producto) {
            if ($request->hasFile('imagen')) {
                $imagen = ImagenProducto::desdeArchivo($request->file('imagen'));
                $producto->fk_imagen_producto = $imagen->id_imagen_producto;
            }
            $producto->nombre_producto = $datos['nombre_producto'];
            $producto->descripcion = $datos['descripcion'] ?? null;
            $producto->fk_categoria = $datos['fk_categoria'] ?? null;
            $producto->save();
        });

        return redirect()->route('inventario.index')->with('flash', $this->flash('success', 'Producto actualizado', 'Los datos del producto se actualizaron correctamente.'));
    }

    // Baja lógica: nunca se borra físicamente porque las ventas referencian sus lotes
    public function eliminar(Producto $producto)
    {
        DB::transaction(function () use ($producto) {
            $producto->update(['activo' => false]);
            $producto->lotes()->update(['activo' => false]);
        });

        return redirect()->route('inventario.index')->with('flash', $this->flash('success', 'Producto eliminado', 'El producto y sus lotes fueron dados de baja.'));
    }

    public function crearLote(Producto $producto)
    {
        return Inertia::render('AgregarLote/AgregarLote', [
            'producto' => ['id_producto' => $producto->id_producto, 'nombre_producto' => $producto->nombre_producto],
            'lote' => null,
        ]);
    }

    public function guardarLote(Request $request, Producto $producto)
    {
        $datos = $request->validate(array_merge(self::REGLAS_LOTE, [
            'cantidad' => 'required|integer|min:0|max:99999999',
        ]), self::MENSAJES);

        DB::transaction(function () use ($producto, $datos) {
            $lote = $producto->lotes()->create([
                'nombre_lote' => $datos['nombre_lote'] ?? null,
                'precio_compra' => $datos['precio_compra'],
                'precio_venta' => $datos['precio_venta'],
                'cantidad' => $datos['cantidad'],
                'cantidad_disponible' => $datos['cantidad'],
                'fecha_ingreso' => $datos['fecha_ingreso'],
                'activo' => true,
            ]);
            CodigoBarra::generarParaLote($lote, Auth::id());
        });

        return redirect()->route('inventario.index')->with('flash', $this->flash('success', 'Lote agregado', 'El nuevo lote se registró correctamente.'));
    }

    public function agregarStockLote(Request $request, Lote $lote)
    {
        $datos = $request->validate([
            'cantidad' => 'required|integer|min:1|max:99999999',
        ], [
            'cantidad.required' => 'La cantidad a ingresar es obligatoria.',
            'cantidad.integer' => 'La cantidad a ingresar debe ser un número entero.',
            'cantidad.min' => 'La cantidad a ingresar debe ser mayor a 0.',
        ]);

        $cantidad = (int) $datos['cantidad'];

        $lote->update([
            'cantidad' => $lote->cantidad + $cantidad,
            'cantidad_disponible' => $lote->cantidad_disponible + $cantidad,
            'activo' => true,
        ]);

        return redirect()->route('inventario.index')->with('flash', $this->flash('success', 'Stock agregado', 'Se agregaron ' . $cantidad . ' unidades al lote.'));
    }

    public function editarLote(Lote $lote)
    {
        $lote->load('producto');

        return Inertia::render('AgregarLote/AgregarLote', [
            'producto' => ['id_producto' => $lote->producto->id_producto, 'nombre_producto' => $lote->producto->nombre_producto],
            'lote' => [
                'id_lote' => $lote->id_lote,
                'nombre_lote' => $lote->nombre_lote,
                'precio_compra' => (float) $lote->precio_compra,
                'precio_venta' => (float) $lote->precio_venta,
                'cantidad' => $lote->cantidad,
                'cantidad_disponible' => $lote->cantidad_disponible,
                'fecha_ingreso' => $lote->fecha_ingreso?->format('Y-m-d'),
                'activo' => $lote->activo,
            ],
        ]);
    }

    public function actualizarLote(Request $request, Lote $lote)
    {
        $datos = $request->validate(array_merge(self::REGLAS_LOTE, [
            'cantidad_disponible' => 'required|integer|min:0|max:99999999',
            'activo' => 'required|boolean',
        ]), self::MENSAJES);

        $disponible = (int) $datos['cantidad_disponible'];
        $activo = (bool) $datos['activo'];

        // Reposición de un lote agotado: se reactiva
        if ($lote->cantidad_disponible === 0 && $disponible > 0) {
            $activo = true;
        }

        $lote->update([
            'nombre_lote' => $datos['nombre_lote'] ?? null,
            'precio_compra' => $datos['precio_compra'],
            'precio_venta' => $datos['precio_venta'],
            'fecha_ingreso' => $datos['fecha_ingreso'],
            'cantidad_disponible' => $disponible,
            // Si se repone por encima de lo ingresado, la cantidad total se ajusta
            'cantidad' => max($lote->cantidad, $disponible),
            'activo' => $activo,
        ]);

        return redirect()->route('inventario.index')->with('flash', $this->flash('success', 'Lote actualizado', 'Los datos del lote se actualizaron correctamente.'));
    }
}
