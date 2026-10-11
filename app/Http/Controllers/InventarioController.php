<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Producto;
use App\Models\ImagenProducto;
use App\Models\Categoria;
use Illuminate\Support\Facades\DB;


class InventarioController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10); // Por defecto 10 por página
        $buscar = $request->input('buscar');
        $query = Producto::select([
            'id_producto',
            'producto',
            'descripcion',
            'estado',
            'estatus',
            'precio',
            'cantidad',
            'fk_id_imagen',
        ])->where('estatus', 'activo');

        if ($buscar) {
            $query->where('producto', 'like', "%$buscar%");
        }

        $productos = $query->paginate($perPage);

        // Obtener solo las imágenes de los productos en la página actual
        $imagenes = ImagenProducto::whereIn('id_imagen', $productos->pluck('fk_id_imagen'))
            ->get()
            ->map(function ($img) {
                $binario = is_resource($img->imagen_producto)
                    ? stream_get_contents($img->imagen_producto)
                    : $img->imagen_producto;
                return [
                    'id_imagen' => $img->id_imagen,
                    'imagen' => $img->imagen_producto !== null ? 'data:image/jpeg;base64,' . $binario : '/assets/productos/no-hay-imagen.jpg',
                ];
            });

        return Inertia::render('Inventario/Inventario', [
            'productos' => $productos,
            'imagenes' => $imagenes,
        ]);
    }
    public function editarDatos(Request $request)
    {
        $id = $request->input('id');
        $imagenes = ImagenProducto::where('id_imagen', $id)->get()->map(function ($img) {
            $binario = is_resource($img->imagen_producto)
                ? stream_get_contents($img->imagen_producto)
                : $img->imagen_producto;
            return [
                'id_imagen' => $img->id_imagen,
                'imagen' => $img->imagen_producto !== null ? 'data:image/jpeg;base64,' . $binario : '/assets/productos/no-hay-imagen.jpg',
            ];
        });

        $productos = Producto::select([
            'id_producto',
            'producto',
            'producto_plural',
            'descripcion',
            'codigo_barra',
            'precio',
            'cantidad',
            'fk_id_categoria',
        ])->where('id_producto', $id)->get();

        $categorias = Categoria::all();

        return Inertia::render('EditarProducto/EditarProducto', [
            'productos' => $productos,
            'imagenes' => $imagenes,
            'categorias' => $categorias,
        ]);
    }
    public function actualizar(Request $request)
    {
        $datos = $request->validate([
            'id' => 'required|integer',
            'producto' => 'required|string|max:100',
            'producto_plural' => 'required|string|max:100',
            'descripcion' => 'nullable|string|max:255',
            'codigo_barra' => 'required|string',
            'precio' => 'required|numeric',
            'cantidad' => 'required|integer',
            'imagen' => 'nullable|image|max:2048',
            'categoria' => 'required|numeric',
        ], [
            'producto.required' => 'El nombre del producto es obligatorio.',
            'codigo_barra.required' => 'El código de barra es obligatorio.',
            'producto_plural.required' => 'El nombre del producto plural es obligatorio.',
            'producto.string' => 'El nombre del producto debe ser una cadena de texto.',
            'producto.max' => 'El nombre del producto no debe exceder los 100 caracteres.',
            'descripcion.string' => 'La descripción debe ser una cadena de texto.',
            'descripcion.max' => 'La descripción no debe exceder los 255 caracteres.',
            'precio.required' => 'El precio es obligatorio.',
            'precio.numeric' => 'El precio debe ser un número.',
            'cantidad.required' => 'La cantidad es obligatoria.',
            'cantidad.integer' => 'La cantidad debe ser un número entero.',
            'imagen.image' => 'El archivo debe ser una imagen válida.',
            'imagen.max' => 'El tamaño de la imagen no debe exceder los 2MB.',
            'categoria.required' => 'La categoría es obligatoria.',
        ]);

        try {
            DB::beginTransaction();

            $producto = Producto::find($datos['id']);

            // Actualiza la imagen solo si se envía una nueva
            if ($request->hasFile('imagen')) {
                $archivo = $request->file('imagen');
                $nuevaImagen = base64_encode(file_get_contents($archivo->getRealPath()));
                $guardarImagen = ImagenProducto::find($producto->fk_id_imagen);
                $guardarImagen->imagen_producto = $nuevaImagen;
                $guardarImagen->save();
            }

            Producto::where('id_producto', $datos['id'])->update([
                'producto' => $datos['producto'],
                'producto_plural' => $datos['producto_plural'],
                'descripcion' => $datos['descripcion'],
                'codigo_barra' => $datos['codigo_barra'],
                'precio' => (float)$datos['precio'],
                'cantidad' => (int)$datos['cantidad'],
                'fk_id_categoria' => $datos['categoria'],
            ]);

            DB::commit();
            return redirect()->route('inventario.index')->with('flash', [
                'title' => 'Actualización exitosa',
                'message' => 'El producto se ha actualizado correctamente.',
                'icon' => 'success'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->route('inventario.index')->with('flash', [
                'title' => 'Error',
                'message' => 'Hubo un problema al actualizar el producto.',
                'icon' => 'error'
            ]);
        }
    }
    public function eliminar(Request $request)
    {
        $id = $request->input('id');
        $producto = Producto::find($id);
        try {
            DB::beginTransaction();
            if ($producto) {
                $producto->estatus = 'inactivo';
                $producto->save();
                DB::commit();
                return redirect()->route('inventario.index')->with('flash', [
                    'title' => 'Eliminación exitosa',
                    'message' => 'El producto se ha eliminado correctamente.',
                    'icon' => 'success'
                ]);
            }
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->route('inventario.index')->with('flash', [
                'title' => 'Error',
                'message' => 'Hubo un problema al eliminar el producto.',
                'icon' => 'error'
            ]);
        }
    }
    public function actualizarEstado(Request $request)
    {
        $id = $request->input('id');
        $producto = Producto::find($id);
        try {
            DB::beginTransaction();
            if ($producto) {
                $producto->estado = ($producto->estado === 'mostrado') ? 'oculto' : 'mostrado';
                $producto->save();
                DB::commit();
                return redirect()->route('inventario.index')->with('flash', [
                    'title' => 'Actualización de estado exitosa',
                    'message' => 'El estado del producto se ha actualizado correctamente.',
                    'icon' => 'success'
                ]);
            }
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->route('inventario.index')->with('flash', [
                'title' => 'Error',
                'message' => 'Hubo un error al actualizar el estado del producto.',
                'icon' => 'error'
            ]);
        }
    }
    public function agregar()
    {
        $categorias = Categoria::all();
        return Inertia::render('AgregarProducto/AgregarProducto', [
            'categorias' => $categorias,
        ]);
    }
    public function guardar(Request $request)
    {

        $datos = $request->validate([
            'producto' => 'required|string|max:100',
            'producto_plural' => 'required|string|max:100',
            'descripcion' => 'nullable|string|max:255',
            'codigo_barra' => 'required|string',
            'precio' => 'required|numeric',
            'cantidad' => 'required|integer',
            'imagen' => 'nullable|image|max:2048',
            'categoria' => 'required|numeric',
        ], [
            'producto.required' => 'El nombre del producto es obligatorio.',
            'codigo_barra.required' => 'El código de barra es obligatorio.',
            'producto_plural.required' => 'El nombre del producto plural es obligatorio.',
            'producto.string' => 'El nombre del producto debe ser una cadena de texto.',
            'producto.max' => 'El nombre del producto no debe exceder los 100 caracteres.',
            'descripcion.string' => 'La descripción debe ser una cadena de texto.',
            'descripcion.max' => 'La descripción no debe exceder los 255 caracteres.',
            'precio.required' => 'El precio es obligatorio.',
            'precio.numeric' => 'El precio debe ser un número.',
            'cantidad.required' => 'La cantidad es obligatoria.',
            'cantidad.integer' => 'La cantidad debe ser un número entero.',
            'imagen.image' => 'El archivo debe ser una imagen válida.',
            'imagen.max' => 'El tamaño de la imagen no debe exceder los 2MB.',
            'categoria.required' => 'La categoría es obligatoria.',
        ]);

        try {
            DB::beginTransaction();

            $nuevaImagen = null;
            if ($request->hasFile('imagen')) {
                $archivo = $request->file('imagen');
                $nuevaImagen = base64_encode(file_get_contents($archivo->getRealPath()));
            }
            $imagen = ImagenProducto::create([
                'imagen_producto' => $nuevaImagen,
            ]);
            Producto::create([
                'producto' => $datos['producto'],
                'producto_plural' => $datos['producto_plural'],
                'descripcion' => $datos['descripcion'],
                'codigo_barra' => $datos['codigo_barra'],
                'precio' => (float)$datos['precio'],
                'cantidad' => (int)$datos['cantidad'],
                'estado' => 'mostrado',
                'estatus' => 'activo',
                'fk_id_imagen' => $imagen->id_imagen,
                'fk_id_categoria' => $datos['categoria'],
            ]);
            DB::commit();
            return redirect()->route('inventario.index')->with('flash', [
                'title' => 'Producto agregado',
                'message' => 'El producto se ha agregado correctamente.',
                'icon' => 'success'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->route('inventario.index')->with('flash', [
                'title' => 'Error',
                'message' => 'Hubo un problema al agregar el producto.',
                'icon' => 'error'
            ]);
        }
    }
}
