<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Categoria;
use Illuminate\Support\Facades\DB;

class CategoriaController extends Controller
{
    public function index()
    {
        $categorias = Categoria::all();
        return Inertia::render('Categorias/Categorias', ['categorias' => $categorias]);
    }
    public function create(Request $request)
    {
        $validatedData = $request->validate([
            'categoria' => 'required|string|max:255|unique:categorias,categoria',
            'descripcion' => 'required|nullable|string|max:1000',
        ],
        [
            'categoria.required' => 'El nombre de la categoría es obligatorio.',
            'categoria.unique' => 'Ya existe una categoría con este nombre.',
            'categoria.max' => 'El nombre de la categoría no puede exceder los 255 caracteres.',
            'descripcion.max' => 'La descripción no puede exceder los 1000 caracteres.',
            'descripcion.required' => 'La descripción es obligatoria.',
        ]);
        try{
            DB::beginTransaction();
            $categoria = new Categoria();
            $categoria->categoria = $validatedData['categoria'];
            $categoria->descripcion = $validatedData['descripcion'];
            $categoria->save();
            DB::commit();
            return redirect()->route('categorias.index')->with(['flash' => ['icon' => 'success','title' => 'Éxito','message' => 'Categoría agregada exitosamente.']]);
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->route('categorias.index')->with(['flash' => ['icon' => 'error', 'title' => 'Error', 'message' => 'Error al agregar la categoría.']]);

        }
    }
}
