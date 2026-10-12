<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;

class Usuario extends Authenticatable
{
    protected $table = 'usuarios';
    protected $primaryKey = 'id_usuario';

    protected $fillable = [
        'nombre',
        'apellido',
        'usuario',
        'password',
        'fk_rol',
    ];

    protected $hidden = [
        'password',
    ];

    protected function casts(): array
    {
        return ['password' => 'hashed'];
    }

    public function rol()
    {
        return $this->belongsTo(Rol::class, 'fk_rol', 'id_rol');
    }

    public function ventas()
    {
        return $this->hasMany(Venta::class, 'fk_usuario', 'id_usuario');
    }

    // Verdadero si el rol del usuario tiene el permiso indicado (el Administrador siempre tiene acceso)
    public function tienePermiso(string $permiso): bool
    {
        $rol = $this->rol;
        if (!$rol) {
            return false;
        }
        if ($rol->nombre_rol === 'Administrador') {
            return true;
        }
        return $rol->permisos()->where('tipo_permiso', $permiso)->exists();
    }
}
