<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pedido extends Model
{
    protected $table = 'pedidos';
    protected $primaryKey = 'id_pedido';
    protected $fillable = ['fk_id_usuario','estado', 'fecha_pedido', 'fecha_entrega', 'fecha_facturacion', 'total_pedido'];
    public $timestamps = true;
    protected $hidden = [
        'created_at',
        'updated_at',
    ];

    // Un pedido pertenece a un usuario
    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'fk_id_usuario');
    }

    // Un pedido tiene muchas proformas
    public function proformas()
    {
        return $this->hasOne(Proforma::class, 'fk_id_pedido');
    }

    // Un pedido tiene muchos productos a través de la tabla intermedia
    public function productos()
    {
        return $this->belongsToMany(Producto::class, 'pedidos_productos', 'fk_id_pedido', 'fk_id_producto')
                    ->withPivot('cantidad','total');
    }
    public function pedidoProductos()
    {
        return $this->hasMany(PedidoProducto::class, 'fk_id_pedido', 'id_pedido');
    }
}

