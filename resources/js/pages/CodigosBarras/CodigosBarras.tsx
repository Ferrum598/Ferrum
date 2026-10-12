import SistemaLayout from '@/layouts/SistemaLayout/SistemaLayout';
import useFlashSwal from '@/components/FlashSwal/useFlashSwal';
import { Head, router, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { CodigoBarraItem, LoteOpcion, PaginadoInventario } from '@/components/Interfaces/interfaceInventario';

const moneda = (v: number) => Number(v).toLocaleString('es-US', { style: 'currency', currency: 'GTQ' });
const input = 'w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 transition focus:outline-none focus:ring-2 focus:ring-blue-500';
const btnPag = 'rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-sm transition hover:bg-slate-100 disabled:opacity-50';

export default function CodigosBarras({ codigos, lotes, buscar = '' }: { codigos: PaginadoInventario<CodigoBarraItem>; lotes: LoteOpcion[]; buscar?: string }) {
    useFlashSwal();

    const [texto, setTexto] = useState(buscar);
    const [seleccion, setSeleccion] = useState<number[]>([]);
    const [copias, setCopias] = useState(1);
    const { data, setData, post, processing, errors, reset } = useForm({ fk_lote: '', tipo_codigo: 'code128', codigo: '' });

    useEffect(() => {
        if (texto === buscar) return;
        const t = setTimeout(() => router.visit(`/codigos-barras?buscar=${encodeURIComponent(texto)}`, { preserveState: true, replace: true }), 500);
        return () => clearTimeout(t);
    }, [texto]);

    const generar = (e: React.FormEvent) => {
        e.preventDefault();
        post('/codigos-barras/generar', { preserveScroll: true, onSuccess: () => reset('codigo') });
    };

    const alternar = (id: number) => setSeleccion((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
    const irPagina = (page: number) => router.visit(`/codigos-barras?buscar=${encodeURIComponent(texto)}&page=${page}`, { preserveState: true, replace: true });
    const imprimir = (ids: number[]) => router.visit(`/codigos-barras/imprimir?codigos=${ids.join(',')}&copias=${copias}`);

    return (
        <SistemaLayout>
            <Head title="Códigos de barras" />
            <div className="mx-auto w-full space-y-6 px-6 py-8">
                <h1 className="bg-gradient-to-r from-slate-900 to-blue-700 bg-clip-text text-3xl font-extrabold text-transparent">🏷️ Códigos de barras</h1>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-5 text-white shadow-lg">
                        <p className="text-sm opacity-80">🔖 Códigos registrados</p>
                        <p className="text-3xl font-extrabold">{codigos.total}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-md">
                        <p className="text-sm text-slate-500">✅ Activos en esta página</p>
                        <p className="text-3xl font-extrabold text-emerald-600">{codigos.data.filter((c) => c.activo).length}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-md">
                        <p className="text-sm text-slate-500">🖨️ Seleccionados para imprimir</p>
                        <p className="text-3xl font-extrabold text-slate-800">{seleccion.length}</p>
                    </div>
                </div>

                <form onSubmit={generar} className="grid w-full grid-cols-1 gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-md md:grid-cols-4">
                    <h2 className="font-semibold text-slate-800 md:col-span-4">➕ Generar código</h2>
                    <div className="flex flex-col gap-1 md:col-span-2">
                        <label className="text-sm font-medium text-slate-700">Lote</label>
                        <select className={input} value={data.fk_lote} onChange={(e) => setData('fk_lote', e.target.value)}>
                            <option value="">Seleccione un lote</option>
                            {lotes.map((l) => (
                                <option key={l.id_lote} value={l.id_lote}>
                                    {l.etiqueta}
                                </option>
                            ))}
                        </select>
                        {errors.fk_lote && <span className="text-sm text-red-600">{errors.fk_lote}</span>}
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-slate-700">Tipo</label>
                        <select className={input} value={data.tipo_codigo} onChange={(e) => setData('tipo_codigo', e.target.value)}>
                            <option value="code128">Code 128</option>
                            <option value="ean13">EAN-13</option>
                            <option value="code39">Code 39</option>
                        </select>
                        {errors.tipo_codigo && <span className="text-sm text-red-600">{errors.tipo_codigo}</span>}
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-slate-700">Código (vacío = automático)</label>
                        <input className={input} type="text" value={data.codigo} onChange={(e) => setData('codigo', e.target.value)} placeholder="FER-000123" />
                        {errors.codigo && <span className="text-sm text-red-600">{errors.codigo}</span>}
                    </div>
                    <div className="md:col-span-4">
                        <button type="submit" disabled={processing} className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 font-semibold text-white shadow-lg transition hover:from-blue-700 hover:to-indigo-700 active:scale-95 disabled:opacity-50">
                            {processing ? 'Generando...' : 'Generar código'}
                        </button>
                    </div>
                </form>

                <div className="w-full overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-md">
                    <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 bg-slate-50 px-6 py-4">
                        <input className={`${input} min-w-[220px] flex-1`} placeholder="🔍 Buscar por código, producto o lote..." value={texto} onChange={(e) => setTexto(e.target.value)} />
                        <label className="flex items-center gap-2 text-sm text-slate-700">
                            Copias
                            <input type="number" min={1} max={200} value={copias} onChange={(e) => setCopias(Math.max(1, Number(e.target.value) || 1))} className="w-20 rounded-xl border border-slate-200 bg-white p-2" />
                        </label>
                        <button disabled={seleccion.length === 0} onClick={() => imprimir(seleccion)} className="cursor-pointer rounded-xl bg-gradient-to-r from-slate-900 to-blue-800 px-4 py-2 font-semibold text-white shadow transition hover:opacity-90 active:scale-95 disabled:opacity-50">
                            🖨️ Imprimir seleccionados ({seleccion.length})
                        </button>
                    </div>

                    {codigos.data.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">
                            <div className="mb-2 text-5xl">🔖</div>
                            No hay códigos de barras.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-gradient-to-r from-slate-900 to-blue-800 text-left text-xs uppercase tracking-wide text-white">
                                    <tr>
                                        <th className="px-4 py-3"></th>
                                        <th className="px-4 py-3">Código</th>
                                        <th className="px-4 py-3">Tipo</th>
                                        <th className="px-4 py-3">Producto</th>
                                        <th className="px-4 py-3">Lote</th>
                                        <th className="px-4 py-3">Precio venta</th>
                                        <th className="px-4 py-3">Impresiones</th>
                                        <th className="px-4 py-3">Estado</th>
                                        <th className="px-4 py-3">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {codigos.data.map((c) => (
                                        <tr key={c.id_codigo} className="transition hover:bg-blue-50/60">
                                            <td className="px-4 py-3">
                                                <input type="checkbox" className="h-4 w-4 accent-blue-600" checked={seleccion.includes(c.id_codigo)} onChange={() => alternar(c.id_codigo)} />
                                            </td>
                                            <td className="px-4 py-3 font-mono font-semibold text-slate-800">{c.codigo}</td>
                                            <td className="px-4 py-3"><span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold uppercase text-indigo-700">{c.tipo_codigo}</span></td>
                                            <td className="px-4 py-3 text-slate-800">{c.producto}</td>
                                            <td className="px-4 py-3 text-slate-600">{c.nombre_lote || `Lote #${c.id_lote}`}</td>
                                            <td className="px-4 py-3 font-semibold text-slate-800">{moneda(c.precio_venta)}</td>
                                            <td className="px-4 py-3 text-slate-600">{c.veces_impreso}</td>
                                            <td className="px-4 py-3">
                                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${c.activo ? 'bg-emerald-100 text-emerald-700 ring-emerald-200' : 'bg-slate-100 text-slate-500 ring-slate-200'}`}>
                                                    {c.activo ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-3 font-medium">
                                                    <button className="cursor-pointer text-blue-600 hover:underline disabled:opacity-40" disabled={!c.activo} onClick={() => imprimir([c.id_codigo])}>
                                                        🖨️ Imprimir
                                                    </button>
                                                    <button className="cursor-pointer text-slate-700 hover:underline" onClick={() => router.post(`/codigos-barras/${c.id_codigo}/estado`, {}, { preserveScroll: true })}>
                                                        {c.activo ? 'Desactivar' : 'Activar'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {codigos.last_page > 1 && (
                        <div className="flex items-center justify-center gap-2 border-t border-slate-100 px-6 py-4">
                            <button className={btnPag} disabled={codigos.current_page === 1} onClick={() => irPagina(codigos.current_page - 1)}>Anterior</button>
                            <span className="px-3 py-1.5 text-sm text-slate-600">Página {codigos.current_page} de {codigos.last_page}</span>
                            <button className={btnPag} disabled={codigos.current_page === codigos.last_page} onClick={() => irPagina(codigos.current_page + 1)}>Siguiente</button>
                        </div>
                    )}
                </div>
            </div>
        </SistemaLayout>
    );
}
