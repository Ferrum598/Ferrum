<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Venta extends Model
{
    protected $table = 'ventas';
    protected $primaryKey = 'id_venta';

    protected $fillable = ['fecha_venta', 'total', 'fk_cliente', 'fk_usuario', 'anulado'];

    protected $casts = ['fecha_venta' => 'datetime', 'total' => 'decimal:2', 'anulado' => 'boolean'];

    // Excluye las ventas de comprobantes anulados (no cuentan en reportes ni totales)
    public function scopeActivas($query)
    {
        return $query->where('ventas.anulado', false);
    }

    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'fk_cliente', 'id_cliente');
    }

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'fk_usuario', 'id_usuario');
    }

    public function detalles()
    {
        return $this->hasMany(DetalleVenta::class, 'fk_venta', 'id_venta');
    }

    public function comprobante()
    {
        return $this->hasOne(Comprobante::class, 'fk_venta', 'id_venta');
    }

    // Una venta a crédito tiene un registro en creditos
    public function credito()
    {
        return $this->hasOne(Credito::class, 'fk_venta', 'id_venta');
    }
}
