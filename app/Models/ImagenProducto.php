<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ImagenProducto extends Model
{
    protected $table = 'imagenes_productos';
    protected $primaryKey = 'id_imagen';
    public $timestamps = true;

    protected $fillable = [
        'imagen_producto',
    ];

    // Relación con el modelo Producto
    public function productos()
    {
        return $this->belongsTo(Producto::class, 'fk_id_imagen', 'id_imagen');
    }
}
