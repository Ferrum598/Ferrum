<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Producto extends Model

{
    protected $table = 'productos';
    protected $primaryKey = 'id_producto';
    protected $fillable = [
        'producto',
        'producto_plural',
        'descripcion',
        'codigo_barra',
        'estado',
        'estatus',
        'precio',
        'cantidad',
        'fk_id_imagen',
        'fk_id_categoria',
    ];

    // Un producto puede estar en muchos pedidos
    public function pedidos()
    {
        return $this->belongsToMany(Pedido::class, 'pedidos_productos', 'fk_id_producto', 'fk_id_pedido')
            ->withPivot('cantidad');
    }
    // Relación con el modelo ImagenProducto
    public function imagenes()
    {
        return $this->belongsTo(ImagenProducto::class, 'fk_id_imagen', 'id_imagen');
    }
    // Relación con el modelo Categoria
    public function categoria()
    {
        return $this->belongsTo(Categoria::class, 'fk_id_categoria', 'id_categoria');
    }
}
