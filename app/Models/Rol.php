<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rol extends Model
{
    protected $table = 'roles';
    protected $primaryKey = 'id_rol';
    public $timestamps = true;

    protected $fillable = [
        'rol',
    ];

    // Relación con el modelo Usuario
    public function usuarios()
    {
        return $this->hasMany(Usuario::class, 'fk_id_rol', 'id_rol');
    }
}
