<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PerfilController extends Controller
{
    public function mostrarPerfil(Request $request)
    {
        return Inertia::render('Perfil/Perfil', [
            'usuario' => $request->user()->only(['nombre', 'apellido', 'usuario']),
        ]);
    }

    public function actualizarPerfil(Request $request)
    {
        $usuario = $request->user();

        $datos = $request->validate([
            'nombre' => 'required|string|max:100',
            'apellido' => 'required|string|max:100',
            'usuario' => ['required', 'string', 'max:100', Rule::unique('usuarios', 'usuario')->ignore($usuario->id_usuario, 'id_usuario')],
            'password' => 'nullable|string|min:6|confirmed',
        ], [
            'nombre.required' => 'El nombre es obligatorio.',
            'apellido.required' => 'El apellido es obligatorio.',
            'usuario.required' => 'El campo usuario es obligatorio.',
            'usuario.unique' => 'Ese nombre de usuario ya está en uso.',
            'password.min' => 'La contraseña debe tener al menos 6 caracteres.',
            'password.confirmed' => 'La confirmación de la contraseña no coincide.',
        ]);

        $cambios = [
            'nombre' => $datos['nombre'],
            'apellido' => $datos['apellido'],
            'usuario' => $datos['usuario'],
        ];
        if (!empty($datos['password'])) {
            $cambios['password'] = $datos['password'];
        }

        Usuario::where('id_usuario', $usuario->id_usuario)->first()->update($cambios);

        return redirect()->route('perfil.index')->with('flash', [
            'title' => 'Éxito',
            'icon' => 'success',
            'message' => 'Perfil actualizado exitosamente.',
        ]);
    }
}
