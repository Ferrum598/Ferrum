import SistemaLayout from "@/layouts/SistemaLayout/SistemaLayout";
import PaginacionVentas from "@/components/PaginacionVentas/PaginacionVentas";
import { ComprobanteLista, Paginado } from "@/components/Interfaces/interfaceCatalogo";
import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";

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
            <div className="w-full mx-auto px-6 py-8 space-y-6">
                <h1 className="text-3xl font-bold text-slate-900">Comprobantes</h1>

                <form onSubmit={aplicar} className="flex flex-col md:flex-row gap-3 bg-gray-50 shadow-sm p-3 rounded md:items-end">
                    <input type="text" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por número o cliente..." className="w-full md:w-1/2 rounded border p-2" />
                    <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="rounded border p-2" />
                    <button type="submit" className="rounded bg-blue-600 text-white px-4 py-2 hover:bg-blue-700">Buscar</button>
                    <button type="button" onClick={() => { setQ(''); setFecha(''); router.get('/comprobantes'); }} className="rounded border px-4 py-2 hover:bg-gray-100">Limpiar</button>
                </form>

                <div className="overflow-x-auto bg-white rounded-lg shadow-md">
                    <table className="min-w-full text-left">
                        <thead className="bg-gray-100 text-gray-700">
                            <tr>
                                <th className="p-3">Número</th>
                                <th className="p-3">Fecha</th>
                                <th className="p-3">Cliente</th>
                                <th className="p-3">Tipo</th>
                                <th className="p-3 text-right">Total</th>
                                <th className="p-3 text-center">Impresiones</th>
                                <th className="p-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {comprobantes.data.length === 0 ? (
                                <tr><td colSpan={7} className="p-6 text-center text-gray-500">No se encontraron comprobantes.</td></tr>
                            ) : comprobantes.data.map((c) => (
                                <tr key={c.id_comprobante} className="border-t">
                                    <td className="p-3 font-semibold">{c.numero_comprobante}</td>
                                    <td className="p-3">{c.fecha_emision}</td>
                                    <td className="p-3">{c.cliente ?? 'Público general'}</td>
                                    <td className="p-3">{c.tipo_pago === 'credito' ? 'Crédito' : 'Contado'}</td>
                                    <td className="p-3 text-right">Q{Number(c.total).toFixed(2)}</td>
                                    <td className="p-3 text-center">{c.veces_impreso}</td>
                                    <td className="p-3"><Link href={`/comprobantes/${c.id_comprobante}`} className="text-blue-600 hover:underline">Ver</Link></td>
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
