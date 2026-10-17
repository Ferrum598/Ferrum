<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Producto extends Model
{
    protected $table = 'productos';
    protected $primaryKey = 'id_producto';

    protected $fillable = [
        'nombre_producto',
        'descripcion',
        'activo',
        'fk_categoria',
        'fk_imagen_producto',
    ];

    protected $casts = ['activo' => 'boolean'];

    public function categoria()
    {
        return $this->belongsTo(Categoria::class, 'fk_categoria', 'id_categoria');
    }

    public function imagen()
    {
        return $this->belongsTo(ImagenProducto::class, 'fk_imagen_producto', 'id_imagen_producto');
    }

    public function descuentos()
    {
        return $this->hasMany(DescuentoProducto::class, 'fk_producto', 'id_producto')->orderBy('cantidad_minima');
    }

    public function lotes()
    {
        return $this->hasMany(Lote::class, 'fk_producto', 'id_producto');
    }

    // Lotes activos con stock, del más barato al más caro
    public function lotesDisponibles()
    {
        return $this->lotes()->where('activo', true)->where('cantidad_disponible', '>', 0)->orderBy('precio_venta');
    }

    // Existencias totales = suma de lo disponible en los lotes activos
    public function existencias(): int
    {
        return (int) $this->lotes()->where('activo', true)->sum('cantidad_disponible');
    }
}
