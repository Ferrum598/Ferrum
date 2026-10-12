<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetalleReporteGasto extends Model
{
    protected $table = 'detalle_reporte_gasto';
    protected $primaryKey = 'id_detalle_gasto';

    protected $fillable = ['fk_reporte_ganancias', 'fk_gasto', 'monto'];

    public function reporte()
    {
        return $this->belongsTo(ReporteGanancia::class, 'fk_reporte_ganancias', 'id_reporte_ganancias');
    }

    public function gasto()
    {
        return $this->belongsTo(GastoFijo::class, 'fk_gasto', 'id_gasto');
    }
}
