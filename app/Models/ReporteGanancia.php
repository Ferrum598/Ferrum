<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReporteGanancia extends Model
{
    protected $table = 'reportes_ganancias';
    protected $primaryKey = 'id_reporte_ganancias';

    protected $fillable = [
        'fk_usuario',
        'mes',
        'anio',
        'total_ingreso',
        'costo_productos',
        'total_gastos',
        'ganancia_neta',
        'fecha_generacion',
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'fk_usuario', 'id_usuario');
    }

    public function detalleGastos()
    {
        return $this->hasMany(DetalleReporteGasto::class, 'fk_reporte_ganancias', 'id_reporte_ganancias');
    }
}
