<?php

namespace App\Http\Controllers;

use App\Models\Permiso;
use App\Models\Rol;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RolController extends Controller
{
    private function validar(Request $request, ?Rol $rol = null): array
    {
        return $request->validate([
            'nombre_rol' => ['required', 'string', 'max:100', Rule::unique('roles', 'nombre_rol')->ignore($rol?->id_rol, 'id_rol')],
            'descripcion_rol' => 'nullable|string|max:255',
            'permisos' => 'nullable|array',
            'permisos.*' => 'string|exists:permisos,tipo_permiso',
        ], [
            'nombre_rol.required' => 'El nombre del rol es obligatorio.',
            'nombre_rol.unique' => 'Ya existe un rol con ese nombre.',
        ]);
    }

    private function sincronizar(Rol $rol, array $tipos): void
    {
        $rol->permisos()->sync(Permiso::whereIn('tipo_permiso', $tipos)->pluck('id_permisos')->all());
    }

    public function store(Request $request)
    {
        $datos = $this->validar($request);
        $rol = Rol::create(['nombre_rol' => $datos['nombre_rol'], 'descripcion_rol' => $datos['descripcion_rol'] ?? null]);
        $this->sincronizar($rol, $datos['permisos'] ?? []);

        return back()->with('flash', ['title' => 'Rol creado', 'icon' => 'success', 'message' => 'El rol y sus permisos se guardaron correctamente.']);
    }

    public function update(Request $request, Rol $rol)
    {
        if ($rol->nombre_rol === 'Administrador') {
            return $this->error('El rol Administrador siempre tiene todos los permisos y no se puede modificar.');
        }

        $datos = $this->validar($request, $rol);
        $rol->update(['nombre_rol' => $datos['nombre_rol'], 'descripcion_rol' => $datos['descripcion_rol'] ?? null]);
        $this->sincronizar($rol, $datos['permisos'] ?? []);

        return back()->with('flash', ['title' => 'Rol actualizado', 'icon' => 'success', 'message' => 'Los permisos se aplican de inmediato a sus usuarios.']);
    }

    public function destroy(Rol $rol)
    {
        if ($rol->nombre_rol === 'Administrador') {
            return $this->error('El rol Administrador no se puede eliminar.');
        }
        if ($rol->usuarios()->exists()) {
            return $this->error('Hay usuarios con este rol. Cámbiales el rol antes de eliminarlo.');
        }

        $rol->delete();

        return back()->with('flash', ['title' => 'Rol eliminado', 'icon' => 'success', 'message' => 'El rol se eliminó correctamente.']);
    }

    private function error(string $mensaje)
    {
        return back()->with('flash', ['title' => 'No se pudo completar', 'icon' => 'error', 'message' => $mensaje]);
    }
}
