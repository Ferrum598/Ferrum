import SistemaLayout from '@/layouts/SistemaLayout/SistemaLayout';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

type Fila = { id_producto: number; nombre_producto: string; descripcion: string | null; categoria: string | null; existencias: number; precio_min: number | null; precio_max: number | null };

const moneda = (v: number) => Number(v).toLocaleString('es-US', { style: 'currency', currency: 'GTQ' });
const leerXsrf = () => {
    const m = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/);
    return m ? decodeURIComponent(m[1]) : '';
};

export default function ImprimirInventario() {
    const [filas, setFilas] = useState<Fila[] | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        const ids: number[] = JSON.parse(sessionStorage.getItem('inventario_imprimir') || '[]');
        if (!ids.length) { setFilas([]); return; }
        fetch('/inventario/imprimir/datos', {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest', 'X-XSRF-TOKEN': leerXsrf() },
            body: JSON.stringify({ ids }),
        })
            .then((r) => (r.ok ? r.json() : Promise.reject()))
            .then(setFilas)
            .catch(() => setError(true));
    }, []);

    const precio = (f: Fila) => (f.precio_min === null ? '—' : f.precio_min === f.precio_max ? moneda(f.precio_min) : `${moneda(f.precio_min)} – ${moneda(f.precio_max!)}`);

    return (
        <SistemaLayout>
            <Head title="Imprimir inventario" />
            <style>{`@page { size: A4 portrait; margin: 12mm; }
                @media print {
                    html, body, #app { height: auto !important; min-height: 0 !important; overflow: visible !important; background: #fff !important; }
                    #app > div:has(.inventory-print-root) { display: block !important; height: auto !important; min-height: 0 !important; overflow: visible !important; }
                    main:has(.inventory-print-root) { display: block !important; height: auto !important; overflow: visible !important; margin: 0 !important; padding: 0 !important; }
                    .inventory-print-root, .inventory-print-card { display: block !important; width: 100% !important; max-width: none !important; height: auto !important; max-height: none !important; overflow: visible !important; margin: 0 !important; padding: 0 !important; border: 0 !important; border-radius: 0 !important; box-shadow: none !important; }
                    .inventory-print-root table { width: 100% !important; border-collapse: collapse !important; }
                    .inventory-print-root thead { display: table-header-group; }
                    .inventory-print-root tr { break-inside: avoid; page-break-inside: avoid; }
                }`}</style>
            <div className="inventory-print-root mx-auto w-full max-w-4xl space-y-4 px-4 py-8 print:max-w-none print:p-0">
                <div className="flex justify-between gap-3 print:hidden">
                    <Link href="/inventario" className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-600 transition hover:bg-slate-50">← Volver</Link>
                    <button onClick={() => window.print()} disabled={!filas?.length} className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50">🖨️ Imprimir</button>
                </div>
                <div className="inventory-print-card rounded-3xl border border-slate-100 bg-white p-6 shadow-md md:p-8 print:border-0 print:shadow-none">
                    <div className="mb-5 flex flex-wrap items-end justify-between gap-2 border-b border-slate-100 pb-4">
                        <h1 className="bg-gradient-to-r from-slate-900 to-blue-700 bg-clip-text text-2xl font-extrabold text-transparent">📦 Inventario</h1>
                        <p className="text-sm text-slate-500">{new Date().toLocaleDateString('es-GT')} · {filas?.length ?? 0} productos</p>
                    </div>
                    {error && <p className="text-red-600">No se pudo cargar el inventario.</p>}
                    {filas && !filas.length && !error && <p className="text-slate-500">No hay productos seleccionados. Vuelve al inventario y elige los que quieras imprimir.</p>}
                    {!filas && !error && <p className="text-slate-500">Cargando…</p>}
                    {!!filas?.length && (
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gradient-to-r from-slate-900 to-blue-800 text-xs uppercase tracking-wide text-white">
                                <tr><th className="p-3">Producto</th><th className="p-3">Categoría</th><th className="p-3">Existencias</th><th className="p-3">Precio venta</th></tr>
                            </thead>
                            <tbody>
                                {filas.map((f) => (
                                    <tr key={f.id_producto} className="border-b border-slate-100 break-inside-avoid">
                                        <td className="p-3 font-semibold text-slate-800">{f.descripcion?.trim() || f.nombre_producto}</td>
                                        <td className="p-3 text-slate-600">{f.categoria ?? '—'}</td>
                                        <td className="p-3 font-bold text-slate-800">{f.existencias}</td>
                                        <td className="p-3 text-slate-800">{precio(f)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </SistemaLayout>
    );
}
