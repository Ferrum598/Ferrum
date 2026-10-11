<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Proforma extends Model
{
    protected $table = 'proformas';
    protected $primaryKey = 'id_proforma';
    public $timestamps = true;

    protected $fillable = [
        'fk_id_usuario',
        'fk_id_pedido',
        'fecha_proforma',
    ];

    // Relación con el modelo Usuario
    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'fk_id_usuario', 'id_usuario');
    }
    // Relación con el modelo Pedido
    public function pedido()
    {
        return $this->belongsTo(Pedido::class, 'fk_id_pedido', 'id_pedido');
    }

}
