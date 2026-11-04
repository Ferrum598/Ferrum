import SistemaLayout from "@/layouts/SistemaLayout/SistemaLayout";
import { AVISO_INTERNO, BadgeTipoPago } from "@/components/PaginacionVentas/AvisoInterno";
import { ComprobanteDetalle } from "@/components/Interfaces/interfaceCatalogo";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const leerXsrf = () => {
    const m = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/);
    return m ? decodeURIComponent(m[1]) : '';
};

export default function VerComprobante({ comprobante }: { comprobante: ComprobanteDetalle }) {
    const [impresiones, setImpresiones] = useState(comprobante.veces_impreso);

    const { flash } = usePage<{ flash?: { title: string; icon: 'success' | 'error'; message: string } | null }>().props;
    useEffect(() => { if (flash) Swal.fire({ icon: flash.icon, title: flash.title, text: flash.message, timer: 3000, showConfirmButton: false }); }, [flash]);

    const desactivar = async () => {
        const r = await Swal.fire({
            title: '¿Desactivar comprobante?',
            text: 'Se devolverán los productos al inventario y la venta dejará de sumar en los reportes. Esta acción no se puede revertir.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, desactivar',
            cancelButtonText: 'Cancelar',
        });
        if (r.isConfirmed) router.post(`/comprobantes/${comprobante.id_comprobante}/anular`, {}, { preserveScroll: true });
    };

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
            <style>{`@media print {
                html, body, #app { height: auto !important; min-height: 0 !important; overflow: visible !important; background: #fff !important; }
                #app > div:has(.receipt-print-root) { display: block !important; height: auto !important; min-height: 0 !important; overflow: visible !important; }
                main:has(.receipt-print-root) { display: block !important; height: auto !important; overflow: visible !important; margin: 0 !important; padding: 0 !important; }
                .receipt-print-root { display: block !important; width: 100% !important; max-width: none !important; margin: 0 !important; padding: 0 !important; overflow: visible !important; }
                .receipt-print-root article { width: 100% !important; max-width: none !important; overflow: visible !important; border: 0 !important; border-radius: 0 !important; box-shadow: none !important; }
                .receipt-print-root article > div { padding: 2mm !important; }
                .receipt-print-root table { width: 100% !important; table-layout: fixed !important; border-collapse: collapse !important; }
                .receipt-print-root thead { display: table-header-group; }
                .receipt-print-root tr { break-inside: avoid; page-break-inside: avoid; }
                .receipt-print-root th, .receipt-print-root td { overflow-wrap: anywhere !important; }
            }`}</style>
            <div className="receipt-print-root w-full max-w-3xl mx-auto px-4 py-8 space-y-4 print:p-0 print:max-w-none">
                <div className="flex justify-between items-center flex-wrap gap-2 print:hidden">
                    <Link href="/comprobantes" className="text-blue-600 hover:underline font-medium">← Volver a comprobantes</Link>
                    <div className="flex items-center gap-3">
                        <span className="rounded-full bg-slate-100 text-slate-600 px-3 py-1 text-sm">🖨️ Impreso {impresiones} {impresiones === 1 ? 'vez' : 'veces'}</span>
                        {!comprobante.anulado && <button onClick={desactivar} className="rounded-xl bg-rose-50 text-rose-700 px-5 py-2.5 font-semibold hover:bg-rose-100 active:scale-95 transition">Desactivar</button>}
                        <button onClick={imprimir} className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 font-semibold shadow-lg hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition">Imprimir</button>
                    </div>
                </div>

                <article className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden print:shadow-none print:border-0 print:rounded-none">
                    <header className="text-center bg-gradient-to-r from-slate-900 to-blue-800 text-white px-6 py-6 print:bg-none print:text-black print:border-b-2 print:border-black">
                        <h1 className="text-4xl font-extrabold tracking-wide">Ferrum</h1>
                        <p className="text-blue-100 print:text-black text-sm mt-1">2da. Calle 2-59 Z.2</p>
                        <p className="text-blue-100 print:text-black text-sm mt-1">Tel: 7791-8720</p>
                        <p className="text-blue-100 print:text-black uppercase tracking-widest text-sm mt-1">Comprobante de venta</p>
                        <p className="inline-block mt-3 rounded-full bg-white/15 print:bg-transparent print:border print:border-black px-4 py-1 text-xl font-bold">{comprobante.numero_comprobante}</p>
                    </header>

                    <div className="p-6 space-y-5">
                        {comprobante.anulado && (
                            <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-center font-bold text-rose-800">
                                COMPROBANTE DESACTIVADO{comprobante.fecha_anulacion ? ` el ${comprobante.fecha_anulacion}` : ''}. No tiene valor en ventas ni inventario.
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm bg-slate-50 rounded-xl p-1 print:bg-transparent print:border">
                            <p><b className="text-slate-500">Fecha:</b> {comprobante.fecha_emision}</p>
                            <p><b className="text-slate-500">Atendido por:</b> {comprobante.vendedor ?? '-'}</p>
                            <p><b className="text-slate-500">Cliente:</b> {comprobante.cliente?.nombre ?? 'Público general'}</p>
                        </div>

                        <table className="w-full table-fixed text-left text-xs print:text-[10px]">
                            <colgroup>
                                <col className="w-[40%]" />
                                <col className="w-[12%]" />
                                <col className="w-[21%]" />
                                <col className="w-[27%]" />
                            </colgroup>

                            <thead className="bg-slate-100 text-slate-700 uppercase text-xs print:bg-transparent print:border-b-2 print:border-black">
                                <tr>
                                    <th className="p-1 text-left">Descripción</th>
                                    <th className="p-1 text-right">Cant.</th>
                                    <th className="p-1 text-right">Precio</th>
                                    <th className="p-1 text-right">Subtotal</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {comprobante.detalles.map((d) => (
                                    <tr key={d.id_detalle}>
                                        <td className="p-1 font-medium text-slate-800 break-words">
                                            {d.descripcion || '—'}
                                        </td>

                                        <td className="p-1 text-right whitespace-nowrap">
                                            {d.cantidad}
                                        </td>

                                        <td className="p-1 text-right whitespace-nowrap">
                                            Q{Number(d.precio_unitario).toFixed(2)}
                                        </td>

                                        <td className="p-1 text-right font-semibold break-words">
                                            Q{Number(d.subtotal).toFixed(2)}

                                            {d.descuento_porcentaje > 0 && (
                                                <div className="text-[9px] font-normal text-emerald-700 print:text-black break-words">
                                                    Desc. {d.descuento_porcentaje}% (-Q{Number(d.descuento_monto).toFixed(2)})
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="flex justify-end">
                            <div className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-2 py-2 text-sm font-extrabold shadow print:bg-none print:text-black print:border-2 print:border-black print:shadow-none">
                                <p className="flex items-center gap-2"><b className="text-slate-500">Forma de Pago:</b> <BadgeTipoPago tipo={comprobante.tipo_pago} /></p>
                                Total: Q{Number(comprobante.total).toFixed(2)}
                            </div>
                        </div>
                        {comprobante.tipo_pago === 'contado' && comprobante.monto_recibido !== null && comprobante.cambio !== null && (
                            <div className="ml-auto w-full max-w-xs space-y-1 text-right text-xs print:max-w-none">
                                <p>Recibido: Q{Number(comprobante.monto_recibido).toFixed(2)}</p>
                                <p className="font-bold">Cambio: Q{Number(comprobante.cambio).toFixed(2)}</p>
                            </div>
                        )}

                        {comprobante.credito && (
                            <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm space-y-1 text-amber-900">
                                <p><b>Fecha de vencimiento:</b> {comprobante.credito.fecha_vencimiento}</p>
                                <p><b>Saldo pendiente:</b> Q{Number(comprobante.credito.saldo_pendiente).toFixed(2)}</p>
                            </div>
                        )}

                        <p className="text-center text-slate-500 text-sm pt-2">¡Gracias por su compra!</p>
                        <p className="text-right text-[10px] leading-snug text-slate-500 max-w-xs ml-auto">{AVISO_INTERNO}</p>
                    </div>
                </article>
            </div>
        </SistemaLayout>
    );
}
