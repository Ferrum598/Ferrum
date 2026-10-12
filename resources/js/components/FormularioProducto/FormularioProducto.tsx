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

const inputClase = 'w-full rounded-[10px] border border-gray-300 p-2';
const hoy = () => new Date().toISOString().slice(0, 10);

export default function FormularioProducto({ producto, categorias }: { producto?: ProductoEdicion; categorias?: Categoria[] }) {
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

    const error = (campo: keyof ProductoForm) => errors[campo] && <span className="text-red-500">{errors[campo]}</span>;

    return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-5 px-2">
            <div className="w-full max-w-xs rounded-[5px] border-2 border-gray-300 p-2 sm:max-w-sm md:max-w-md">
                <img className="h-full w-full object-cover" src={imagenPreview || producto?.imagen || '/assets/productos/no-hay-imagen.jpg'} alt="producto" />
            </div>

            <form onSubmit={handleSubmit} className="flex w-full flex-col items-center justify-center gap-5">
                <div className="flex w-full flex-col justify-center gap-5 md:flex-row">
                    <div className="flex w-full flex-col gap-3 md:w-1/2">
                        <label htmlFor="nombre_producto">Nombre del Producto</label>
                        <input id="nombre_producto" className={inputClase} type="text" value={data.nombre_producto} onChange={(e) => setData('nombre_producto', e.target.value)} placeholder="Producto" />
                        {error('nombre_producto')}
                        <label htmlFor="descripcion">Descripción del Producto</label>
                        <textarea id="descripcion" className={inputClase} value={data.descripcion} onChange={(e) => setData('descripcion', e.target.value)} placeholder="Descripción" rows={4} maxLength={255} />
                        {error('descripcion')}
                        <label htmlFor="fk_categoria">Categoría del Producto</label>
                        <select id="fk_categoria" className={inputClase} value={data.fk_categoria} onChange={(e) => setData('fk_categoria', e.target.value === '' ? '' : Number(e.target.value))}>
                            <option value="">Seleccione una categoría</option>
                            {categorias?.map((c) => (
                                <option key={c.id_categoria} value={c.id_categoria}>
                                    {c.nombre_categoria}
                                </option>
                            ))}
                        </select>
                        {error('fk_categoria')}
                        <label htmlFor="imagen">Imagen del Producto</label>
                        <input id="imagen" className={inputClase} type="file" accept="image/*" onChange={(e) => setData('imagen', e.target.files?.[0] || null)} />
                        {error('imagen')}
                    </div>

                    {!producto && (
                        <div className="flex w-full flex-col gap-3 md:w-1/2">
                            <h2 className="font-semibold">Primer lote</h2>
                            <label htmlFor="nombre_lote">Nombre del Lote</label>
                            <input id="nombre_lote" className={inputClase} type="text" value={data.nombre_lote} onChange={(e) => setData('nombre_lote', e.target.value)} placeholder="Ej. Lote enero" />
                            {error('nombre_lote')}
                            <label htmlFor="precio_compra">Precio de Compra</label>
                            <input id="precio_compra" className={inputClase} type="number" min="0" step="0.01" value={data.precio_compra} onChange={(e) => setData('precio_compra', e.target.value)} placeholder="0.00" />
                            {error('precio_compra')}
                            <label htmlFor="precio_venta">Precio de Venta</label>
                            <input id="precio_venta" className={inputClase} type="number" min="0" step="0.01" value={data.precio_venta} onChange={(e) => setData('precio_venta', e.target.value)} placeholder="0.00" />
                            {error('precio_venta')}
                            <label htmlFor="cantidad">Cantidad</label>
                            <input id="cantidad" className={inputClase} type="number" min="0" step="1" value={data.cantidad} onChange={(e) => setData('cantidad', e.target.value)} placeholder="Cantidad" />
                            {error('cantidad')}
                            <label htmlFor="fecha_ingreso">Fecha de Ingreso</label>
                            <input id="fecha_ingreso" className={inputClase} type="date" value={data.fecha_ingreso} onChange={(e) => setData('fecha_ingreso', e.target.value)} />
                            {error('fecha_ingreso')}
                        </div>
                    )}
                </div>
                <button
                    className="w-full cursor-pointer rounded-[8px] bg-[#0B0B0B] p-2 font-semibold text-white transition duration-300 ease-in-out hover:-translate-y-1 hover:bg-[#282727] disabled:opacity-50 md:w-1/3"
                    type="submit"
                    disabled={processing}
                >
                    {producto ? 'Guardar Cambios' : 'Agregar Producto'}
                </button>
            </form>
        </div>
    );
}
