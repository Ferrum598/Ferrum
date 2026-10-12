import { useForm } from '@inertiajs/react';
import React from 'react';
import { LoteInventario } from '../Interfaces/interfaceInventario';

interface LoteForm {
    nombre_lote: string;
    precio_compra: string;
    precio_venta: string;
    cantidad: string;
    cantidad_disponible: string;
    fecha_ingreso: string;
    activo: boolean;
}

const inputClase = 'w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 transition focus:outline-none focus:ring-2 focus:ring-blue-500';
const labelClase = 'text-sm font-medium text-slate-700';

export default function FormularioLote({ idProducto, nombreProducto, lote }: { idProducto: number; nombreProducto: string; lote?: LoteInventario | null }) {
    const { data, setData, post, processing, errors } = useForm<LoteForm>({
        nombre_lote: lote?.nombre_lote ?? '',
        precio_compra: lote ? String(lote.precio_compra) : '',
        precio_venta: lote ? String(lote.precio_venta) : '',
        cantidad: lote ? String(lote.cantidad) : '',
        cantidad_disponible: lote ? String(lote.cantidad_disponible) : '',
        fecha_ingreso: lote?.fecha_ingreso ?? new Date().toISOString().slice(0, 10),
        activo: lote?.activo ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(lote ? `/inventario/lotes/${lote.id_lote}/actualizar` : `/inventario/${idProducto}/lotes`);
    };

    const error = (campo: keyof LoteForm) => errors[campo] && <span className="text-sm text-red-600">{errors[campo]}</span>;
    const campo = (id: Exclude<keyof LoteForm, 'activo'>, etiqueta: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
        <div className="flex flex-col gap-1">
            <label htmlFor={id} className={labelClase}>{etiqueta}</label>
            <input id={id} className={inputClase} value={data[id]} onChange={(e) => setData(id, e.target.value)} {...props} />
            {error(id)}
        </div>
    );

    return (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
            <div>
                <h1 className="bg-gradient-to-r from-slate-900 to-blue-700 bg-clip-text text-3xl font-extrabold text-transparent">
                    {lote ? '✏️ Editar lote' : '📥 Agregar lote'}
                </h1>
                <p className="mt-1 text-slate-500">Producto: <span className="font-semibold text-slate-700">{nombreProducto}</span></p>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-md">
                {campo('nombre_lote', 'Nombre del Lote', { type: 'text', placeholder: 'Ej. Lote febrero' })}
                <div className="grid grid-cols-2 gap-4">
                    {campo('precio_compra', 'Precio de Compra', { type: 'number', min: 0, step: '0.01' })}
                    {campo('precio_venta', 'Precio de Venta', { type: 'number', min: 0, step: '0.01' })}
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {lote
                        ? campo('cantidad_disponible', `Disponible (de ${lote.cantidad} ingresadas)`, { type: 'number', min: 0, step: 1 })
                        : campo('cantidad', 'Cantidad', { type: 'number', min: 0, step: 1 })}
                    {campo('fecha_ingreso', 'Fecha de Ingreso', { type: 'date' })}
                </div>
                {lote && (
                    <label className="flex w-fit cursor-pointer items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-slate-700">
                        <input type="checkbox" className="h-4 w-4 accent-blue-600" checked={data.activo} onChange={(e) => setData('activo', e.target.checked)} />
                        Lote activo
                    </label>
                )}
                <button
                    className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-3 font-semibold text-white shadow-lg transition hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] disabled:opacity-50"
                    type="submit"
                    disabled={processing}
                >
                    {lote ? 'Guardar Cambios' : 'Agregar Lote'}
                </button>
            </form>
        </div>
    );
}
