<?php

namespace App\Http\Controllers;

use App\Models\Producto;
use App\Models\ImagenProducto;
use App\Models\Categoria;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class CatalogoController extends Controller
{
    public function index()
    {
        $usuario = Auth::user();
        $rol = $usuario->rol->rol;

        $buscar = request('buscar');
        $categoria = request('categoria');

        $query = Producto::select([
            'id_producto',
            'producto',
            'descripcion',
            'codigo_barra',
            'precio',
            'cantidad',
            'estado',
            'estatus',
            'fk_id_imagen',
            'fk_id_categoria',
        ])
            ->where('estatus', 'activo')
            ->where('cantidad', '>', 0);

        // Filtro búsqueda
        if ($buscar) {
            $query->where(function ($q) use ($buscar) {
                $q->where('producto', 'like', "%$buscar%")
                    ->orWhere('codigo_barra', 'like', "%$buscar%");
            });
        }

        // Filtro categoría
        if ($categoria) {
            $query->where('fk_id_categoria', $categoria);
        }

        // Aplicar filtros según el rol usando switch
        switch ($rol) {
            case 'Administrador':
            case 'Empleado':
                // No aplicar filtro de estado - mostrar todos
                break;

            case 'Escuela':
            default:
                // Solo productos mostrados para Escuela y otros roles
                $query->where('estado', 'mostrado');
                break;
        }

        $productos = $query->paginate(12)->withQueryString(); // 12 productos por página, ajustable

        $imagenes = ImagenProducto::select()
            ->whereIn('id_imagen', $productos->pluck('fk_id_imagen'))
            ->get()
            ->map(function ($img) {
                $binario = is_resource($img->imagen_producto)
                    ? stream_get_contents($img->imagen_producto)
                    : $img->imagen_producto;
                return [
                    'id_imagen' => $img->id_imagen,
                    'imagen' => $img->imagen_producto !== null
                        ? 'data:image/jpeg;base64,' . $binario
                        : '/assets/productos/no-hay-imagen.jpg',
                ];
            });

        $categorias = Categoria::all();
        return Inertia::render('Catalogo/Catalogo', [
            'productos' => $productos,
            'imagenes' => $imagenes,
            'categorias' => $categorias,
        ]);
    }
}
