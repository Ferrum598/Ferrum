import SistemaLayout from "@/layouts/SistemaLayout/SistemaLayout";
import PaginacionVentas from "@/components/PaginacionVentas/PaginacionVentas";
import { Paginado, VentaHistorial } from "@/components/Interfaces/interfaceCatalogo";
import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";

interface Filtros { desde?: string; hasta?: string; cliente?: string; tipo?: string }

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

    return (
        <SistemaLayout>
            <Head title="Historial de ventas" />
            <div className="w-full mx-auto px-6 py-8 space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <h1 className="text-3xl font-bold text-slate-900">Historial de ventas</h1>
                    <Link href="/ventas" className="text-blue-600 hover:underline">Ir al punto de venta</Link>
                </div>

                <form onSubmit={aplicar} className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-gray-50 shadow-sm p-3 rounded items-end">
                    <label className="text-gray-600">Desde
                        <input type="date" value={f.desde} onChange={(e) => setF({ ...f, desde: e.target.value })} className="mt-1 block w-full rounded border p-2" />
                    </label>
                    <label className="text-gray-600">Hasta
                        <input type="date" value={f.hasta} onChange={(e) => setF({ ...f, hasta: e.target.value })} className="mt-1 block w-full rounded border p-2" />
                    </label>
                    <label className="text-gray-600">Cliente
                        <input type="text" value={f.cliente} onChange={(e) => setF({ ...f, cliente: e.target.value })} placeholder="Nombre del cliente" className="mt-1 block w-full rounded border p-2" />
                    </label>
                    <label className="text-gray-600">Tipo
                        <select value={f.tipo} onChange={(e) => setF({ ...f, tipo: e.target.value })} className="mt-1 block w-full rounded border p-2">
                            <option value="">Todos</option>
                            <option value="contado">Contado</option>
                            <option value="credito">Crédito</option>
                        </select>
                    </label>
                    <div className="flex gap-2">
                        <button type="submit" className="rounded bg-blue-600 text-white px-4 py-2 hover:bg-blue-700">Filtrar</button>
                        <button type="button" onClick={limpiar} className="rounded border px-4 py-2 hover:bg-gray-100">Limpiar</button>
                    </div>
                </form>

                <div className="overflow-x-auto bg-white rounded-lg shadow-md">
                    <table className="min-w-full text-left">
                        <thead className="bg-gray-100 text-gray-700">
                            <tr>
                                <th className="p-3">Fecha</th>
                                <th className="p-3">Cliente</th>
                                <th className="p-3">Vendedor</th>
                                <th className="p-3">Tipo</th>
                                <th className="p-3 text-right">Total</th>
                                <th className="p-3">Comprobante</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ventas.data.length === 0 ? (
                                <tr><td colSpan={6} className="p-6 text-center text-gray-500">No hay ventas registradas.</td></tr>
                            ) : ventas.data.map((v) => (
                                <tr key={v.id_venta} className="border-t">
                                    <td className="p-3">{v.fecha_venta}</td>
                                    <td className="p-3">{v.cliente ?? 'Público general'}</td>
                                    <td className="p-3">{v.vendedor}</td>
                                    <td className="p-3">{v.tipo_pago === 'credito' ? 'Crédito' : 'Contado'}</td>
                                    <td className="p-3 text-right">Q{Number(v.total).toFixed(2)}</td>
                                    <td className="p-3">
                                        {v.id_comprobante ? <Link href={`/comprobantes/${v.id_comprobante}`} className="text-blue-600 hover:underline">{v.numero_comprobante}</Link> : '-'}
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
