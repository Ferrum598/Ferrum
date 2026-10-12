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

const inputClase = 'w-full rounded-[10px] border border-gray-300 p-2';

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

    const error = (campo: keyof LoteForm) => errors[campo] && <span className="text-red-500">{errors[campo]}</span>;

    return (
        <div className="flex w-full flex-col items-center gap-5 px-2 py-6">
            <h1 className="text-2xl font-bold">
                {lote ? 'Editar lote' : 'Agregar lote'} — {nombreProducto}
            </h1>
            <form onSubmit={handleSubmit} className="flex w-full max-w-xl flex-col gap-3">
                <label htmlFor="nombre_lote">Nombre del Lote</label>
                <input id="nombre_lote" className={inputClase} type="text" value={data.nombre_lote} onChange={(e) => setData('nombre_lote', e.target.value)} placeholder="Ej. Lote febrero" />
                {error('nombre_lote')}
                <label htmlFor="precio_compra">Precio de Compra</label>
                <input id="precio_compra" className={inputClase} type="number" min="0" step="0.01" value={data.precio_compra} onChange={(e) => setData('precio_compra', e.target.value)} />
                {error('precio_compra')}
                <label htmlFor="precio_venta">Precio de Venta</label>
                <input id="precio_venta" className={inputClase} type="number" min="0" step="0.01" value={data.precio_venta} onChange={(e) => setData('precio_venta', e.target.value)} />
                {error('precio_venta')}
                {lote ? (
                    <>
                        <label htmlFor="cantidad_disponible">Cantidad Disponible (de {lote.cantidad} ingresadas)</label>
                        <input id="cantidad_disponible" className={inputClase} type="number" min="0" step="1" value={data.cantidad_disponible} onChange={(e) => setData('cantidad_disponible', e.target.value)} />
                        {error('cantidad_disponible')}
                    </>
                ) : (
                    <>
                        <label htmlFor="cantidad">Cantidad</label>
                        <input id="cantidad" className={inputClase} type="number" min="0" step="1" value={data.cantidad} onChange={(e) => setData('cantidad', e.target.value)} />
                        {error('cantidad')}
                    </>
                )}
                <label htmlFor="fecha_ingreso">Fecha de Ingreso</label>
                <input id="fecha_ingreso" className={inputClase} type="date" value={data.fecha_ingreso} onChange={(e) => setData('fecha_ingreso', e.target.value)} />
                {error('fecha_ingreso')}
                {lote && (
                    <label className="flex items-center gap-2">
                        <input type="checkbox" checked={data.activo} onChange={(e) => setData('activo', e.target.checked)} />
                        Lote activo
                    </label>
                )}
                <button
                    className="w-full cursor-pointer rounded-[8px] bg-[#0B0B0B] p-2 font-semibold text-white transition duration-300 ease-in-out hover:-translate-y-1 hover:bg-[#282727] disabled:opacity-50"
                    type="submit"
                    disabled={processing}
                >
                    {lote ? 'Guardar Cambios' : 'Agregar Lote'}
                </button>
            </form>
        </div>
    );
}
