<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DescuentoProducto extends Model
{
    protected $table = 'descuentos_producto';
    protected $primaryKey = 'id_descuento';

    protected $fillable = ['fk_producto', 'cantidad_minima', 'porcentaje'];

    protected $casts = ['cantidad_minima' => 'integer', 'porcentaje' => 'float'];

    public function producto()
    {
        return $this->belongsTo(Producto::class, 'fk_producto', 'id_producto');
    }

    // Porcentaje que corresponde a una cantidad: el mayor entre las reglas que se cumplen
    public static function porcentajeParaCantidad($reglas, int $cantidad): float
    {
        return (float) collect($reglas)->where('cantidad_minima', '<=', $cantidad)->max('porcentaje');
    }
}
