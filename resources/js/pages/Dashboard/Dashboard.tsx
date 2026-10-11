import SistemaLayout from "@/layouts/SistemaLayout/SistemaLayout";
import { Head, usePage } from "@inertiajs/react";
import { DashboardData } from "@/components/Interfaces/interfaceDashboard";

export default function Dashboard() {
    const props = usePage<DashboardData>().props;

    // Datos con valores por defecto para evitar errores
    const estadisticas = props.estadisticas || {
        total_pedidos: 0,
        total_usuarios: 0,
        ventas_hoy: 0,
        ventas_mes: 0,
    };

    const {
        productos_mas_vendidos = [],
        productos_menos_vendidos = [],
        ventas_por_mes = [],
        productos_stock_bajo = [],
        pedidos_recientes = [],
        estados_pedidos = [],
    } = props;

    // Funciones utilitarias
    const formatNumber = (num:any) => num?.toLocaleString('es-GT') ?? '0';
    const formatCurrency = (num:any) => `Q${Number(num || 0).toLocaleString('es-GT', {minimumFractionDigits: 2})}`;

    return (
        <SistemaLayout>
            <Head title="Dashboard" />
            <div className="w-full px-2 md:px-6 py-4 space-y-6">
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600">Resumen general del sistema</p>
                </div>

                {/* Estadísticas Generales */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 mb-8">
                    <div className="bg-blue-500 text-white p-4 md:p-6 rounded-lg shadow-md">
                        <h3 className="text-base md:text-lg font-semibold">Total Pedidos</h3>
                        <p className="text-2xl md:text-3xl font-bold">{formatNumber(estadisticas.total_pedidos)}</p>
                    </div>
                    <div className="bg-green-500 text-white p-4 md:p-6 rounded-lg shadow-md">
                        <h3 className="text-base md:text-lg font-semibold">Total Usuarios</h3>
                        <p className="text-2xl md:text-3xl font-bold">{formatNumber(estadisticas.total_usuarios)}</p>
                    </div>
                    <div className="bg-orange-500 text-white p-4 md:p-6 rounded-lg shadow-md">
                        <h3 className="text-base md:text-lg font-semibold">Ventas Hoy</h3>
                        <p className="text-xl md:text-2xl font-bold">{formatCurrency(estadisticas.ventas_hoy)}</p>
                    </div>
                    <div className="bg-red-500 text-white p-4 md:p-6 rounded-lg shadow-md">
                        <h3 className="text-base md:text-lg font-semibold">Ventas del Mes</h3>
                        <p className="text-xl md:text-2xl font-bold">{formatCurrency(estadisticas.ventas_mes)}</p>
                    </div>
                </div>

                {/* Fila de gráficos principales */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
                    {/* Productos Más Vendidos */}
                    <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
                        <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">Productos Más Vendidos</h2>
                        <div className="space-y-3">
                            {productos_mas_vendidos.length > 0 ? (
                                productos_mas_vendidos.slice(0, 5).map((producto, index) => (
                                    <div key={index} className="flex flex-col sm:flex-row justify-between items-center p-3 bg-gray-50 rounded">
                                        <div>
                                            <p className="font-semibold text-gray-800">{producto.producto || 'Sin nombre'}</p>
                                            <p className="text-sm text-gray-600">Precio: {formatCurrency(producto.precio)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-green-600">{formatNumber(producto.total_vendido)} vendidos</p>
                                            <p className="text-sm text-gray-600">{formatCurrency(producto.ingresos_generados)}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-8">No hay datos de productos vendidos</p>
                            )}
                        </div>
                    </div>

                    {/* Productos Menos Vendidos */}
                    <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
                        <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">Productos Menos Vendidos</h2>
                        <div className="space-y-3">
                            {productos_menos_vendidos.length > 0 ? (
                                productos_menos_vendidos.slice(0, 5).map((producto, index) => (
                                    <div key={index} className="flex flex-col sm:flex-row justify-between items-center p-3 bg-gray-50 rounded">
                                        <div>
                                            <p className="font-semibold text-gray-800">{producto.producto || 'Sin nombre'}</p>
                                            <p className="text-sm text-gray-600">Precio: {formatCurrency(producto.precio)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-red-600">{formatNumber(producto.total_vendido)} vendidos</p>
                                            <p className="text-sm text-gray-600">Stock: {formatNumber(producto.stock_actual)}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-8">No hay datos de productos</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Segunda fila */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
                    {/* Ventas por Mes */}
                    <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
                        <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">Ventas por Mes</h2>
                        <div className="space-y-3">
                            {ventas_por_mes.length > 0 ? (
                                ventas_por_mes.map((venta, index) => (
                                    <div key={index} className="flex justify-between items-center p-3 bg-blue-50 rounded">
                                        <div>
                                            <p className="font-semibold text-gray-800">{venta.mes || 'N/A'} {venta.año || 'N/A'}</p>
                                            <p className="text-sm text-gray-600">{formatNumber(venta.cantidad_pedidos)} pedidos</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-blue-600">{formatCurrency(venta.total)}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-8">No hay datos de ventas por mes</p>
                            )}
                        </div>
                    </div>

                    {/* Stock Bajo */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold text-red-600 mb-4">⚠️ Stock Bajo (&lt; 10 unidades)</h2>
                        <div className="space-y-3">
                            {productos_stock_bajo.length > 0 ? (
                                productos_stock_bajo.map((producto, index) => (
                                    <div key={index} className="flex justify-between items-center p-3 bg-red-50 rounded">
                                        <div>
                                            <p className="font-semibold text-gray-800">{producto.producto || 'Sin nombre'}</p>
                                            <p className="text-sm text-gray-600">{formatCurrency(producto.precio)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-red-600">{formatNumber(producto.cantidad)} restantes</p>
                                            <p className="text-xs text-red-500">¡Reabastecer!</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-4">✅ Todos los productos tienen stock suficiente</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tercera fila */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Pedidos Recientes */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">🕒 Pedidos Recientes</h2>
                        <div className="space-y-3">
                            {pedidos_recientes.length > 0 ? (
                                pedidos_recientes.map((pedido, index) => (
                                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                        <div>
                                            <p className="font-semibold text-gray-800">#{pedido.id || 'N/A'} - {pedido.usuario || 'Usuario desconocido'}</p>
                                            <p className="text-sm text-gray-600">{pedido.fecha || 'Sin fecha'} • {formatNumber(pedido.productos_count)} productos</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-green-600">{formatCurrency(pedido.total)}</p>
                                            <span className={`text-xs px-2 py-1 rounded-full ${
                                                pedido.estado === 'completado' ? 'bg-green-100 text-green-800' :
                                                pedido.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {pedido.estado || 'desconocido'}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-8">No hay pedidos recientes</p>
                            )}
                        </div>
                    </div>

                    {/* Estados de Pedidos */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">📋 Estados de Pedidos</h2>
                        <div className="space-y-4">
                            {estados_pedidos.length > 0 ? (
                                estados_pedidos.map((estado, index) => (
                                    <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded">
                                        <div className="flex items-center">
                                            <div className={`w-4 h-4 rounded-full mr-3 ${
                                                estado.estado === 'completado' ? 'bg-green-500' :
                                                estado.estado === 'pendiente' ? 'bg-yellow-500' :
                                                'bg-red-500'
                                            }`}></div>
                                            <span className="font-semibold capitalize">{estado.estado || 'desconocido'}</span>
                                        </div>
                                        <span className="text-2xl font-bold text-gray-800">{formatNumber(estado.cantidad)}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-8">No hay datos de estados</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </SistemaLayout>
    );
}
