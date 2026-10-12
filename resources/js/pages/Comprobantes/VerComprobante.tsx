import SistemaLayout from "@/layouts/SistemaLayout/SistemaLayout";
import { AvisoInterno, BadgeTipoPago } from "@/components/PaginacionVentas/AvisoInterno";
import { ComprobanteDetalle } from "@/components/Interfaces/interfaceCatalogo";
import { Head, Link } from "@inertiajs/react";
import { useState } from "react";

const leerXsrf = () => {
    const m = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/);
    return m ? decodeURIComponent(m[1]) : '';
};

export default function VerComprobante({ comprobante }: { comprobante: ComprobanteDetalle }) {
    const [impresiones, setImpresiones] = useState(comprobante.veces_impreso);

    const imprimir = async () => {
        window.print();
        try {
            const res = await fetch(`/comprobantes/${comprobante.id_comprobante}/impreso`, {
                method: 'POST',
                credentials: 'same-origin',
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest', 'X-XSRF-TOKEN': leerXsrf() },
            });
            if (res.ok) setImpresiones((await res.json()).veces_impreso);
        } catch { /* el conteo de impresiones es informativo */ }
    };

    return (
        <SistemaLayout>
            <Head title={`Comprobante ${comprobante.numero_comprobante}`} />
            <div className="w-full max-w-3xl mx-auto px-4 py-8 space-y-4 print:p-0 print:max-w-none">
                <div className="flex justify-between items-center flex-wrap gap-2 print:hidden">
                    <Link href="/comprobantes" className="text-blue-600 hover:underline font-medium">← Volver a comprobantes</Link>
                    <div className="flex items-center gap-3">
                        <span className="rounded-full bg-slate-100 text-slate-600 px-3 py-1 text-sm">🖨️ Impreso {impresiones} {impresiones === 1 ? 'vez' : 'veces'}</span>
                        <button onClick={imprimir} className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 font-semibold shadow-lg hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition">Imprimir</button>
                    </div>
                </div>

                <article className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden print:shadow-none print:border-0 print:rounded-none">
                    <header className="text-center bg-gradient-to-r from-slate-900 to-blue-800 text-white px-6 py-6 print:bg-none print:text-black print:border-b-2 print:border-black">
                        <h1 className="text-4xl font-extrabold tracking-wide">Ferrum</h1>
                        <p className="text-blue-100 print:text-black uppercase tracking-widest text-sm mt-1">Comprobante de venta interno</p>
                        <p className="inline-block mt-3 rounded-full bg-white/15 print:bg-transparent print:border print:border-black px-4 py-1 text-xl font-bold">{comprobante.numero_comprobante}</p>
                    </header>

                    <div className="p-6 space-y-5">
                        <AvisoInterno />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm bg-slate-50 rounded-xl p-4 print:bg-transparent print:border">
                            <p><b className="text-slate-500">Fecha:</b> {comprobante.fecha_emision}</p>
                            <p><b className="text-slate-500">Vendedor:</b> {comprobante.vendedor ?? '-'}</p>
                            <p><b className="text-slate-500">Cliente:</b> {comprobante.cliente?.nombre ?? 'Público general'}</p>
                            <p className="flex items-center gap-2"><b className="text-slate-500">Tipo de pago:</b> <BadgeTipoPago tipo={comprobante.tipo_pago} /></p>
                        </div>

                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-100 text-slate-700 uppercase text-xs print:bg-transparent print:border-b-2 print:border-black">
                                <tr>
                                    <th className="p-2">Producto</th>
                                    <th className="p-2">Lote</th>
                                    <th className="p-2 text-right">Cant.</th>
                                    <th className="p-2 text-right">Precio</th>
                                    <th className="p-2 text-right">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {comprobante.detalles.map((d) => (
                                    <tr key={d.id_detalle}>
                                        <td className="p-2 font-medium text-slate-800">{d.producto}</td>
                                        <td className="p-2 text-slate-600">{d.lote}</td>
                                        <td className="p-2 text-right">{d.cantidad}</td>
                                        <td className="p-2 text-right">Q{Number(d.precio_unitario).toFixed(2)}</td>
                                        <td className="p-2 text-right font-semibold">Q{Number(d.subtotal).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="flex justify-end">
                            <div className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 text-2xl font-extrabold shadow print:bg-none print:text-black print:border-2 print:border-black print:shadow-none">
                                Total: Q{Number(comprobante.total).toFixed(2)}
                            </div>
                        </div>

                        {comprobante.credito && (
                            <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm space-y-1 text-amber-900">
                                <p><b>Fecha de vencimiento:</b> {comprobante.credito.fecha_vencimiento}</p>
                                <p><b>Saldo pendiente:</b> Q{Number(comprobante.credito.saldo_pendiente).toFixed(2)}</p>
                            </div>
                        )}

                        <p className="text-center text-slate-500 text-sm pt-2">¡Gracias por su compra!</p>
                    </div>
                </article>
            </div>
        </SistemaLayout>
    );
}
