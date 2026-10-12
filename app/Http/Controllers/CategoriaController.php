<?php

namespace App\Http\Controllers;

use App\Models\Categoria;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoriaController extends Controller
{
    private const MENSAJES = [
        'nombre_categoria.required' => 'El nombre de la categoría es obligatorio.',
        'nombre_categoria.max' => 'El nombre de la categoría no puede superar 100 caracteres.',
        'nombre_categoria.unique' => 'Ya existe una categoría con ese nombre.',
    ];

    public function index()
    {
        return Inertia::render('Categorias/Categorias', [
            'categorias' => Categoria::withCount('productos')->orderBy('nombre_categoria')->get(['id_categoria', 'nombre_categoria']),
        ]);
    }

    public function crear(Request $request)
    {
        $datos = $request->validate([
            'nombre_categoria' => 'required|string|max:100|unique:categorias,nombre_categoria',
        ], self::MENSAJES);

        Categoria::create($datos);

        return redirect()->route('categorias.index')->with('flash', [
            'title' => 'Categoría creada', 'icon' => 'success', 'message' => 'La categoría se creó correctamente.',
        ]);
    }

    public function actualizar(Request $request, Categoria $categoria)
    {
        $datos = $request->validate([
            'nombre_categoria' => 'required|string|max:100|unique:categorias,nombre_categoria,' . $categoria->id_categoria . ',id_categoria',
        ], self::MENSAJES);

        $categoria->update($datos);

        return redirect()->route('categorias.index')->with('flash', [
            'title' => 'Categoría actualizada', 'icon' => 'success', 'message' => 'La categoría se actualizó correctamente.',
        ]);
    }

    public function eliminar(Categoria $categoria)
    {
        $total = $categoria->productos()->count();
        if ($total > 0) {
            return redirect()->route('categorias.index')->with('flash', [
                'title' => 'No se puede eliminar',
                'icon' => 'error',
                'message' => "La categoría tiene {$total} producto(s) asociado(s). Reasígnelos antes de eliminarla.",
            ]);
        }

        $categoria->delete();

        return redirect()->route('categorias.index')->with('flash', [
            'title' => 'Categoría eliminada', 'icon' => 'success', 'message' => 'La categoría se eliminó correctamente.',
        ]);
    }
}
