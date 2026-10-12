import SistemaLayout from "@/layouts/SistemaLayout/SistemaLayout";
import { Head } from "@inertiajs/react";
import { useState } from "react";
import { DashboardData } from "@/components/Interfaces/interfaceDashboard";

const money = (value: number) => `Q${Number(value || 0).toLocaleString("es-GT", { minimumFractionDigits: 2 })}`;
const number = (value: number) => Number(value || 0).toLocaleString("es-GT");

export default function Dashboard(props: DashboardData) {
    const stats = props.estadisticas;
    const [dias, setDias] = useState<7 | 30>(30);
    const serie = props.ventas_por_dia.slice(-dias);
    const maxTotal = Math.max(...serie.map((item) => item.total), 1);
    return (
        <SistemaLayout>
            <Head title="Dashboard" />
            <div className="w-full space-y-6 px-2 py-4 md:px-6">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Dashboard</h1>
                    <p className="text-gray-600">Resumen general del sistema</p>
                </div>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
                    <StatCard title="Ventas de hoy" detail={`${number(stats.ventas_hoy_cantidad)} ventas`} value={money(stats.ventas_hoy_monto)} color="bg-orange-500" />
                    <StatCard title="Ventas del mes" detail={`${number(stats.ventas_mes_cantidad)} ventas`} value={money(stats.ventas_mes_monto)} color="bg-blue-500" />
                    <StatCard title="Ingresos cobrados del mes" detail="Contado + abonos" value={money(stats.ingresos_cobrados_mes)} color="bg-green-500" />
                    <StatCard title="Cr?ditos pendientes" detail="Saldo pendiente" value={money(stats.creditos_pendientes)} color="bg-amber-500" />
                    <StatCard title="Cr?ditos vencidos" detail="Saldo vencido" value={money(stats.creditos_vencidos)} color="bg-red-500" />
                    <StatCard title="Unidades en stock bajo" detail="Productos con 5 unidades o menos" value={number(stats.stock_bajo_unidades)} color="bg-purple-500" />
                </div>
                <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2">
                    <section className="rounded-lg bg-white p-4 shadow-md md:p-6">
                        <h2 className="mb-4 text-lg font-bold text-gray-800 md:text-xl">Productos m?s vendidos este mes</h2>
                        <div className="space-y-3">
                            {props.productos_mas_vendidos.length ? props.productos_mas_vendidos.map((producto, index) => (
                                <div key={producto.producto + index} className="flex items-center justify-between rounded bg-gray-50 p-3">
                                    <span className="font-semibold text-gray-800">{producto.producto}</span>
                                    <div className="text-right"><p className="font-bold text-green-600">{number(producto.total_vendido)} vendidos</p><p className="text-sm text-gray-600">{money(producto.ingresos_generados)}</p></div>
                                </div>
                            )) : <p className="py-8 text-center text-gray-500">No hay ventas este mes.</p>}
                        </div>
                    </section>
                    <section className="rounded-lg bg-white p-4 shadow-md md:p-6">
                        <h2 className="mb-4 text-lg font-bold text-red-600 md:text-xl">Stock bajo (5 unidades o menos)</h2>
                        <div className="space-y-3">
                            {props.productos_stock_bajo.length ? props.productos_stock_bajo.map((producto) => (
                                <div key={producto.id_producto} className="flex justify-between rounded bg-red-50 p-3">
                                    <span className="font-semibold text-gray-800">{producto.producto}</span><span className="font-bold text-red-600">{number(producto.cantidad_disponible)} restantes</span>
                                </div>
                            )) : <p className="py-8 text-center text-gray-500">Todos los productos tienen stock suficiente.</p>}
                        </div>
                    </section>
                </div>
                <section className="rounded-lg bg-white p-4 shadow-md md:p-6">
                    <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-lg font-bold text-gray-800 md:text-xl">Ventas de los ?ltimos {dias} d?as</h2><div className="flex gap-2">{([7, 30] as const).map((periodo) => <button key={periodo} onClick={() => setDias(periodo)} className={`rounded px-3 py-1 text-sm ${dias === periodo ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}>{periodo} d?as</button>)}</div></div>
                    <div className="flex h-56 items-end gap-1 overflow-x-auto border-b border-gray-200 pb-1">
                        {serie.map((venta) => <div key={venta.fecha} className="group flex h-full min-w-5 flex-1 flex-col justify-end" title={`${venta.etiqueta}: ${number(venta.cantidad)} ventas, ${money(venta.total)}`}>
                            <div className="w-full rounded-t bg-blue-500 hover:bg-blue-600" style={{ height: `${Math.max(venta.total / maxTotal * 100, venta.total > 0 ? 3 : 0)}%` }} />
                        </div>)}
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-gray-500"><span>{serie[0]?.etiqueta}</span><span>Importe por d?a</span><span>Hoy</span></div>
                </section>
            </div>
        </SistemaLayout>
    );
}

function StatCard({ title, detail, value, color }: { title: string; detail: string; value: string; color: string }) {
    return <div className={`${color} rounded-lg p-4 text-white shadow-md md:p-6`}><h3 className="text-sm font-semibold md:text-base">{title}</h3><p className="mt-1 text-xl font-bold md:text-2xl">{value}</p><p className="mt-1 text-xs text-white/90 md:text-sm">{detail}</p></div>;
}
