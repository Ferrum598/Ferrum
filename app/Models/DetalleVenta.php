<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetalleVenta extends Model
{
    protected $table = 'detalle_venta';
    protected $primaryKey = 'id_detalle';

    protected $fillable = ['fk_venta', 'fk_lote', 'cantidad', 'precio_unitario', 'costo_unitario', 'subtotal', 'descuento_porcentaje', 'descuento_monto'];

    public function venta()
    {
        return $this->belongsTo(Venta::class, 'fk_venta', 'id_venta');
    }

    public function lote()
    {
        return $this->belongsTo(Lote::class, 'fk_lote', 'id_lote');
    }
}
