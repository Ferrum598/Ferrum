<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReporteVenta extends Model
{
    protected $table = 'reporte_ventas';
    protected $primaryKey = 'id_reporte';

    protected $fillable = [
        'fk_usuario',
        'tipo_periodo',
        'fecha_inicio',
        'fecha_fin',
        'cantidad_ventas',
        'total_contado',
        'total_credito',
        'total_abonos',
        'total_ingresos',
        'fecha_generacion',
    ];

    protected $casts = ['fecha_inicio' => 'date:Y-m-d', 'fecha_fin' => 'date:Y-m-d'];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'fk_usuario', 'id_usuario');
    }
}
