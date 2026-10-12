<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rol extends Model
{
    protected $table = 'roles';
    protected $primaryKey = 'id_rol';

    protected $fillable = ['nombre_rol', 'descripcion_rol'];

    public function usuarios()
    {
        return $this->hasMany(Usuario::class, 'fk_rol', 'id_rol');
    }

    public function permisos()
    {
        return $this->belongsToMany(Permiso::class, 'rol_permiso', 'fk_rol', 'fk_permiso', 'id_rol', 'id_permisos');
    }
}
