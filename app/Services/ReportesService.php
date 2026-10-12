<?php

namespace App\Services;

use App\Models\AbonoCredito;
use App\Models\DetalleReporteGasto;
use App\Models\ReporteGanancia;
use App\Models\ReporteVenta;
use App\Models\Venta;
use App\Models\GastoFijo;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReportesService
{
    public function generarReporteVentas(string $tipo, Carbon $referencia, int $usuarioId): ReporteVenta
    {
        [$inicio, $fin] = $this->rango($tipo, $referencia);
        $ventas = Venta::query()->whereBetween('fecha_venta', [$inicio->copy()->startOfDay(), $fin->copy()->endOfDay()]);
        $totalContado = (clone $ventas)->whereDoesntHave('credito')->sum('total');
        $totalCredito = (clone $ventas)->whereHas('credito')->sum('total');
        $totalAbonos = AbonoCredito::query()->whereBetween('fecha_abono', [$inicio->toDateString(), $fin->toDateString()])->sum('monto');

        return ReporteVenta::updateOrCreate(
            ['tipo_periodo' => $tipo, 'fecha_inicio' => $inicio->toDateString(), 'fecha_fin' => $fin->toDateString()],
            [
                'fk_usuario' => $usuarioId,
                'cantidad_ventas' => (clone $ventas)->count(),
                'total_contado' => $totalContado,
                'total_credito' => $totalCredito,
                'total_abonos' => $totalAbonos,
                'total_ingresos' => $totalContado + $totalAbonos,
                'fecha_generacion' => now(),
            ]
        );
    }

    public function generarReporteGanancias(int $mes, int $anio, int $usuarioId): ReporteGanancia
    {
        $inicio = Carbon::create($anio, $mes, 1)->startOfDay();
        $fin = $inicio->copy()->endOfMonth()->endOfDay();

        return DB::transaction(function () use ($mes, $anio, $usuarioId, $inicio, $fin) {
            $ventasContado = Venta::query()->whereBetween('fecha_venta', [$inicio, $fin])->whereDoesntHave('credito')->with('detalles')->get();
            $ingresoContado = (float) $ventasContado->sum('total');
            $costoContado = (float) $ventasContado->sum(fn (Venta $venta) => $venta->detalles->sum(fn ($detalle) => (float) $detalle->cantidad * (float) $detalle->costo_unitario));
            $abonos = AbonoCredito::query()->whereBetween('fecha_abono', [$inicio->toDateString(), $fin->toDateString()])->with('credito.venta.detalles')->get();
            $ingresoAbonos = (float) $abonos->sum('monto');
            $costoAbonos = (float) $abonos->sum(function (AbonoCredito $abono) {
                $venta = $abono->credito?->venta;
                if (!$venta || (float) $venta->total <= 0) {
                    return 0;
                }
                $costoVenta = $venta->detalles->sum(fn ($detalle) => (float) $detalle->cantidad * (float) $detalle->costo_unitario);
                return (float) $abono->monto * $costoVenta / (float) $venta->total;
            });
            $gastos = GastoFijo::query()->where('activo', true)->orderBy('id_gasto')->get();
            $totalGastos = (float) $gastos->sum('monto');
            $ingreso = $ingresoContado + $ingresoAbonos;
            $costo = $costoContado + $costoAbonos;

            $reporte = ReporteGanancia::updateOrCreate(
                ['mes' => $mes, 'anio' => $anio],
                [
                    'fk_usuario' => $usuarioId,
                    'total_ingreso' => $ingreso,
                    'costo_productos' => $costo,
                    'total_gastos' => $totalGastos,
                    'ganancia_neta' => $ingreso - $costo - $totalGastos,
                    'fecha_generacion' => now(),
                ]
            );
            $reporte->detalleGastos()->delete();
            foreach ($gastos as $gasto) {
                DetalleReporteGasto::create([
                    'fk_reporte_ganancias' => $reporte->getKey(),
                    'fk_gasto' => $gasto->getKey(),
                    'monto' => $gasto->monto,
                ]);
            }

            return $reporte->load('detalleGastos.gasto');
        });
    }

    private function rango(string $tipo, Carbon $referencia): array
    {
        $inicio = $referencia->copy();
        $fin = $referencia->copy();
        switch ($tipo) {
            case 'diario':
                break;
            case 'semanal':
                $inicio->startOfWeek(Carbon::MONDAY);
                $fin->endOfWeek(Carbon::SUNDAY);
                break;
            case 'mensual':
                $inicio->startOfMonth();
                $fin->endOfMonth();
                break;
            case 'anual':
                $inicio->startOfYear();
                $fin->endOfYear();
                break;
        }
        return [$inicio->startOfDay(), $fin->startOfDay()];
    }
}
