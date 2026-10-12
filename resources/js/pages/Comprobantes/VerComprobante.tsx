import SistemaLayout from "@/layouts/SistemaLayout/SistemaLayout";
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
            <div className="w-full max-w-3xl mx-auto px-4 py-8 space-y-4">
                <div className="flex justify-between items-center print:hidden">
                    <Link href="/comprobantes" className="text-blue-600 hover:underline">← Volver a comprobantes</Link>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">Impreso {impresiones} {impresiones === 1 ? 'vez' : 'veces'}</span>
                        <button onClick={imprimir} className="rounded bg-blue-600 text-white px-4 py-2 hover:bg-blue-700">Imprimir</button>
                    </div>
                </div>

                <article className="bg-white rounded-lg shadow-md p-6 print:shadow-none print:p-0 space-y-4">
                    <header className="text-center border-b pb-3">
                        <h1 className="text-3xl font-bold text-slate-900">Ferrum</h1>
                        <p className="text-gray-600">Comprobante de venta</p>
                        <p className="text-xl font-semibold">{comprobante.numero_comprobante}</p>
                    </header>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <p><b>Fecha:</b> {comprobante.fecha_emision}</p>
                        <p><b>Vendedor:</b> {comprobante.vendedor ?? '-'}</p>
                        <p><b>Cliente:</b> {comprobante.cliente?.nombre ?? 'Público general'}</p>
                        <p><b>Tipo de pago:</b> {comprobante.tipo_pago === 'credito' ? 'Crédito' : 'Contado'}</p>
                    </div>

                    <table className="w-full text-left text-sm">
                        <thead className="border-b">
                            <tr>
                                <th className="py-2">Producto</th>
                                <th className="py-2">Lote</th>
                                <th className="py-2 text-right">Cant.</th>
                                <th className="py-2 text-right">Precio</th>
                                <th className="py-2 text-right">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {comprobante.detalles.map((d) => (
                                <tr key={d.id_detalle} className="border-b">
                                    <td className="py-2">{d.producto}</td>
                                    <td className="py-2">{d.lote}</td>
                                    <td className="py-2 text-right">{d.cantidad}</td>
                                    <td className="py-2 text-right">Q{Number(d.precio_unitario).toFixed(2)}</td>
                                    <td className="py-2 text-right">Q{Number(d.subtotal).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="flex justify-end text-xl font-bold">Total: Q{Number(comprobante.total).toFixed(2)}</div>

                    {comprobante.credito && (
                        <div className="border rounded p-3 text-sm space-y-1">
                            <p><b>Fecha de vencimiento:</b> {comprobante.credito.fecha_vencimiento}</p>
                            <p><b>Saldo pendiente:</b> Q{Number(comprobante.credito.saldo_pendiente).toFixed(2)}</p>
                        </div>
                    )}

                    <p className="text-center text-gray-500 text-sm pt-2">¡Gracias por su compra!</p>
                </article>
            </div>
        </SistemaLayout>
    );
}
