<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Permiso extends Model
{
    protected $table = 'permisos';
    protected $primaryKey = 'id_permisos';

    protected $fillable = ['tipo_permiso'];

    public function roles()
    {
        return $this->belongsToMany(Rol::class, 'rol_permiso', 'fk_permiso', 'fk_rol', 'id_permisos', 'id_rol');
    }
}
