<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;

class Usuario extends Authenticatable
{
    protected $table = 'usuarios';
    protected $primaryKey = 'id_usuario';
    public $timestamps = true;

    protected $fillable = [
        'usuario',
        'password',
        'nit',
        'nit2',
        'telefono',
        'direccion',
        'fk_id_imagen',
        'fk_id_rol',
        'fk_id_total',
    ];
    protected $hidden = [
        'password',
        'created_at',
        'updated_at',
    ];

    // Relación con el modelo Rol
    public function rol()
    {
        return $this->belongsTo(Rol::class, 'fk_id_rol', 'id_rol');
    }
    // Relación con el modelo Credito
    public function creditos()
    {
        return $this->hasMany(Credito::class, 'fk_id_usuario', 'id_usuario');
    }

    // Relación con el modelo Pedido
    public function pedidos()
    {
        return $this->hasMany(Pedido::class, 'fk_id_usuario', 'id_usuario');
    }

    // Relación con el modelo Proforma
    public function proformas()
    {
        return $this->hasMany(Proforma::class, 'fk_id_usuario', 'id_usuario');
    }

    //Relacion con el modelo Imagen
    public function imagenes()
    {
        return $this->belongsTo(Imagen::class, 'fk_id_imagen', 'id_imagen');
    }
    // Relación con el modelo Total
    public function total()
    {
        return $this->belongsTo(Total::class, 'fk_id_total', 'id_total');
    }   
}
