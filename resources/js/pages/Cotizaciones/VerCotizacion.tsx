import SistemaLayout from "@/layouts/SistemaLayout/SistemaLayout";
import { Head, Link, usePage } from "@inertiajs/react";
import { useEffect } from "react";
import Swal from "sweetalert2";

type Detalle = { id: number; descripcion: string; cantidad: number; precio_unitario: number; subtotal: number };
type Cot = { id_cotizacion: number; numero_cotizacion: string; cliente: string; atendio: string | null; fecha_emision: string; valida_hasta: string | null; total: number; notas: string | null; detalles: Detalle[] };
type Props = { cotizacion: Cot; flash?: { title: string; icon: "success" | "error"; message: string } | null };

const money = (v: number) => `Q${Number(v || 0).toLocaleString("es-GT", { minimumFractionDigits: 2 })}`;

export default function VerCotizacion({ cotizacion }: Props) {
    const { flash } = usePage<Props>().props;
    useEffect(() => { if (flash) Swal.fire({ icon: flash.icon, title: flash.title, text: flash.message, timer: 3000, showConfirmButton: false }); }, [flash]);

    return (
        <SistemaLayout>
            <Head title={`Cotización ${cotizacion.numero_cotizacion}`} />
            <div className="w-full max-w-3xl mx-auto px-4 py-8 space-y-4 print:p-0 print:max-w-none">
                <div className="flex justify-between gap-3 print:hidden">
                    <Link href="/cotizaciones" className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-600 transition hover:bg-slate-50">← Volver</Link>
                    <button onClick={() => window.print()} className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg">🖨️ Imprimir</button>
                </div>
                <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md md:p-8 print:border-0 print:shadow-none">
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-5">
                        <div>
                            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-slate-900 to-blue-700 bg-clip-text text-transparent">Cotización</h1>
                            <p className="text-lg font-extrabold text-slate-800">{cotizacion.numero_cotizacion}</p>
                        </div>
                        <div className="text-sm text-slate-600 text-right">
                            <p>Fecha: <b>{cotizacion.fecha_emision}</b></p>
                            {cotizacion.valida_hasta && <p>Válida hasta: <b>{cotizacion.valida_hasta}</b></p>}
                        </div>
                    </div>
                    <div className="py-4 text-sm text-slate-600">
                        <p>Cliente: <b className="text-slate-800">{cotizacion.cliente}</b></p>
                        {cotizacion.atendio && <p>Atendió: <b className="text-slate-800">{cotizacion.atendio}</b></p>}
                    </div>
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gradient-to-r from-slate-900 to-blue-900 text-xs uppercase tracking-wide text-white">
                            <tr><th className="p-3">Descripción</th><th className="p-3">Cant.</th><th className="p-3">Precio</th><th className="p-3">Subtotal</th></tr>
                        </thead>
                        <tbody>
                            {cotizacion.detalles.map((d) => (
                                <tr key={d.id} className="border-b border-slate-100">
                                    <td className="p-3 font-bold text-slate-800">{d.descripcion}</td>
                                    <td className="p-3">{d.cantidad}</td>
                                    <td className="p-3">{money(d.precio_unitario)}</td>
                                    <td className="p-3 font-extrabold text-slate-900">{money(d.subtotal)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <p className="mt-5 text-right text-2xl font-black text-slate-900">Total: {money(cotizacion.total)}</p>
                    {cotizacion.notas && <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">{cotizacion.notas}</p>}
                </div>
            </div>
        </SistemaLayout>
    );
}
