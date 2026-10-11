import { ImagenProducto, Producto } from '@/components/Interfaces/interfaceInventario';
import { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import { router } from '@inertiajs/react';
import Swal from 'sweetalert2';

interface TablaProps {
    productos?: Producto[];
    imagenes?: ImagenProducto[];
    paginationProps?: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

// Eliminar cualquier código sobrante o duplicado después de este punto

export default function Tabla({ productos, imagenes, paginationProps }: TablaProps) {
    // Obtener el valor inicial de búsqueda desde la URL
    function getBuscarFromUrl() {
        if (typeof window === 'undefined') return '';
        const params = new URLSearchParams(window.location.search);
        return params.get('buscar') || '';
    }
    const [buscar, setBuscar] = useState(getBuscarFromUrl());

    useEffect(() => {
        setBuscar(getBuscarFromUrl());
    }, [window.location.search]);

    // Mantener búsqueda sincronizada con la URL y backend
    // Debounce para evitar recarga en cada letra
    useEffect(() => {
        const timeout = setTimeout(() => {
            const perPage = paginationProps?.per_page || 10;
            router.visit(`/inventario?buscar=${encodeURIComponent(buscar)}&page=1&per_page=${perPage}`, { preserveState: true, replace: true });
        }, 500);
        return () => clearTimeout(timeout);
    }, [buscar]);

    const handleBuscar = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBuscar(e.target.value);
    };

    // Transformar datos para la tabla
    const data =
        (productos?.map((producto: Producto) => ({
            id: producto.id_producto,
            producto: producto.producto,
            descripcion: producto.descripcion,
            precio: `Q. ${producto.precio}`,
            cantidad: producto.cantidad,
            imagen: (() => {
                const img = imagenes?.find((img: ImagenProducto) => img.id_imagen === producto.fk_id_imagen);
                return img ? <img src={img.imagen || ''} alt="imagen" /> : <img src={'/assets/productos/no-hay-imagen.jpg'} alt="No hay imagen" />;
            })(),
            estado: producto.estado,
            estatus: producto.estatus,
        })) || []);

    const botonBorrar = (id: number) => {
        Swal.fire({
            title: "Estas seguro?",
            text: "No podras revertir esto!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Si, eliminarlo!"
        }).then((result) => {
            if (result.isConfirmed) {
                router.post('/inventario/eliminar', { id: id });
            }
        });
    };

    const botonEstado = (id: number) => {
        Swal.fire({
            title: "Estas seguro?",
            text: "No se mostrara en el catalogo!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Si, cambiarlo!"
        }).then((result) => {
            if (result.isConfirmed) {
                router.post('/inventario/actualizarEstado', { id: id });
            }
        });
    };

    const columns = [
        {
            name: 'Producto',
            selector: (row: any) => row.producto,
            sortable: true,
        },
        {
            name: 'Imagen',
            selector: (row: any) => row.imagen,
            sortable: true,
        },
        {
            name: 'Descripción',
            selector: (row: any) => (
                <div className="max-w-[180px] truncate" title={row.descripcion}>
                    {row.descripcion}
                </div>
            ),
            sortable: true,
        },
        {
            name: 'Precio',
            selector: (row: any) => row.precio,
            cell: (row: any) => {
                const precio = typeof row.precio === 'string'
                    ? parseFloat(row.precio.replace('Q. ', '').replace(',', ''))
                    : row.precio;
                return precio.toLocaleString('es-US', { style: 'currency', currency: 'GTQ' });
            },
            sortable: true,
        },
        {
            name: 'Cantidad',
            selector: (row: any) => row.cantidad < 10 ? <div className='w-[100px] h-[20px] flex items-center bg-red-500 rounded-2xl'><span className="p-2 text-white font-bold text-[14px]">{row.cantidad}</span></div> : row.cantidad,
            sortable: true,
        },
        {
            name: 'Estado',
            selector: (row: any) => row.estado,
            sortable: true,
        },
        {
            name: 'Acciones',
            cell: (row: any) => (
                <div className="flex flex-wrap gap-2 md:gap-5 justify-center items-center">
                    <button
                        className="transition delay-75 ease-in-out hover:scale-110 h-8 w-8 md:h-10 md:w-10 flex items-center justify-center cursor-pointer"
                        onClick={() => router.visit('/inventario/editar', {data: { id: row.id }})}
                    >
                         <img
                            className="w-full h-full object-contain"
                            src="/assets/icon/editar.png"
                            alt="editar"
                        />
                    </button>
                    <button
                        className="transition delay-75 ease-in-out hover:scale-110 h-8 w-8 md:h-10 md:w-10 flex items-center justify-center cursor-pointer"
                        onClick={() => {botonBorrar(row.id)}}
                    >
                        <img
                            className="w-full h-full object-contain"
                            src="/assets/icon/eliminar.png"
                            alt="eliminar"
                        />
                    </button>
                    <button
                        className="transition delay-75 ease-in-out hover:scale-110 h-8 w-8 md:h-10 md:w-10 flex items-center justify-center cursor-pointer"
                        onClick={() => {botonEstado(row.id)}}
                    >
                        <img
                            className="w-full h-full object-contain"
                            src={`${row.estado === 'mostrado' ? '/assets/icon/verEstado.png' : '/assets/icon/ocultoEstado.png'}`}
                            alt="detalles"
                        />
                    </button>
                </div>
            ),
        },
    ];

    // Ya no se filtra en frontend, solo se muestra lo que viene del backend
    const datosFiltrados = data;

    // Paginación real: manejar cambio de página
    const handlePageChange = (page: number) => {
        const perPage = paginationProps?.per_page || 10;
        // Mantener el valor de búsqueda en la paginación
        router.visit(`/inventario?buscar=${encodeURIComponent(buscar)}&page=${page}&per_page=${perPage}`, { preserveState: true, replace: true });
    };

    return (
        <>
            <div className="w-full">
                <div className="w-full p-4 mt-0">
                    <input
                        type="text"
                        placeholder="Buscar producto..."
                        value={buscar}
                        onChange={handleBuscar}
                        className="mb-3 w-full rounded border p-2"
                    />
                </div>

                <div className="w-full overflow-x-auto max-h-[75vh]" style={{ WebkitOverflowScrolling: 'touch', overflowX: 'auto' }}>
                    <div style={{ minWidth: 900 }}>
                        <DataTable
                            columns={columns}
                            data={datosFiltrados}
                            pagination={false} // Desactivar paginación interna
                            responsive
                            highlightOnHover
                        />
                    </div>
                </div>

                {/* Paginación real del backend */}
                {paginationProps && paginationProps.last_page > 1 && (
                    <div className="flex justify-center gap-2 my-4 flex-wrap">
                        <button
                            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                            disabled={paginationProps.current_page === 1}
                            onClick={() => handlePageChange(paginationProps.current_page - 1)}
                        >
                            Anterior
                        </button>
                        {Array.from({ length: paginationProps.last_page }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                className={`px-3 py-1 rounded ${paginationProps.current_page === page ? 'bg-[#0B0B0B] text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                                onClick={() => handlePageChange(page)}
                                disabled={paginationProps.current_page === page}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                            disabled={paginationProps.current_page === paginationProps.last_page}
                            onClick={() => handlePageChange(paginationProps.current_page + 1)}
                        >
                            Siguiente
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
    