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
            <div className="mx-auto w-full max-w-[1600px] space-y-7 px-2 py-5 md:px-6">
                <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-900 p-6 text-white shadow-xl md:p-9">
                    <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
                    <div className="absolute -bottom-24 right-1/3 h-48 w-48 rounded-full bg-indigo-400/10 blur-3xl" />
                    <div className="relative flex flex-wrap items-end justify-between gap-4">
                        <div><span className="mb-3 inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-100">Centro de control</span><h1 className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-3xl font-black tracking-tight text-transparent md:text-4xl">Dashboard</h1><p className="mt-2 text-sm text-slate-300 md:text-base">Un vistazo al rendimiento y la actividad de tu negocio.</p></div>
                        <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-blue-50 backdrop-blur"><span className="mr-2">📅</span>{new Date().toLocaleDateString("es-GT", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>
                    </div>
                </header>
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <StatCard title="Ventas de hoy" detail={`${number(stats.ventas_hoy_cantidad)} operaciones registradas`} value={money(stats.ventas_hoy_monto)} icon="🛍️" color="from-orange-500 to-amber-400" />
                    <StatCard title="Ventas del mes" detail={`${number(stats.ventas_mes_cantidad)} operaciones registradas`} value={money(stats.ventas_mes_monto)} icon="📈" color="from-blue-700 to-indigo-500" />
                    <StatCard title="Costo de compra del mes" detail="Precio de compra de lo vendido" value={money(stats.costo_ventas_mes)} icon="🏷️" color="from-slate-700 to-slate-500" />
                    <StatCard title="Diferencia del mes" detail="Ventas − costo de compra" value={money(stats.diferencia_mes)} icon="⚖️" color="from-cyan-600 to-sky-400" />
                    <StatCard title="Ingresos cobrados" detail="Contado + abonos de este mes" value={money(stats.ingresos_cobrados_mes)} icon="💰" color="from-emerald-600 to-teal-400" />
                    <StatCard title="Créditos pendientes" detail="Saldo por cobrar vigente" value={money(stats.creditos_pendientes)} icon="🧾" color="from-amber-500 to-yellow-400" />
                    <StatCard title="Créditos vencidos" detail="Saldo que requiere seguimiento" value={money(stats.creditos_vencidos)} icon="⏰" color="from-rose-600 to-red-400" />
                    <StatCard title="Stock en observación" detail="Unidades en productos con 5 o menos" value={number(stats.stock_bajo_unidades)} icon="📦" color="from-violet-600 to-blue-500" />
                </section>
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                    <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-md transition-shadow hover:shadow-xl md:p-7">
                        <div className="mb-5 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">Rendimiento</p><h2 className="mt-1 text-xl font-extrabold text-slate-900 md:text-2xl">Productos destacados</h2></div><span className="rounded-2xl bg-blue-50 p-3 text-2xl">🏆</span></div>
                        <div className="space-y-3">
                            {props.productos_mas_vendidos.length ? props.productos_mas_vendidos.map((producto, index) => {
                                const maximum = Math.max(...props.productos_mas_vendidos.map((item) => item.total_vendido), 1);
                                return <div key={producto.producto + index} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 transition hover:border-blue-100 hover:bg-blue-50/50"><div className="flex items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-black text-blue-700 shadow-sm">{index + 1}</span><span className="truncate font-bold text-slate-800">{producto.producto}</span></div><div className="text-right"><p className="font-extrabold text-slate-900">{number(producto.total_vendido)} <span className="text-xs font-medium text-slate-500">vendidos</span></p><p className="text-sm font-semibold text-emerald-700">{money(producto.ingresos_generados)}</p></div></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-500" style={{ width: `${Math.max(producto.total_vendido / maximum * 100, 3)}%` }} /></div></div>;
                            }) : <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center"><span className="text-4xl">🛒</span><p className="mt-3 font-semibold text-slate-700">Sin ventas registradas este mes</p><p className="mt-1 text-sm text-slate-500">Los productos más vendidos aparecerán aquí.</p></div>}
                        </div>
                    </section>
                    <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-md transition-shadow hover:shadow-xl md:p-7">
                        <div className="mb-5 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-rose-600">Inventario</p><h2 className="mt-1 text-xl font-extrabold text-slate-900 md:text-2xl">Stock por reponer</h2></div><span className="rounded-2xl bg-rose-50 p-3 text-2xl">⚠️</span></div>
                        <div className="space-y-3">
                            {props.productos_stock_bajo.length ? props.productos_stock_bajo.map((producto) => (
                                <div key={producto.id_producto} className="flex items-center justify-between gap-3 rounded-2xl border border-rose-100 bg-gradient-to-r from-rose-50/80 to-white p-4 transition hover:shadow-sm"><div className="flex min-w-0 items-center gap-3"><span className="rounded-xl bg-white p-2 text-xl shadow-sm">📦</span><span className="truncate font-bold text-slate-800">{producto.producto}</span></div><span className="shrink-0 rounded-full bg-rose-100 px-3 py-1.5 text-xs font-extrabold text-rose-700">{number(producto.cantidad_disponible)} restantes</span></div>
                            )) : <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/50 p-10 text-center"><span className="text-4xl">✅</span><p className="mt-3 font-semibold text-slate-700">Todo en orden</p><p className="mt-1 text-sm text-slate-500">No hay productos con stock bajo.</p></div>}
                        </div>
                    </section>
                </div>
                <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-md md:p-7">
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">Tendencia de ventas</p><h2 className="mt-1 text-xl font-extrabold text-slate-900 md:text-2xl">últimos {dias} días</h2><p className="mt-1 text-sm text-slate-500">Importe vendido por día</p></div><div className="flex rounded-xl bg-slate-100 p-1">{([7, 30] as const).map((periodo) => <button key={periodo} onClick={() => setDias(periodo)} className={`rounded-lg px-4 py-2 text-sm font-bold transition-all ${dias === periodo ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md" : "text-slate-600 hover:bg-white hover:text-blue-700"}`}>{periodo} días</button>)}</div></div>
                    <div className="flex h-56 items-end gap-1.5 overflow-x-auto rounded-2xl bg-gradient-to-b from-blue-50/60 to-white px-3 pt-5 sm:gap-2">
                        {serie.map((venta) => <div key={venta.fecha} className="group flex h-full min-w-5 flex-1 flex-col justify-end" title={`${venta.etiqueta}: ${number(venta.cantidad)} ventas, ${money(venta.total)}`}>
                            <div className="relative w-full rounded-t-lg bg-gradient-to-t from-blue-700 to-indigo-400 opacity-85 transition-all group-hover:from-blue-800 group-hover:to-indigo-500 group-hover:opacity-100" style={{ height: `${Math.max(venta.total / maxTotal * 100, venta.total > 0 ? 4 : 0)}%` }} />
                        </div>)}
                    </div>
                    <div className="mt-3 flex justify-between text-xs font-semibold text-slate-500"><span>{serie[0]?.etiqueta}</span><span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">? Importe diario</span><span>Hoy ? {serie[serie.length - 1]?.etiqueta}</span></div>
                </section>
            </div>
        </SistemaLayout>
    );
}

function StatCard({ title, detail, value, icon, color }: { title: string; detail: string; value: string; icon: string; color: string }) {
    return <article className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${color} p-5 text-white shadow-lg shadow-slate-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl md:p-6`}><div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10 transition-transform duration-500 group-hover:scale-125" /><div className="relative flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-sm font-bold text-white/85">{title}</p><p className="mt-3 break-words text-2xl font-black tracking-tight md:text-3xl">{value}</p><p className="mt-2 text-xs text-white/80 md:text-sm">{detail}</p></div><span className="rounded-2xl border border-white/20 bg-white/15 p-3 text-2xl shadow-inner backdrop-blur transition-transform group-hover:rotate-6">{icon}</span></div></article>;
}
