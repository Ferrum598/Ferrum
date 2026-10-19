import { router, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import Swal from 'sweetalert2';

export interface DescuentoConfig {
    id_descuento: number;
    cantidad_minima: number;
    porcentaje: number;
}

const input = 'w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30';

export default function DescuentosProducto({ idProducto, descuentos }: { idProducto: number; descuentos: DescuentoConfig[] }) {
    const { data, setData, post, processing, errors, reset } = useForm({ cantidad_minima: '', porcentaje: '' });

    const agregar = (e: FormEvent) => {
        e.preventDefault();
        post(`/inventario/${idProducto}/descuentos`, { preserveScroll: true, onSuccess: () => reset() });
    };

    const eliminar = async (d: DescuentoConfig) => {
        const r = await Swal.fire({ title: '¿Eliminar descuento?', text: `Desde ${d.cantidad_minima} unidades: ${d.porcentaje}%`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar' });
        if (r.isConfirmed) router.delete(`/inventario/descuentos/${d.id_descuento}`, { preserveScroll: true });
    };

    return (
        <section className="w-full rounded-2xl border border-slate-100 bg-white p-6 shadow-md">
            <div className="mb-5 flex items-center gap-3">
                <span className="rounded-2xl bg-emerald-50 p-3 text-2xl">🏷️</span>
                <div>
                    <h2 className="text-xl font-extrabold text-slate-900">Descuentos por cantidad</h2>
                    <p className="text-sm text-slate-500">Al vender este producto, si se lleva la cantidad indicada o más, el descuento se aplica solo en el punto de venta. Si hay varias reglas, se usa la mayor que se cumpla.</p>
                </div>
            </div>

            <form onSubmit={agregar} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700">Desde (unidades)</label>
                    <input type="number" min="2" step="1" className={input} placeholder="Ej. 10" value={data.cantidad_minima} onChange={(e) => setData('cantidad_minima', e.target.value)} />
                    {errors.cantidad_minima && <span className="text-sm text-red-600">{errors.cantidad_minima}</span>}
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700">Descuento (%)</label>
                    <input type="number" min="0.01" max="100" step="0.01" className={input} placeholder="Ej. 5" value={data.porcentaje} onChange={(e) => setData('porcentaje', e.target.value)} />
                    {errors.porcentaje && <span className="text-sm text-red-600">{errors.porcentaje}</span>}
                </div>
                <button disabled={processing} className="sm:col-span-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50">
                    {processing ? 'Guardando…' : '➕ Agregar regla'}
                </button>
            </form>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-100">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gradient-to-r from-slate-900 to-blue-900 text-xs uppercase tracking-wide text-white">
                        <tr><th className="p-3">Cantidad mínima</th><th className="p-3">Descuento</th><th className="p-3" /></tr>
                    </thead>
                    <tbody>
                        {descuentos.map((d) => (
                            <tr key={d.id_descuento} className="border-b border-slate-100">
                                <td className="p-3 font-bold text-slate-800">{d.cantidad_minima} unidades o más</td>
                                <td className="p-3"><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-800">{Number(d.porcentaje)}%</span></td>
                                <td className="p-3 text-right"><button onClick={() => eliminar(d)} className="rounded-lg bg-rose-50 px-3 py-1.5 font-bold text-rose-700 transition hover:bg-rose-100">Eliminar</button></td>
                            </tr>
                        ))}
                        {!descuentos.length && <tr><td colSpan={3} className="p-6 text-center text-slate-500">Este producto no tiene descuentos.</td></tr>}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
