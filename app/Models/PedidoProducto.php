<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class PedidoProducto extends Pivot
{
    protected $table = 'pedidos_productos';
    protected $primaryKey = 'id_pedido_producto';
    protected $fillable = ['fk_id_pedido', 'fk_id_producto', 'cantidad','total'];
    public $timestamps = true;
    // Relación hacia pedido
    public function pedido()
    {
        return $this->belongsTo(Pedido::class, 'fk_id_pedido');
    }

    // Relación hacia producto
    public function producto()
    {
        return $this->belongsTo(Producto::class, 'fk_id_producto');
    }
}
