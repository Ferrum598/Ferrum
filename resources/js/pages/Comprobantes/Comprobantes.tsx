import SistemaLayout from "@/layouts/SistemaLayout/SistemaLayout";
import PaginacionVentas from "@/components/PaginacionVentas/PaginacionVentas";
import { AvisoInterno, BadgeTipoPago } from "@/components/PaginacionVentas/AvisoInterno";
import { ComprobanteLista, Paginado } from "@/components/Interfaces/interfaceCatalogo";
import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";

const input = "rounded-xl border border-slate-200 bg-slate-50 p-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition";

export default function Comprobantes({ comprobantes, filtros }: { comprobantes: Paginado<ComprobanteLista>; filtros: { q?: string; fecha?: string | null } }) {
    const [q, setQ] = useState(filtros.q ?? '');
    const [fecha, setFecha] = useState(filtros.fecha ?? '');

    const aplicar = (e: React.FormEvent) => {
        e.preventDefault();
        const params: Record<string, string> = {};
        if (q) params.q = q;
        if (fecha) params.fecha = fecha;
        router.get('/comprobantes', params, { preserveState: true });
    };

    return (
        <SistemaLayout>
            <Head title="Comprobantes" />
            <div className="w-full mx-auto px-2 md:px-6 py-6 space-y-6">
                <h1 className="text-3xl font-extrabold bg-gradient-to-r from-slate-900 to-blue-700 bg-clip-text text-transparent">Comprobantes</h1>

                <AvisoInterno />

                <form onSubmit={aplicar} className="flex flex-col md:flex-row gap-3 bg-white rounded-2xl shadow-md border border-slate-100 p-4 md:items-center">
                    <input type="text" value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 Buscar por número o cliente..." className={`w-full md:w-1/2 ${input}`} />
                    <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className={input} />
                    <button type="submit" className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 font-semibold shadow hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition">Buscar</button>
                    <button type="button" onClick={() => { setQ(''); setFecha(''); router.get('/comprobantes'); }} className="rounded-xl border border-slate-200 text-slate-600 px-5 py-2.5 hover:bg-slate-100 active:scale-95 transition">Limpiar</button>
                </form>

                <div className="overflow-x-auto bg-white rounded-2xl shadow-lg border border-slate-100">
                    <table className="min-w-full text-left">
                        <thead className="bg-gradient-to-r from-slate-800 to-blue-800 text-white text-sm uppercase tracking-wide">
                            <tr>
                                <th className="p-4">Número</th>
                                <th className="p-4">Fecha</th>
                                <th className="p-4">Cliente</th>
                                <th className="p-4">Tipo</th>
                                <th className="p-4 text-right">Total</th>
                                <th className="p-4 text-center">Impresiones</th>
                                <th className="p-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {comprobantes.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-12 text-center">
                                        <div className="text-5xl mb-2">📄</div>
                                        <p className="text-slate-500 text-lg">No se encontraron comprobantes.</p>
                                    </td>
                                </tr>
                            ) : comprobantes.data.map((c) => (
                                <tr key={c.id_comprobante} className="hover:bg-blue-50/60 transition-colors">
                                    <td className="p-4 font-bold text-slate-900">{c.numero_comprobante}</td>
                                    <td className="p-4 text-slate-600">{c.fecha_emision}</td>
                                    <td className="p-4 font-medium text-slate-800">{c.cliente ?? <span className="text-slate-400 font-normal">Público general</span>}</td>
                                    <td className="p-4"><BadgeTipoPago tipo={c.tipo_pago} /></td>
                                    <td className="p-4 text-right font-bold text-slate-900">Q{Number(c.total).toFixed(2)}</td>
                                    <td className="p-4 text-center">
                                        <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${c.veces_impreso > 0 ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-500'}`}>🖨️ {c.veces_impreso}</span>
                                    </td>
                                    <td className="p-4">
                                        <Link href={`/comprobantes/${c.id_comprobante}`} className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1.5 text-sm font-semibold shadow hover:from-blue-700 hover:to-indigo-700 transition">Ver</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <PaginacionVentas paginado={comprobantes} />
            </div>
        </SistemaLayout>
    );
}
