<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cotizacion extends Model
{
    protected $table = 'cotizaciones';
    protected $primaryKey = 'id_cotizacion';

    protected $fillable = ['numero_cotizacion', 'fk_usuario', 'fk_cliente', 'nombre_cliente', 'fecha_emision', 'valida_hasta', 'total', 'notas'];

    protected $casts = ['fecha_emision' => 'date:Y-m-d', 'valida_hasta' => 'date:Y-m-d', 'total' => 'decimal:2'];

    public function detalles()
    {
        return $this->hasMany(DetalleCotizacion::class, 'fk_cotizacion', 'id_cotizacion');
    }

    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'fk_cliente', 'id_cliente');
    }

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'fk_usuario', 'id_usuario');
    }
}
