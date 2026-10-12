<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lote extends Model
{
    protected $table = 'lotes';
    protected $primaryKey = 'id_lote';

    protected $fillable = [
        'nombre_lote',
        'fk_producto',
        'precio_compra',
        'precio_venta',
        'cantidad',
        'cantidad_disponible',
        'fecha_ingreso',
        'activo',
    ];

    protected $casts = [
        'activo' => 'boolean',
        'precio_compra' => 'decimal:2',
        'precio_venta' => 'decimal:2',
        'fecha_ingreso' => 'date:Y-m-d',
    ];

    public function producto()
    {
        return $this->belongsTo(Producto::class, 'fk_producto', 'id_producto');
    }

    public function codigos()
    {
        return $this->hasMany(CodigoBarra::class, 'fk_lote', 'id_lote');
    }

    public function detalles()
    {
        return $this->hasMany(DetalleVenta::class, 'fk_lote', 'id_lote');
    }
}
