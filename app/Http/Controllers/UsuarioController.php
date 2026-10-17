<?php

namespace App\Http\Controllers;

use App\Models\Permiso;
use App\Models\Rol;
use App\Models\Usuario;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UsuarioController extends Controller
{
    private const MENSAJES = [
        'nombre.required' => 'El nombre es obligatorio.',
        'apellido.required' => 'El apellido es obligatorio.',
        'usuario.required' => 'El nombre de usuario es obligatorio.',
        'usuario.unique' => 'Ese nombre de usuario ya está en uso.',
        'password.required' => 'La contraseña es obligatoria.',
        'password.min' => 'La contraseña debe tener al menos 6 caracteres.',
        'password.confirmed' => 'La confirmación de la contraseña no coincide.',
        'fk_rol.required' => 'Seleccione un rol.',
        'fk_rol.exists' => 'El rol seleccionado no existe.',
    ];

    public function index()
    {
        return Inertia::render('Usuarios/Usuarios', [
            'usuarios' => Usuario::with('rol:id_rol,nombre_rol')->orderBy('nombre')->get()
                ->map(fn (Usuario $u) => [
                    'id_usuario' => $u->id_usuario,
                    'nombre' => $u->nombre,
                    'apellido' => $u->apellido,
                    'usuario' => $u->usuario,
                    'fk_rol' => $u->fk_rol,
                    'rol' => $u->rol?->nombre_rol,
                ]),
            'roles' => Rol::with('permisos:id_permisos,tipo_permiso')->withCount('usuarios')->orderBy('nombre_rol')->get()
                ->map(fn (Rol $r) => [
                    'id_rol' => $r->id_rol,
                    'nombre_rol' => $r->nombre_rol,
                    'descripcion_rol' => $r->descripcion_rol,
                    'usuarios_count' => $r->usuarios_count,
                    'permisos' => $r->permisos->pluck('tipo_permiso')->values(),
                    'es_admin' => $r->nombre_rol === 'Administrador',
                ]),
            'permisos' => Permiso::orderBy('tipo_permiso')->pluck('tipo_permiso'),
        ]);
    }

    public function store(Request $request)
    {
        $datos = $request->validate([
            'nombre' => 'required|string|max:100',
            'apellido' => 'required|string|max:100',
            'usuario' => 'required|string|max:100|unique:usuarios,usuario',
            'password' => 'required|string|min:6|confirmed',
            'fk_rol' => 'required|integer|exists:roles,id_rol',
        ], self::MENSAJES);

        Usuario::create($datos);

        return back()->with('flash', ['title' => 'Usuario creado', 'icon' => 'success', 'message' => 'El usuario ya puede iniciar sesión.']);
    }

    public function update(Request $request, Usuario $usuario)
    {
        $datos = $request->validate([
            'nombre' => 'required|string|max:100',
            'apellido' => 'required|string|max:100',
            'usuario' => ['required', 'string', 'max:100', Rule::unique('usuarios', 'usuario')->ignore($usuario->id_usuario, 'id_usuario')],
            'password' => 'nullable|string|min:6|confirmed',
            'fk_rol' => 'required|integer|exists:roles,id_rol',
        ], self::MENSAJES);

        if ((int) $datos['fk_rol'] !== (int) $usuario->fk_rol && $this->esUltimoAdministrador($usuario)) {
            return $this->error('No se puede cambiar el rol: es el único Administrador del sistema.');
        }

        if (empty($datos['password'])) {
            unset($datos['password']);
        }
        $usuario->update($datos);

        return back()->with('flash', ['title' => 'Usuario actualizado', 'icon' => 'success', 'message' => 'Los datos del usuario se guardaron correctamente.']);
    }

    public function destroy(Request $request, Usuario $usuario)
    {
        if ($usuario->id_usuario === $request->user()->id_usuario) {
            return $this->error('No puedes eliminar tu propio usuario.');
        }
        if ($this->esUltimoAdministrador($usuario)) {
            return $this->error('No se puede eliminar al único Administrador del sistema.');
        }

        try {
            $usuario->delete();
        } catch (QueryException) {
            return $this->error('Este usuario ya tiene ventas u otros registros asociados y no se puede eliminar.');
        }

        return back()->with('flash', ['title' => 'Usuario eliminado', 'icon' => 'success', 'message' => 'El usuario se eliminó correctamente.']);
    }

    private function esUltimoAdministrador(Usuario $usuario): bool
    {
        return $usuario->rol?->nombre_rol === 'Administrador'
            && Usuario::whereHas('rol', fn ($q) => $q->where('nombre_rol', 'Administrador'))->count() <= 1;
    }

    private function error(string $mensaje)
    {
        return back()->with('flash', ['title' => 'No se pudo completar', 'icon' => 'error', 'message' => $mensaje]);
    }
}
