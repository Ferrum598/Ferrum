<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Usuario;
use App\Models\Imagen;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class PerfilController extends Controller
{
    public function mostrarPerfil(Request $request)
    {
        $usuarioId = $request->user()->id_usuario;

        $usuario = Usuario::where('id_usuario', $usuarioId)->first();
        $imagenEncontrada = null;
        if($usuario && $usuario->fk_id_imagen) {
            $imagen = Imagen::find($usuario->fk_id_imagen);
            if ($imagen != null) {
                $binario = is_resource($imagen->imagen) ? stream_get_contents($imagen->imagen) : $imagen->imagen;
                $imagenEncontrada = 'data:image/jpeg;base64,' . $binario;
            }

        }

        if (!$usuario) {
            return redirect()->back()->with('error', 'Usuario no encontrado.');
        }

        return Inertia::render('Perfil/Perfil', [
            'usuario' => $usuario,
            'imagene' => $imagenEncontrada,
        ]);
    }
    public function actualizarPerfil(Request $request)
    {
        $usuarioId = $request->user()->id_usuario;

        $request->validate([
            'usuario' => 'required|string',
            'imagen' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'nit' => 'nullable|string',
            'nit2' => 'nullable|string',
            'telefono' => 'nullable|string',
            'direccion' => 'nullable|string',
        ],
        [
            'usuario.required' => 'El campo usuario es obligatorio.',
            'usuario.string' => 'El campo usuario debe ser una cadena de texto.',
            'imagen.image' => 'El archivo debe ser una imagen.',
            'imagen.mimes' => 'La imagen debe ser un archivo de tipo: jpeg, png, jpg, gif.',
            'imagen.max' => 'La imagen no debe exceder los 2MB.',
        ]);

        DB::beginTransaction();
        try{

        if ($request->hasFile('imagen')) {
            $imagenArchivo = $request->file('imagen');
            $imagenBinaria = base64_encode(file_get_contents($imagenArchivo->getRealPath()));

            $imagen = Imagen::updateOrCreate(
                ['id_imagen' => $request->user()->fk_id_imagen],
                ['imagen' => $imagenBinaria]
            );

            $usuario = Usuario::find($usuarioId);
            $usuario->fk_id_imagen = $imagen->id_imagen;
            $usuario->save();
        }

        $usuario = Usuario::find($usuarioId);
        if (!$usuario) {
            return redirect()->back()->with(['flash' => ['title'=>'Error', 'icon' => 'error', 'message' => 'Usuario no encontrado.']]);
        }
        $usuario->usuario = $request->input('usuario');
        $usuario->nit = $request->input('nit');
        $usuario->nit2 = $request->input('nit2');
        $usuario->telefono = $request->input('telefono');
        $usuario->direccion = $request->input('direccion');
        $usuario->save();
        DB::commit();
         return redirect()->route('perfil.index')->with(['flash' => ['title'=>'Éxito','icon' => 'success', 'message' => 'Perfil actualizado exitosamente.']]);
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('flash', ['title'=>'Error', 'icon' => 'error', 'message' => 'Error al actualizar el perfil']);
        }
       
    }
}
