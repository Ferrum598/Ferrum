import SistemaLayout from "@/layouts/SistemaLayout/SistemaLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

type Fila = { id_cotizacion: number; numero_cotizacion: string; cliente: string; fecha_emision: string; valida_hasta: string | null; total: number };
type Paginado = { data: Fila[]; links: { url: string | null; label: string; active: boolean }[] };
type Props = { cotizaciones: Paginado; filtros: { q?: string }; flash?: { title: string; icon: "success" | "error"; message: string } | null };

const money = (v: number) => `Q${Number(v || 0).toLocaleString("es-GT", { minimumFractionDigits: 2 })}`;
const input = "rounded-xl border border-slate-200 bg-slate-50 p-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition";

export default function Cotizaciones({ cotizaciones, filtros }: Props) {
    const [q, setQ] = useState(filtros.q ?? "");
    const { flash } = usePage<Props>().props;
    useEffect(() => { if (flash) Swal.fire({ icon: flash.icon, title: flash.title, text: flash.message, timer: 3000, showConfirmButton: false }); }, [flash]);

    const buscar = (e: React.FormEvent) => { e.preventDefault(); router.get("/cotizaciones", q ? { q } : {}, { preserveState: true }); };
    const eliminar = async (c: Fila) => {
        const r = await Swal.fire({ title: "¿Eliminar cotización?", text: c.numero_cotizacion, icon: "warning", showCancelButton: true, confirmButtonText: "Eliminar", cancelButtonText: "Cancelar" });
        if (r.isConfirmed) router.delete(`/cotizaciones/${c.id_cotizacion}`);
    };

    return (
        <SistemaLayout>
            <Head title="Cotizaciones" />
            <div className="w-full mx-auto px-2 md:px-6 py-6 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-3xl font-extrabold bg-gradient-to-r from-slate-900 to-blue-700 bg-clip-text text-transparent">Cotizaciones</h1>
                    <Link href="/cotizaciones/crear" className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg">➕ Nueva cotización</Link>
                </div>

                <form onSubmit={buscar} className="flex flex-col md:flex-row gap-3 bg-white rounded-2xl shadow-md border border-slate-100 p-4 md:items-center">
                    <input className={`${input} flex-1`} placeholder="Buscar por número o cliente" value={q} onChange={(e) => setQ(e.target.value)} />
                    <button className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 font-bold text-white shadow-md">Buscar</button>
                </form>

                <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-md">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[720px] text-left text-sm">
                            <thead className="bg-gradient-to-r from-slate-900 to-blue-900 text-xs uppercase tracking-wide text-white">
                                <tr><th className="p-4">Número</th><th className="p-4">Cliente</th><th className="p-4">Fecha</th><th className="p-4">Válida hasta</th><th className="p-4">Total</th><th className="p-4">Acciones</th></tr>
                            </thead>
                            <tbody>
                                {cotizaciones.data.map((c) => (
                                    <tr key={c.id_cotizacion} className="border-b border-slate-100 transition-colors hover:bg-blue-50/60">
                                        <td className="p-4 font-extrabold text-slate-800">{c.numero_cotizacion}</td>
                                        <td className="p-4 text-slate-600">{c.cliente}</td>
                                        <td className="p-4 text-slate-600">{c.fecha_emision}</td>
                                        <td className="p-4 text-slate-600">{c.valida_hasta ?? "—"}</td>
                                        <td className="p-4 font-extrabold text-slate-900">{money(c.total)}</td>
                                        <td className="p-4"><div className="flex gap-2">
                                            <Link href={`/cotizaciones/${c.id_cotizacion}`} className="rounded-lg bg-blue-50 px-3 py-1.5 font-bold text-blue-700 transition hover:bg-blue-100">Ver</Link>
                                            <button onClick={() => eliminar(c)} className="rounded-lg bg-rose-50 px-3 py-1.5 font-bold text-rose-700 transition hover:bg-rose-100">Eliminar</button>
                                        </div></td>
                                    </tr>
                                ))}
                                {!cotizaciones.data.length && <tr><td colSpan={6} className="p-12 text-center"><span className="text-4xl">🧾</span><p className="mt-3 font-bold text-slate-700">Aún no hay cotizaciones</p></td></tr>}
                            </tbody>
                        </table>
                    </div>
                    {cotizaciones.links.length > 3 && (
                        <div className="flex flex-wrap justify-center gap-1 p-4">
                            {cotizaciones.links.map((l, i) => (
                                <button key={i} disabled={!l.url} onClick={() => l.url && router.get(l.url, {}, { preserveState: true })}
                                    className={`rounded-lg px-3 py-1.5 text-sm font-bold ${l.active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"} disabled:opacity-40`}
                                    dangerouslySetInnerHTML={{ __html: l.label }} />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </SistemaLayout>
    );
}
