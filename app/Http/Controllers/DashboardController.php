<?php

namespace App\Http\Controllers;

use App\Models\Pedido;
use App\Models\Producto;
use App\Models\PedidoProducto;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    public function index()
    {
        try {
            // Estadísticas generales con manejo de errores
            $totalPedidos = Pedido::count() ?? 0;
            $totalProductos = Producto::where('estatus', 'activo')->count() ?? 0;
            $ventasHoy = Pedido::whereDate('fecha_pedido', today())
                ->where('estado', '!=', 'cancelado')
                ->sum('total_pedido') ?? 0;
            $ventasMes = Pedido::whereMonth('fecha_pedido', now()->month)
                ->where('estado', '!=', 'cancelado')
                ->sum('total_pedido') ?? 0;

            //Productos más vendidos
            $productosMasVendidos = DB::table('pedidos_productos')
                ->join('productos', 'pedidos_productos.fk_id_producto', '=', 'productos.id_producto')
                ->join('pedidos', 'pedidos_productos.fk_id_pedido', '=', 'pedidos.id_pedido')
                ->where('pedidos.estado', '!=', 'cancelado')
                ->select(
                    'productos.producto',
                    'productos.precio',
                    DB::raw('SUM(pedidos_productos.cantidad) as total_vendido'),
                    DB::raw('SUM(pedidos_productos.total) as ingresos_generados')
                )
                ->groupBy('productos.id_producto', 'productos.producto', 'productos.precio')
                ->orderBy('total_vendido', 'desc')
                ->limit(10)
                ->get() ?? collect();

            // Productos menos vendidos
            $productosMenosVendidos = DB::table('productos')
                ->leftJoin('pedidos_productos', 'productos.id_producto', '=', 'pedidos_productos.fk_id_producto')
                ->leftJoin('pedidos', function ($join) {
                    $join->on('pedidos_productos.fk_id_pedido', '=', 'pedidos.id_pedido')
                        ->where('pedidos.estado', '!=', 'cancelado');
                })
                ->where('productos.estatus', 'activo')
                ->select(
                    'productos.producto',
                    'productos.precio',
                    'productos.cantidad as stock_actual',
                    DB::raw('COALESCE(SUM(pedidos_productos.cantidad), 0) as total_vendido')
                )
                ->groupBy('productos.id_producto', 'productos.producto', 'productos.precio', 'productos.cantidad')
                ->orderBy('total_vendido', 'asc')
                ->limit(10)
                ->get() ?? collect();

            //Ventas por mes (últimos 6 meses)
            $ventasPorMes = collect();
            try {
                $ventasPorMes = DB::table('pedidos')
                    ->select(
                        DB::raw('EXTRACT(MONTH FROM fecha_pedido) as mes'),
                        DB::raw('EXTRACT(YEAR FROM fecha_pedido) as año'),
                        DB::raw('SUM(total_pedido) as total'),
                        DB::raw('COUNT(*) as cantidad_pedidos')
                    )
                    ->where('estado', '!=', 'cancelado')
                    ->where('fecha_pedido', '>=', now()->subMonths(6))
                    ->groupBy('año', 'mes')
                    ->orderBy('año', 'desc')
                    ->orderBy('mes', 'desc')
                    ->get()
                    ->map(function ($item) {
                        $meses = [
                            1 => 'Enero',
                            2 => 'Febrero',
                            3 => 'Marzo',
                            4 => 'Abril',
                            5 => 'Mayo',
                            6 => 'Junio',
                            7 => 'Julio',
                            8 => 'Agosto',
                            9 => 'Septiembre',
                            10 => 'Octubre',
                            11 => 'Noviembre',
                            12 => 'Diciembre'
                        ];
                        return [
                            'mes' => $meses[$item->mes] ?? 'N/A',
                            'año' => $item->año,
                            'total' => floatval($item->total),
                            'cantidad_pedidos' => intval($item->cantidad_pedidos)
                        ];
                    });
            } catch (\Exception $e) {
                // Si falla, continuar con colección vacía
            }

            //Productos con stock bajo
            $productosStockBajo = Producto::where('estatus', 'activo')
                ->where('cantidad', '<', 10)
                ->orderBy('cantidad', 'asc')
                ->select('producto', 'cantidad', 'precio')
                ->limit(10)
                ->get() ?? collect();

            // Pedidos recientes
            $pedidosRecientes = collect();
            try {
                $pedidosRecientes = Pedido::with(['usuario', 'pedidoProductos'])
                    ->orderBy('fecha_pedido', 'desc')
                    ->limit(5)
                    ->get()
                    ->map(function ($pedido) {
                        // ✅ CORRECCIÓN: Manejar fecha correctamente
                        $fecha = $pedido->fecha_pedido;
                        if (is_string($fecha)) {
                            $fecha = Carbon::parse($fecha);
                        }

                        return [
                            'id' => $pedido->id_pedido,
                            'usuario' => $pedido->usuario->usuario ?? 'Usuario desconocido',
                            'total' => floatval($pedido->total_pedido),
                            'estado' => $pedido->estado,
                            'fecha' => $fecha->format('d/m/Y H:i'), // ✅ Ahora funciona
                            'productos_count' => $pedido->pedidoProductos->count()
                        ];
                    });
            } catch (\Exception $e) {
                // Si falla, continuar con colección vacía
                Log::error('Error en pedidos recientes: ' . $e->getMessage());
            }

            //Estados de pedidos
            $estadosPedidos = DB::table('pedidos')
                ->select('estado', DB::raw('COUNT(*) as cantidad'))
                ->groupBy('estado')
                ->get() ?? collect();

            return Inertia::render('Dashboard/Dashboard', [
                'estadisticas' => [
                    'total_pedidos' => $totalPedidos,
                    'total_productos' => $totalProductos,
                    'ventas_hoy' => floatval($ventasHoy),
                    'ventas_mes' => floatval($ventasMes),
                ],
                'productos_mas_vendidos' => $productosMasVendidos->toArray(),
                'productos_menos_vendidos' => $productosMenosVendidos->toArray(),
                'ventas_por_mes' => $ventasPorMes->toArray(),
                'productos_stock_bajo' => $productosStockBajo->toArray(),
                'pedidos_recientes' => $pedidosRecientes->toArray(),
                'estados_pedidos' => $estadosPedidos->toArray(),
            ]);
        } catch (\Exception $e) {
            //Si todo falla, mostrar dashboard con datos vacíos
            Log::error('Error en Dashboard: ' . $e->getMessage());

            return Inertia::render('Dashboard/Dashboard', [
                'estadisticas' => [
                    'total_pedidos' => 0,
                    'total_productos' => 0,
                    'ventas_hoy' => 0,
                    'ventas_mes' => 0,
                ],
                'productos_mas_vendidos' => [],
                'productos_menos_vendidos' => [],
                'ventas_por_mes' => [],
                'productos_stock_bajo' => [],
                'pedidos_recientes' => [],
                'estados_pedidos' => [],
                'error' => 'Error al cargar datos del dashboard: ' . $e->getMessage()
            ]);
        }
    }
}
