<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GastoFijo extends Model
{
    protected $table = 'gastos_fijos';
    protected $primaryKey = 'id_gasto';

    protected $fillable = ['fk_usuario', 'nombre', 'descripcion', 'monto', 'activo'];

    protected $casts = ['activo' => 'boolean', 'monto' => 'decimal:2'];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'fk_usuario', 'id_usuario');
    }
}
