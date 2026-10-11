<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Categoria extends Model
{
    protected $table = 'categorias';
    protected $primaryKey = 'id_categoria';
    protected $fillable = ['categoria', 'descripcion'];
    protected $hidden = ['created_at', 'updated_at'];

    // Relación con el modelo Producto
    public function productos()
    {
        return $this->hasMany(Producto::class, 'fk_id_categoria', 'id_categoria');
    }
}