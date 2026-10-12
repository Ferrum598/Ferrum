import { LoteInventario, PaginadoInventario, ProductoInventario } from '@/components/Interfaces/interfaceInventario';
import { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import { router } from '@inertiajs/react';
import Swal from 'sweetalert2';

interface TablaProps {
    productos?: PaginadoInventario<ProductoInventario>;
    buscarInicial?: string;
}

const moneda = (valor: number) => Number(valor).toLocaleString('es-US', { style: 'currency', currency: 'GTQ' });

function DetalleLotes({ data }: { data: ProductoInventario }) {
    return (
        <div className="w-full bg-gray-50 p-4">
            <div className="mb-2 flex items-center justify-between">
                <h3 className="font-semibold">Lotes de {data.nombre_producto}</h3>
                <button
                    className="rounded-[8px] bg-[#0B0B0B] px-3 py-1 text-[14px] font-semibold text-white transition duration-300 hover:bg-[#282727] cursor-pointer"
                    onClick={() => router.visit(`/inventario/${data.id_producto}/lotes/agregar`)}
                >
                    Agregar lote
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="text-left text-slate-600">
                            <th className="px-3 py-2">Lote</th>
                            <th className="px-3 py-2">Precio compra</th>
                            <th className="px-3 py-2">Precio venta</th>
                            <th className="px-3 py-2">Disponible</th>
                            <th className="px-3 py-2">Ingreso</th>
                            <th className="px-3 py-2">Estado</th>
                            <th className="px-3 py-2">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.lotes.map((l: LoteInventario) => (
                            <tr key={l.id_lote} className="border-t border-gray-200">
                                <td className="px-3 py-2">{l.nombre_lote || `Lote #${l.id_lote}`}</td>
                                <td className="px-3 py-2">{moneda(l.precio_compra)}</td>
                                <td className="px-3 py-2">{moneda(l.precio_venta)}</td>
                                <td className="px-3 py-2">
                                    {l.cantidad_disponible < 10 ? (
                                        <span className="rounded-2xl bg-red-500 px-2 py-1 font-bold text-white">{l.cantidad_disponible}</span>
                                    ) : (
                                        l.cantidad_disponible
                                    )}
                                    <span className="text-gray-500"> / {l.cantidad}</span>
                                </td>
                                <td className="px-3 py-2">{l.fecha_ingreso}</td>
                                <td className="px-3 py-2">{l.activo ? 'Activo' : 'Inactivo'}</td>
                                <td className="px-3 py-2">
                                    <div className="flex gap-3">
                                        <button className="text-blue-600 hover:underline cursor-pointer" onClick={() => router.visit(`/inventario/lotes/${l.id_lote}/editar`)}>
                                            Editar
                                        </button>
                                        <button className="text-blue-600 hover:underline cursor-pointer" onClick={() => router.visit(`/codigos-barras/imprimir?lote=${l.id_lote}`)}>
                                            Imprimir código
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function Tabla({ productos, buscarInicial = '' }: TablaProps) {
    const [buscar, setBuscar] = useState(buscarInicial);
    const perPage = productos?.per_page || 10;

    // Debounce para no recargar en cada letra
    useEffect(() => {
        if (buscar === buscarInicial) return;
        const timeout = setTimeout(() => {
            router.visit(`/inventario?buscar=${encodeURIComponent(buscar)}&page=1&per_page=${perPage}`, { preserveState: true, replace: true });
        }, 500);
        return () => clearTimeout(timeout);
    }, [buscar]);

    const botonBorrar = (id: number) => {
        Swal.fire({
            title: '¿Está seguro?',
            text: 'El producto y sus lotes se darán de baja.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminarlo',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(`/inventario/${id}/eliminar`);
            }
        });
    };

    const columns = [
        {
            name: 'Imagen',
            cell: (row: ProductoInventario) => <img src={row.imagen} alt={row.nombre_producto} />,
            width: '140px',
        },
        { name: 'Producto', selector: (row: ProductoInventario) => row.nombre_producto, sortable: true },
        { name: 'Categoría', selector: (row: ProductoInventario) => row.categoria || '-', sortable: true },
        {
            name: 'Descripción',
            cell: (row: ProductoInventario) => (
                <div className="max-w-[180px] truncate" title={row.descripcion || ''}>
                    {row.descripcion}
                </div>
            ),
        },
        {
            name: 'Existencias',
            selector: (row: ProductoInventario) => row.existencias,
            cell: (row: ProductoInventario) =>
                row.existencias < 10 ? (
                    <div className="flex h-[20px] w-[100px] items-center rounded-2xl bg-red-500">
                        <span className="p-2 text-[14px] font-bold text-white">{row.existencias}</span>
                    </div>
                ) : (
                    row.existencias
                ),
            sortable: true,
        },
        { name: 'Lotes', selector: (row: ProductoInventario) => row.lotes.length, sortable: true, width: '90px' },
        {
            name: 'Acciones',
            cell: (row: ProductoInventario) => (
                <div className="flex flex-wrap items-center justify-center gap-2 md:gap-5">
                    <button
                        className="flex h-8 w-8 cursor-pointer items-center justify-center transition delay-75 ease-in-out hover:scale-110 md:h-10 md:w-10"
                        onClick={() => router.visit(`/inventario/${row.id_producto}/editar`)}
                    >
                        <img className="h-full w-full object-contain" src="/assets/icon/editar.png" alt="editar" />
                    </button>
                    <button
                        className="flex h-8 w-8 cursor-pointer items-center justify-center transition delay-75 ease-in-out hover:scale-110 md:h-10 md:w-10"
                        onClick={() => botonBorrar(row.id_producto)}
                    >
                        <img className="h-full w-full object-contain" src="/assets/icon/eliminar.png" alt="eliminar" />
                    </button>
                </div>
            ),
        },
    ];

    const handlePageChange = (page: number) => {
        router.visit(`/inventario?buscar=${encodeURIComponent(buscar)}&page=${page}&per_page=${perPage}`, { preserveState: true, replace: true });
    };

    return (
        <div className="w-full">
            <div className="mt-0 w-full p-4">
                <input
                    type="text"
                    placeholder="Buscar producto o código..."
                    value={buscar}
                    onChange={(e) => setBuscar(e.target.value)}
                    className="mb-3 w-full rounded border p-2"
                />
            </div>

            <div className="max-h-[75vh] w-full overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
                <div style={{ minWidth: 900 }}>
                    <DataTable
                        columns={columns}
                        data={productos?.data || []}
                        pagination={false}
                        expandableRows
                        expandableRowsComponent={DetalleLotes}
                        noDataComponent="No hay productos registrados."
                        responsive
                        highlightOnHover
                    />
                </div>
            </div>

            {productos && productos.last_page > 1 && (
                <div className="my-4 flex flex-wrap justify-center gap-2">
                    <button
                        className="rounded bg-gray-200 px-3 py-1 hover:bg-gray-300"
                        disabled={productos.current_page === 1}
                        onClick={() => handlePageChange(productos.current_page - 1)}
                    >
                        Anterior
                    </button>
                    {Array.from({ length: productos.last_page }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            className={`rounded px-3 py-1 ${productos.current_page === page ? 'bg-[#0B0B0B] text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                            onClick={() => handlePageChange(page)}
                            disabled={productos.current_page === page}
                        >
                            {page}
                        </button>
                    ))}
                    <button
                        className="rounded bg-gray-200 px-3 py-1 hover:bg-gray-300"
                        disabled={productos.current_page === productos.last_page}
                        onClick={() => handlePageChange(productos.current_page + 1)}
                    >
                        Siguiente
                    </button>
                </div>
            )}
        </div>
    );
}
