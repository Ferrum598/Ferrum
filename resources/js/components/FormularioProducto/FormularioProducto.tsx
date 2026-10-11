import { useForm } from '@inertiajs/react';
import React, { useEffect, useState, useRef } from 'react';
import { ImagenProducto, Producto, ProductoForm } from '../Interfaces/interfaceInventario';
import { Categoria } from '../Interfaces/interfaceCategoria';

export default function FormularioProducto({ productos, imagenes, categorias }: { productos?: Producto[]; imagenes?: ImagenProducto[]; categorias?: Categoria[] }) {
    const codigoBarraRef = useRef<HTMLInputElement>(null);
    const [imagenPreview, setImagenPreview] = useState<string | null>(null);
    const { data, setData, post, errors } = useForm<ProductoForm>({
        id: productos ? productos[0].id_producto : 0,
        producto: productos ? productos[0].producto : '',
        producto_plural: productos ? productos[0].producto_plural : '',
        descripcion: productos ? productos[0].descripcion : '',
        codigo_barra: productos ? productos[0].codigo_barra : '',
        precio: Number(productos ? productos[0].precio : 0).toFixed(2),
        cantidad: Number(productos ? productos[0].cantidad : 0),
        imagen: undefined,
        categoria: productos ? Number(productos[0].fk_id_categoria) : undefined,
    });

    useEffect(() => {
        if (codigoBarraRef.current) {
            codigoBarraRef.current.focus();
        }
    }, []);

    useEffect(() => {
        if (!data.imagen) {
            setImagenPreview(null);
            return;
        }
        const img = data.imagen;
        const preview =
            img && typeof img !== 'string' ? URL.createObjectURL(img) : img;
        setImagenPreview(preview);
    }, [data.imagen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!productos) {
            post('/inventario/guardarProducto');
        } else {
            post('/inventario/actualizar');
        }
    };

    return (
        <>
            <div className="flex h-full w-full flex-col items-center justify-center gap-5 px-2">
                <div className="w-full max-w-xs sm:max-w-sm md:max-w-md rounded-[5px] border-2 border-gray-300 p-2">
                    {imagenes && imagenes.length > 0 ? (
                        imagenes.map((img, index) => (
                            <img
                                key={index}
                                className="h-full w-full object-cover"
                                src={
                                    imagenPreview ||
                                    (typeof img.imagen === 'string'
                                        ? img.imagen
                                        : '/assets/productos/no-hay-imagen.jpg')
                                }
                                alt={`producto-${index}`}
                            />
                        ))
                    ) : (
                        <img
                            className="h-full w-full object-cover"
                            src={
                                imagenPreview ||
                                '/assets/productos/no-hay-imagen.jpg'
                            }
                            alt="no-hay-imagen"
                        />
                    )}
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="flex w-full flex-col items-center justify-center gap-5"
                >
                    <div className="flex flex-col md:flex-row w-full justify-center gap-5">
                        <div className="flex flex-col gap-3 w-full md:w-1/2">
                            <label htmlFor="producto">Nombre del Producto</label>
                            <input
                                className="w-full rounded-[10px] border border-gray-300 p-2"
                                type="text"
                                value={data.producto}
                                onChange={(e) =>
                                    setData('producto', e.target.value)
                                }
                                placeholder="Producto"
                            />
                            {errors.producto && (
                                <span className="text-red-500">
                                    {errors.producto}
                                </span>
                            )}
                            <label htmlFor="producto_plural">Nombre del Producto Plural</label>
                            <input
                                className="w-full rounded-[10px] border border-gray-300 p-2"
                                type="text"
                                value={data.producto_plural}
                                onChange={(e) =>
                                    setData('producto_plural', e.target.value)
                                }
                                placeholder="Producto plural"
                            />
                            {errors.producto_plural && (
                                <span className="text-red-500">
                                    {errors.producto_plural}
                                </span>
                            )}
                            <label htmlFor="precio">Precio del Producto</label>
                            <input
                                className="w-full rounded-[10px] border border-gray-300 p-2"
                                type="number"
                                value={data.precio}
                                onChange={(e) =>
                                    setData('precio', e.target.value)
                                }
                                placeholder="Precio"
                            />
                            {errors.precio && (
                                <span className="text-red-500">
                                    {errors.precio}
                                </span>
                            )}
                            <label htmlFor="descripcion">Descripción del Producto</label>
                            <textarea
                                className="w-full rounded-[10px] border border-gray-300 p-2"
                                value={data.descripcion}
                                onChange={(e) =>
                                    setData('descripcion', e.target.value)
                                }
                                placeholder="Descripción"
                                rows={4}
                                maxLength={255}
                            />
                            {errors.descripcion && (
                                <span className="text-red-500">
                                    {errors.descripcion}
                                </span>
                            )}
                        </div>
                        <div className="flex flex-col gap-3 w-full md:w-1/2">
                            <label htmlFor="cantidad">Cantidad del Producto</label>
                            <input
                                className="w-full rounded-[10px] border border-gray-300 p-2"
                                type="number"
                                value={data.cantidad}
                                onChange={(e) =>
                                    setData('cantidad', e.target.value)
                                }
                                placeholder="Cantidad"
                            />
                            {errors.cantidad && (
                                <span className="text-red-500">
                                    {errors.cantidad}
                                </span>
                            )}
                            <label htmlFor="imagen">Imagen del Producto</label>
                            <input
                                className="w-full rounded-[10px] border border-gray-300 p-2"
                                type="file"
                                onChange={(e) =>
                                    setData(
                                        'imagen',
                                        e.target.files?.[0] || null,
                                    )
                                }
                            />
                            {errors.imagen && (
                                <span className="text-red-500">
                                    {errors.imagen}
                                </span>
                            )}
                            <label htmlFor="categoria">Categoría del Producto</label>
                            <select
                                className="w-full rounded-[10px] border border-gray-300 p-2"
                                value={data.categoria || ''}
                                onChange={(e) =>
                                    setData('categoria', e.target.value === '' ? undefined : Number(e.target.value))
                                }
                            >
                                <option value="">Seleccione una categoría</option>
                                {categorias?.map((categoria) => (
                                    <option key={categoria.id_categoria} value={categoria.id_categoria}>
                                        {categoria.categoria}
                                    </option>
                                ))}
                            </select>
                            {errors.categoria && (
                                <span className="text-red-500">
                                    {errors.categoria}
                                </span>
                            )}
                            <label htmlFor="codigo_barra">Codigo de barras</label>
                            <input
                                ref={codigoBarraRef}
                                className="w-full rounded-[10px] border border-gray-300 p-2"
                                type="text"
                                value={data.codigo_barra}
                                onChange={(e) =>
                                    setData('codigo_barra', e.target.value)
                                }
                                onFocus={e => e.target.select()}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                    }
                                }}
                                placeholder="Codigo de barras"
                            />
                            {errors.codigo_barra && (
                                <span className="text-red-500">
                                    {errors.codigo_barra}
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        className="w-full md:w-1/3 rounded-[8px] text-white bg-[#0B0B0B] p-2 transition duration-300 ease-in-out hover:-translate-y-1 hover:bg-[#282727] cursor-pointer font-semibold"
                        type="submit"
                    >
                        Agregar Producto
                    </button>
                </form>
            </div>
        </>
    );
}
