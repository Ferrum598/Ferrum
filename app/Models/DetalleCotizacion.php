<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetalleCotizacion extends Model
{
    protected $table = 'detalle_cotizacion';
    protected $primaryKey = 'id_detalle_cotizacion';

    protected $fillable = ['fk_cotizacion', 'descripcion', 'cantidad', 'precio_unitario', 'subtotal'];
}
