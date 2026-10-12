<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Categoria extends Model
{
    protected $table = 'categorias';
    protected $primaryKey = 'id_categoria';

    protected $fillable = ['nombre_categoria'];
    protected $hidden = ['created_at', 'updated_at'];

    public function productos()
    {
        return $this->hasMany(Producto::class, 'fk_categoria', 'id_categoria');
    }
}
