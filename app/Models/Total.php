<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Total extends Model
{
    protected $table = 'totales';
    protected $primaryKey = 'id_total';
    protected $fillable = ['saldo_total', 'deuda_total'];

    protected $hidden = [
        'created_at',
        'updated_at',
    ];

    //Relacion con el modelo Usuario
    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'fk_id_total', 'id_total');
    }
    //Relacion con el modelo Cliente
    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'fk_id_total', 'id_total');
    }   
}
