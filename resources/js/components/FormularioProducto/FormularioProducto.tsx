import { useForm } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { ProductoEdicion } from '../Interfaces/interfaceInventario';
import { Categoria } from '../Interfaces/interfaceCategoria';

interface ProductoForm {
    nombre_producto: string;
    descripcion: string;
    fk_categoria: number | '';
    imagen: File | null;
    nombre_lote: string;
    precio_compra: string;
    precio_venta: string;
    cantidad: string;
    fecha_ingreso: string;
}

const inputClase = 'w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 transition focus:outline-none focus:ring-2 focus:ring-blue-500';
const labelClase = 'text-sm font-medium text-slate-700';
const hoy = () => new Date().toISOString().slice(0, 10);

export default function FormularioProducto({ producto, categorias, children }: { producto?: ProductoEdicion; categorias?: Categoria[]; children?: React.ReactNode }) {
    const [imagenPreview, setImagenPreview] = useState<string | null>(null);
    const { data, setData, post, processing, errors } = useForm<ProductoForm>({
        nombre_producto: producto?.nombre_producto ?? '',
        descripcion: producto?.descripcion ?? '',
        fk_categoria: producto?.fk_categoria ?? '',
        imagen: null,
        nombre_lote: '',
        precio_compra: '',
        precio_venta: '',
        cantidad: '',
        fecha_ingreso: hoy(),
    });

    useEffect(() => {
        if (!data.imagen) {
            setImagenPreview(null);
            return;
        }
        const url = URL.createObjectURL(data.imagen);
        setImagenPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [data.imagen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(producto ? `/inventario/${producto.id_producto}/actualizar` : '/inventario/guardar', { forceFormData: true });
    };

    const error = (campo: keyof ProductoForm) => errors[campo] && <span className="text-sm text-red-600">{errors[campo]}</span>;
    const campo = (id: keyof ProductoForm, etiqueta: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
        <div className="flex flex-col gap-1">
            <label htmlFor={id} className={labelClase}>{etiqueta}</label>
            <input id={id} className={inputClase} value={data[id] as string} onChange={(e) => setData(id, e.target.value as never)} {...props} />
            {error(id)}
        </div>
    );

    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
            <h1 className="bg-gradient-to-r from-slate-900 to-blue-700 bg-clip-text text-3xl font-extrabold text-transparent">
                {producto ? '✏️ Editar producto' : '📦 Agregar producto'}
            </h1>

            <div className={producto ? 'grid items-start gap-6 md:grid-cols-2' : ''}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className={`grid gap-6 ${producto ? '' : 'md:grid-cols-2'}`}>
                    <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-md">
                        <h2 className="font-semibold text-slate-800">Datos del producto</h2>
                        <div className="mx-auto w-full max-w-[220px] overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-100 to-slate-200 shadow-sm">
                            <img className="aspect-square w-full object-cover" src={imagenPreview || producto?.imagen || '/assets/productos/no-hay-imagen.jpg'} alt="producto" />
                        </div>
                        {campo('nombre_producto', 'Nombre del Producto', { type: 'text', placeholder: 'Producto' })}
                        <div className="flex flex-col gap-1">
                            <label htmlFor="descripcion" className={labelClase}>Descripción del Producto</label>
                            <textarea id="descripcion" className={inputClase} value={data.descripcion} onChange={(e) => setData('descripcion', e.target.value)} placeholder="Descripción" rows={4} maxLength={255} />
                            {error('descripcion')}
                        </div>
                        <div className="flex flex-col gap-1">
                            <label htmlFor="fk_categoria" className={labelClase}>Categoría del Producto</label>
                            <select id="fk_categoria" className={inputClase} value={data.fk_categoria} onChange={(e) => setData('fk_categoria', e.target.value === '' ? '' : Number(e.target.value))}>
                                <option value="">Seleccione una categoría</option>
                                {categorias?.map((c) => (
                                    <option key={c.id_categoria} value={c.id_categoria}>
                                        {c.nombre_categoria}
                                    </option>
                                ))}
                            </select>
                            {error('fk_categoria')}
                        </div>
                        <div className="flex flex-col gap-1">
                            <label htmlFor="imagen" className={labelClase}>Imagen del Producto</label>
                            <input id="imagen" className={`${inputClase} file:mr-3 file:rounded-lg file:border-0 file:bg-blue-100 file:px-3 file:py-1 file:text-blue-700`} type="file" accept="image/*" onChange={(e) => setData('imagen', e.target.files?.[0] || null)} />
                            {error('imagen')}
                        </div>
                    </div>

                    {!producto && (
                        <div className="flex h-fit flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-md">
                            <h2 className="font-semibold text-slate-800">📥 Primer lote</h2>
                            {campo('nombre_lote', 'Nombre del Lote', { type: 'text', placeholder: 'Ej. Lote enero' })}
                            <div className="grid grid-cols-2 gap-4">
                                {campo('precio_compra', 'Precio de Compra', { type: 'number', min: 0, step: '0.01', placeholder: '0.00' })}
                                {campo('precio_venta', 'Precio de Venta', { type: 'number', min: 0, step: '0.01', placeholder: '0.00' })}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {campo('cantidad', 'Cantidad', { type: 'number', min: 0, step: 1, placeholder: 'Cantidad' })}
                                {campo('fecha_ingreso', 'Fecha de Ingreso', { type: 'date' })}
                            </div>
                        </div>
                    )}
                </div>
                <button
                    className={`w-full cursor-pointer self-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-3 font-semibold text-white shadow-lg transition hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] disabled:opacity-50 ${producto ? '' : 'md:w-1/3'}`}
                    type="submit"
                    disabled={processing}
                >
                    {producto ? 'Guardar Cambios' : 'Agregar Producto'}
                </button>
            </form>
            {producto && children}
            </div>
        </div>
    );
}
