import SistemaLayout from '@/layouts/SistemaLayout/SistemaLayout';
import useFlashSwal from '@/components/FlashSwal/useFlashSwal';
import { Head, router, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { CodigoBarraItem, LoteOpcion, PaginadoInventario } from '@/components/Interfaces/interfaceInventario';

const moneda = (v: number) => Number(v).toLocaleString('es-US', { style: 'currency', currency: 'GTQ' });

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

    const input = 'w-full rounded-lg border border-slate-300 p-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500';

    return (
        <SistemaLayout>
            <Head title="Códigos de barras" />
            <div className="mx-auto w-full space-y-8 px-6 py-8">
                <h1 className="text-3xl font-bold text-slate-900">Códigos de barras</h1>

                <form onSubmit={generar} className="grid w-full grid-cols-1 gap-4 rounded-xl bg-white/80 p-6 shadow-lg ring-1 ring-slate-200 md:grid-cols-4">
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
                        <button type="submit" disabled={processing} className="rounded-lg bg-blue-600 px-4 py-2.5 text-white hover:bg-blue-700 disabled:opacity-50">
                            {processing ? 'Generando...' : 'Generar código'}
                        </button>
                    </div>
                </form>

                <div className="w-full overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-slate-200">
                    <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-slate-50/60 px-6 py-4">
                        <input className="min-w-[220px] flex-1 rounded border border-slate-300 p-2" placeholder="Buscar por código, producto o lote..." value={texto} onChange={(e) => setTexto(e.target.value)} />
                        <label className="flex items-center gap-2 text-sm">
                            Copias
                            <input type="number" min={1} max={200} value={copias} onChange={(e) => setCopias(Math.max(1, Number(e.target.value) || 1))} className="w-20 rounded border border-slate-300 p-2" />
                        </label>
                        <button disabled={seleccion.length === 0} onClick={() => imprimir(seleccion)} className="cursor-pointer rounded-lg bg-[#0B0B0B] px-4 py-2 text-white hover:bg-[#282727] disabled:opacity-50">
                            Imprimir seleccionados ({seleccion.length})
                        </button>
                    </div>

                    {codigos.data.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">No hay códigos de barras.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-slate-50">
                                    <tr className="text-left text-slate-600">
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
                                <tbody className="divide-y divide-slate-200">
                                    {codigos.data.map((c) => (
                                        <tr key={c.id_codigo} className="odd:bg-white even:bg-slate-50 hover:bg-blue-50/70">
                                            <td className="px-4 py-3">
                                                <input type="checkbox" checked={seleccion.includes(c.id_codigo)} onChange={() => alternar(c.id_codigo)} />
                                            </td>
                                            <td className="px-4 py-3 font-mono font-medium">{c.codigo}</td>
                                            <td className="px-4 py-3 uppercase">{c.tipo_codigo}</td>
                                            <td className="px-4 py-3">{c.producto}</td>
                                            <td className="px-4 py-3">{c.nombre_lote || `Lote #${c.id_lote}`}</td>
                                            <td className="px-4 py-3">{moneda(c.precio_venta)}</td>
                                            <td className="px-4 py-3">{c.veces_impreso}</td>
                                            <td className="px-4 py-3">{c.activo ? 'Activo' : 'Inactivo'}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-3">
                                                    <button className="cursor-pointer text-blue-600 hover:underline disabled:opacity-40" disabled={!c.activo} onClick={() => imprimir([c.id_codigo])}>
                                                        Imprimir
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
                        <div className="flex justify-center gap-2 border-t border-slate-200 px-6 py-4">
                            <button className="rounded-lg border border-slate-300 px-3 py-1.5 hover:bg-slate-100 disabled:opacity-50" disabled={codigos.current_page === 1} onClick={() => irPagina(codigos.current_page - 1)}>
                                Anterior
                            </button>
                            <span className="px-3 py-1.5 text-sm text-slate-600">
                                Página {codigos.current_page} de {codigos.last_page}
                            </span>
                            <button className="rounded-lg border border-slate-300 px-3 py-1.5 hover:bg-slate-100 disabled:opacity-50" disabled={codigos.current_page === codigos.last_page} onClick={() => irPagina(codigos.current_page + 1)}>
                                Siguiente
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </SistemaLayout>
    );
}
