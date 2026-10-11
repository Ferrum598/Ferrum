import SistemaLayout from "@/layouts/SistemaLayout/SistemaLayout";
import { usePage, Head, router } from "@inertiajs/react";
import { useState } from "react";
import { Producto, ImagenProducto } from "@/components/Interfaces/interfaceCatalogo";
import CardProductos from "@/components/CardProductos/CardProductos";
import { Categoria } from "@/components/Interfaces/interfaceCategoria";

export default function Catalogo() {
    const props = usePage().props as any;
    const productos = props.productos;
    const imagenes = props.imagenes;
    const categorias = props.categorias;
    const buscarProp = props.buscar;
    const categoriaProp = props.categoria;
    const [buscar, setBuscar] = useState(buscarProp || '');
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(categoriaProp || '');

    // Manejar filtros y búsqueda
    const handleFiltrar = (page = 1, nuevoBuscar = buscar, nuevaCategoria = categoriaSeleccionada) => {
        router.get(
            '/catalogo',
            {
                page,
                buscar: nuevoBuscar,
                categoria: nuevaCategoria,
            },
            {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            }
        );
    };

    // Cuando cambian los filtros, ir a la primera página y refrescar correctamente
    const onBuscarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setBuscar(value);
        handleFiltrar(1, value, categoriaSeleccionada);
    };
    const onCategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setCategoriaSeleccionada(value);
        handleFiltrar(1, buscar, value);
    };

    return (
        <>
            <Head>
                <title>Catálogo</title>
                <meta name="description" content="Catálogo de productos disponibles" />
            </Head>
            <SistemaLayout>
                <div className="flex flex-col w-full min-h-screen bg-white">
                    <div className="w-full px-2 md:px-6 py-4 flex flex-col md:flex-row gap-4 items-center md:items-end bg-gray-50 shadow-sm">
                        <input
                            type="text"
                            placeholder="Buscar producto..."
                            value={buscar}
                            onChange={onBuscarChange}
                            className="mb-3 w-full md:w-1/2 rounded border p-2"
                        />
                        <div className="mb-3 flex gap-2 items-center w-full md:w-1/2 p-2">
                            <span className="text-gray-600">Categoria</span>
                            <select
                                name="categoria"
                                id="categoria"
                                className="mt-1 block w-full rounded border p-2"
                                value={categoriaSeleccionada}
                                onChange={onCategoriaChange}
                            >
                                <option value="">--Seleccionar Categoria--</option>
                                {categorias.map((categoria: Categoria) => (
                                    <option key={categoria.id_categoria} value={categoria.id_categoria}>
                                        {categoria.categoria}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex-1 w-full overflow-x-auto p-2 md:p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-10">
                            {productos.data.length === 0 ? (
                                <div className="col-span-3 text-center text-gray-500 text-xl">
                                    No se encontró el producto.
                                </div>
                            ) : (
                                productos.data.map((producto: Producto) => {
                                    const imagen = imagenes.find((img: ImagenProducto) => img.id_imagen === producto.fk_id_imagen);
                                    return imagen ? (
                                        <CardProductos key={producto.id_producto} producto={producto} imagen={imagen} />
                                    ) : null;
                                })
                            )}
                        </div>
                        {/* Controles de paginación del backend */}
                        {productos.last_page > 1 && (
                            <div className="flex flex-wrap justify-center mt-10 gap-2">
                                {productos.links.map((link: { url: string | null; label: string; active: boolean }, idx: number) => {
                                    if (link.label === '&laquo; Previous') {
                                        return (
                                            <button
                                                key={idx}
                                                className="min-w-[44px] min-h-[44px] px-5 py-3 rounded-md border border-gray-300 bg-white text-gray-700 font-medium shadow-sm hover:bg-blue-50 hover:text-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-lg md:text-xl"
                                                onClick={() => link.url && handleFiltrar(productos.current_page - 1, buscar, categoriaSeleccionada)}
                                                disabled={!link.url}
                                            >
                                                Anterior
                                            </button>
                                        );
                                    }
                                    if (link.label === 'Next &raquo;') {
                                        return (
                                            <button
                                                key={idx}
                                                className="min-w-[44px] min-h-[44px] px-5 py-3 rounded-md border border-gray-300 bg-white text-gray-700 font-medium shadow-sm hover:bg-blue-50 hover:text-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-lg md:text-xl"
                                                onClick={() => link.url && handleFiltrar(productos.current_page + 1, buscar, categoriaSeleccionada)}
                                                disabled={!link.url}
                                            >
                                                Siguiente
                                            </button>
                                        );
                                    }
                                    // Números de página
                                    return (
                                        <button
                                            key={idx}
                                            className={`min-w-[44px] min-h-[44px] px-5 py-3 rounded-md border font-medium shadow-sm transition focus:outline-none text-base sm:text-lg md:text-xl ${link.active ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:text-blue-600'}`}
                                            onClick={() => link.url && handleFiltrar(Number(link.label), buscar, categoriaSeleccionada)}
                                            disabled={!link.url}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </SistemaLayout>
            </>
        );
    }
