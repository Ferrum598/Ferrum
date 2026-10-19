<?php

namespace App\Http\Controllers;

use App\Models\AbonoCredito;
use App\Models\Credito;
use App\Models\DetalleVenta;
use App\Models\Lote;
use App\Models\Venta;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $inicioHoy = now()->startOfDay();
        $finHoy = now()->endOfDay();
        $inicioMes = now()->startOfMonth();
        $finMes = now()->endOfMonth();
        $ventasHoy = Venta::activas()->whereBetween('fecha_venta', [$inicioHoy, $finHoy]);
        $ventasMes = Venta::activas()->whereBetween('fecha_venta', [$inicioMes, $finMes]);
        $contadoMes = (clone $ventasMes)->whereDoesntHave('credito')->sum('total');
        $abonosMes = AbonoCredito::whereBetween('fecha_abono', [$inicioMes->toDateString(), $finMes->toDateString()])->sum('monto');

        $costoMes = (float) DB::table('detalle_venta')
            ->join('ventas', 'detalle_venta.fk_venta', '=', 'ventas.id_venta')
            ->where('ventas.anulado', false)
            ->whereBetween('ventas.fecha_venta', [$inicioMes, $finMes])
            ->sum(DB::raw('detalle_venta.cantidad * detalle_venta.costo_unitario'));
        $montoMes = (float) (clone $ventasMes)->sum('total');

        $ventasPorDia = collect(range(29, 0))->map(function ($dias) {
            $fecha = now()->subDays($dias);
            $ventas = Venta::activas()->whereBetween('fecha_venta', [$fecha->copy()->startOfDay(), $fecha->copy()->endOfDay()]);
            return [
                'fecha' => $fecha->format('Y-m-d'),
                'etiqueta' => $fecha->format('d/m'),
                'cantidad' => (clone $ventas)->count(),
                'total' => (float) (clone $ventas)->sum('total'),
            ];
        })->values();

        $productosMasVendidos = DetalleVenta::query()
            ->join('ventas', 'detalle_venta.fk_venta', '=', 'ventas.id_venta')
            ->join('lotes', 'detalle_venta.fk_lote', '=', 'lotes.id_lote')
            ->join('productos', 'lotes.fk_producto', '=', 'productos.id_producto')
            ->where('ventas.anulado', false)
            ->whereBetween('ventas.fecha_venta', [$inicioMes, $finMes])
            ->select('productos.nombre_producto as producto', DB::raw('SUM(detalle_venta.cantidad) as total_vendido'), DB::raw('SUM(detalle_venta.subtotal) as ingresos_generados'))
            ->groupBy('productos.id_producto', 'productos.nombre_producto')
            ->orderByDesc('total_vendido')->limit(5)->get();

        $stockBajo = Lote::query()
            ->join('productos', 'lotes.fk_producto', '=', 'productos.id_producto')
            ->where('lotes.activo', true)->where('productos.activo', true)
            ->select('productos.id_producto', 'productos.nombre_producto as producto', DB::raw('SUM(lotes.cantidad_disponible) as cantidad_disponible'))
            ->groupBy('productos.id_producto', 'productos.nombre_producto')
            ->havingRaw('SUM(lotes.cantidad_disponible) <= 5')
            ->orderBy('cantidad_disponible')->get();

        return Inertia::render('Dashboard/Dashboard', [
            'estadisticas' => [
                'ventas_hoy_cantidad' => (clone $ventasHoy)->count(),
                'ventas_hoy_monto' => (float) (clone $ventasHoy)->sum('total'),
                'ventas_mes_cantidad' => (clone $ventasMes)->count(),
                'ventas_mes_monto' => (float) (clone $ventasMes)->sum('total'),
                'costo_ventas_mes' => round($costoMes, 2),
                'diferencia_mes' => round($montoMes - $costoMes, 2),
                'ingresos_cobrados_mes' => (float) $contadoMes + (float) $abonosMes,
                'creditos_pendientes' => (float) Credito::where('estado', 'pendiente')->whereDate('fecha_vencimiento', '>=', today())->sum('saldo_pendiente'),
                'creditos_vencidos' => (float) Credito::where(function ($query) {
                    $query->where('estado', 'vencido')->orWhere(function ($pendiente) {
                        $pendiente->where('estado', 'pendiente')->whereDate('fecha_vencimiento', '<', today());
                    });
                })->sum('saldo_pendiente'),
                'stock_bajo_unidades' => (int) $stockBajo->sum('cantidad_disponible'),
            ],
            'productos_mas_vendidos' => $productosMasVendidos,
            'productos_stock_bajo' => $stockBajo->take(10)->values(),
            'ventas_por_dia' => $ventasPorDia,
        ]);
    }
}
