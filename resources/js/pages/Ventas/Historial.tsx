import SistemaLayout from "@/layouts/SistemaLayout/SistemaLayout";
import PaginacionVentas from "@/components/PaginacionVentas/PaginacionVentas";
import { BadgeTipoPago } from "@/components/PaginacionVentas/AvisoInterno";
import { Paginado, VentaHistorial } from "@/components/Interfaces/interfaceCatalogo";
import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";

interface Filtros { desde?: string; hasta?: string; cliente?: string; tipo?: string }

const input = "mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition";

export default function Historial({ ventas, filtros }: { ventas: Paginado<VentaHistorial>; filtros: Filtros }) {
    const [f, setF] = useState<Filtros>({ desde: '', hasta: '', cliente: '', tipo: '', ...filtros });

    const aplicar = (e: React.FormEvent) => {
        e.preventDefault();
        const params = Object.fromEntries(Object.entries(f).filter(([, v]) => v));
        router.get('/ventas/historial', params, { preserveState: true });
    };
    const limpiar = () => {
        setF({ desde: '', hasta: '', cliente: '', tipo: '' });
        router.get('/ventas/historial');
    };

    const totalPagina = ventas.data.reduce((s, v) => s + Number(v.total), 0);
    const creditos = ventas.data.filter((v) => v.tipo_pago === 'credito').length;

    const resumen = [
        { icono: '🧾', titulo: 'Ventas en esta página', valor: String(ventas.data.length), color: 'from-blue-600 to-indigo-600' },
        { icono: '💰', titulo: 'Total en esta página', valor: `Q${totalPagina.toFixed(2)}`, color: 'from-emerald-500 to-teal-600' },
        { icono: '🕒', titulo: 'Ventas a crédito', valor: String(creditos), color: 'from-amber-500 to-orange-600' },
    ];

    return (
        <SistemaLayout>
            <Head title="Historial de ventas" />
            <div className="w-full mx-auto px-2 md:px-6 py-6 space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <h1 className="text-3xl font-extrabold bg-gradient-to-r from-slate-900 to-blue-700 bg-clip-text text-transparent">Historial de ventas</h1>
                    <Link href="/ventas" className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 font-semibold shadow-md hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition">
                        🛒 Ir al punto de venta
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {resumen.map((r) => (
                        <div key={r.titulo} className={`rounded-2xl bg-gradient-to-br ${r.color} text-white p-4 shadow-lg flex items-center gap-4`}>
                            <span className="text-4xl">{r.icono}</span>
                            <div>
                                <p className="text-sm opacity-90">{r.titulo}</p>
                                <p className="text-2xl font-extrabold">{r.valor}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <form onSubmit={aplicar} className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-white rounded-2xl shadow-md border border-slate-100 p-4 items-end">
                    <label className="text-sm font-medium text-slate-600">Desde
                        <input type="date" value={f.desde} onChange={(e) => setF({ ...f, desde: e.target.value })} className={input} />
                    </label>
                    <label className="text-sm font-medium text-slate-600">Hasta
                        <input type="date" value={f.hasta} onChange={(e) => setF({ ...f, hasta: e.target.value })} className={input} />
                    </label>
                    <label className="text-sm font-medium text-slate-600">Cliente
                        <input type="text" value={f.cliente} onChange={(e) => setF({ ...f, cliente: e.target.value })} placeholder="Nombre del cliente" className={input} />
                    </label>
                    <label className="text-sm font-medium text-slate-600">Tipo
                        <select value={f.tipo} onChange={(e) => setF({ ...f, tipo: e.target.value })} className={input}>
                            <option value="">Todos</option>
                            <option value="contado">Contado</option>
                            <option value="credito">Crédito</option>
                        </select>
                    </label>
                    <div className="flex gap-2">
                        <button type="submit" className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 font-semibold shadow hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition">Filtrar</button>
                        <button type="button" onClick={limpiar} className="rounded-xl border border-slate-200 text-slate-600 px-4 py-2.5 hover:bg-slate-100 active:scale-95 transition">Limpiar</button>
                    </div>
                </form>

                <div className="overflow-x-auto bg-white rounded-2xl shadow-lg border border-slate-100">
                    <table className="min-w-full text-left">
                        <thead className="bg-gradient-to-r from-slate-800 to-blue-800 text-white text-sm uppercase tracking-wide">
                            <tr>
                                <th className="p-4">Fecha</th>
                                <th className="p-4">Cliente</th>
                                <th className="p-4">Vendedor</th>
                                <th className="p-4">Tipo</th>
                                <th className="p-4 text-right">Total</th>
                                <th className="p-4">Comprobante</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {ventas.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center">
                                        <div className="text-5xl mb-2">🧾</div>
                                        <p className="text-slate-500 text-lg">No hay ventas registradas con estos filtros.</p>
                                    </td>
                                </tr>
                            ) : ventas.data.map((v) => (
                                <tr key={v.id_venta} className="hover:bg-blue-50/60 transition-colors">
                                    <td className="p-4 text-slate-600">{v.fecha_venta}</td>
                                    <td className="p-4 font-medium text-slate-800">{v.cliente ?? <span className="text-slate-400 font-normal">Público general</span>}</td>
                                    <td className="p-4 text-slate-600">{v.vendedor}</td>
                                    <td className="p-4"><BadgeTipoPago tipo={v.tipo_pago} /></td>
                                    <td className="p-4 text-right font-bold text-slate-900">Q{Number(v.total).toFixed(2)}</td>
                                    <td className="p-4">
                                        {v.id_comprobante ? (
                                            <Link href={`/comprobantes/${v.id_comprobante}`} className="inline-block rounded-lg bg-blue-50 text-blue-700 px-3 py-1 text-sm font-semibold hover:bg-blue-100 transition">{v.numero_comprobante}</Link>
                                        ) : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <PaginacionVentas paginado={ventas} />
            </div>
        </SistemaLayout>
    );
}
