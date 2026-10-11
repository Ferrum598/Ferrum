<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cliente extends Model
{
    protected $table = 'clientes';
    protected $primaryKey = 'id_cliente';
    public $timestamps = true;

    protected $fillable = [
        'nombre',
        'apellido',
        'numero_telefono',
        'fk_id_total',
    ];
    protected $hidden = [
        'created_at',
        'updated_at',
    ];

    // Relación con el modelo Credito
    public function creditos()
    {
        return $this->hasMany(Credito::class, 'fk_id_cliente', 'id_cliente');
    }
    // Relación con el modelo Total
    public function total()
    {
        return $this->belongsTo(Total::class, 'fk_id_total', 'id_total');
    }   
}
