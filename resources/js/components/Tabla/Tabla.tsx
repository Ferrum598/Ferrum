import { LoteInventario, PaginadoInventario, ProductoInventario } from '@/components/Interfaces/interfaceInventario';
import { Fragment, useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import Swal from 'sweetalert2';

interface TablaProps {
    productos?: PaginadoInventario<ProductoInventario>;
    buscarInicial?: string;
}

const moneda = (valor: number) => Number(valor).toLocaleString('es-US', { style: 'currency', currency: 'GTQ' });

const badgeExistencias = (n: number) =>
    n === 0 ? 'bg-red-100 text-red-700 ring-red-200' : n < 10 ? 'bg-amber-100 text-amber-700 ring-amber-200' : 'bg-emerald-100 text-emerald-700 ring-emerald-200';

function DetalleLotes({ data }: { data: ProductoInventario }) {
    const [loteSeleccionadoId, setLoteSeleccionadoId] = useState<number | null>(null);
    const [cantidadAgregar, setCantidadAgregar] = useState('');

    const loteSeleccionado = data.lotes.find((l: LoteInventario) => l.id_lote === loteSeleccionadoId) ?? null;

    const agregarStock = () => {
        if (!loteSeleccionado) return;

        const cantidad = Number(cantidadAgregar);
        if (!Number.isInteger(cantidad) || cantidad <= 0) {
            Swal.fire({
                title: 'Cantidad inválida',
                text: 'Debes ingresar un número entero mayor a 0.',
                icon: 'warning',
                confirmButtonColor: '#3085d6',
            });
            return;
        }

        router.post(
            `/inventario/lotes/${loteSeleccionado.id_lote}/stock`,
            { cantidad: String(cantidad) },
            {
                preserveState: true,
                replace: true,
                onSuccess: () => {
                    setLoteSeleccionadoId(null);
                    setCantidadAgregar('');
                },
            },
        );
    };

    return (
        <div className="w-full rounded-xl border border-slate-100 bg-white p-4 shadow-inner">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold text-slate-800">📦 Lotes de {data.nombre_producto}</h3>
                <button
                    className="cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98]"
                    onClick={() => router.visit(`/inventario/${data.id_producto}/lotes/agregar`)}
                >
                    ＋ Agregar lote
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                            <th className="px-3 py-2">Lote</th>
                            <th className="px-3 py-2">Compra</th>
                            <th className="px-3 py-2">Venta</th>
                            <th className="px-3 py-2">Disponible</th>
                            <th className="px-3 py-2">Ingreso</th>
                            <th className="px-3 py-2">Estado</th>
                            <th className="px-3 py-2">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.lotes.map((l: LoteInventario) => (
                            <tr key={l.id_lote} className="transition hover:bg-blue-50/60">
                                <td className="px-3 py-2 font-medium text-slate-800">{l.nombre_lote || `Lote #${l.id_lote}`}</td>
                                <td className="px-3 py-2 text-slate-600">{moneda(l.precio_compra)}</td>
                                <td className="px-3 py-2 font-semibold text-slate-800">{moneda(l.precio_venta)}</td>
                                <td className="px-3 py-2">
                                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ${badgeExistencias(l.cantidad_disponible)}`}>{l.cantidad_disponible}</span>
                                    <span className="text-slate-400"> / {l.cantidad}</span>
                                </td>
                                <td className="px-3 py-2 text-slate-600">{l.fecha_ingreso}</td>
                                <td className="px-3 py-2">
                                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${l.activo ? 'bg-emerald-100 text-emerald-700 ring-emerald-200' : 'bg-slate-100 text-slate-500 ring-slate-200'}`}>
                                        {l.activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td className="px-3 py-2">
                                    <div className="flex gap-3 text-sm font-medium">
                                        <button className="cursor-pointer text-emerald-600 hover:underline" onClick={() => { setLoteSeleccionadoId(l.id_lote); setCantidadAgregar(''); }}>
                                            ＋ Stock
                                        </button>
                                        <button className="cursor-pointer text-blue-600 hover:underline" onClick={() => router.visit(`/inventario/lotes/${l.id_lote}/editar`)}>
                                            ✏️ Editar
                                        </button>
                                        <button className="cursor-pointer text-indigo-600 hover:underline" onClick={() => router.visit(`/codigos-barras/imprimir?lote=${l.id_lote}`)}>
                                            🏷️ Imprimir código
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {loteSeleccionado && (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <div className="mb-3 flex items-center justify-between gap-2">
                        <h4 className="font-semibold text-emerald-800">Agregar stock al lote</h4>
                        <button className="text-sm font-medium text-slate-500 hover:text-slate-700" onClick={() => { setLoteSeleccionadoId(null); setCantidadAgregar(''); }}>
                            Cerrar
                        </button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-xl bg-white px-3 py-2 shadow-sm">
                            <p className="text-xs uppercase tracking-wide text-slate-500">Lote</p>
                            <p className="mt-1 font-semibold text-slate-800">{loteSeleccionado.nombre_lote || `Lote #${loteSeleccionado.id_lote}`}</p>
                        </div>
                        <div className="rounded-xl bg-white px-3 py-2 shadow-sm">
                            <p className="text-xs uppercase tracking-wide text-slate-500">Stock actual</p>
                            <p className="mt-1 font-semibold text-slate-800">{loteSeleccionado.cantidad_disponible} unidades</p>
                        </div>
                        <div className="rounded-xl bg-white px-3 py-2 shadow-sm">
                            <p className="text-xs uppercase tracking-wide text-slate-500">Total en lote</p>
                            <p className="mt-1 font-semibold text-slate-800">{loteSeleccionado.cantidad} unidades</p>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-2">
                        <label className="text-sm font-medium text-slate-700">Cantidad que entra</label>
                        <input
                            type="number"
                            min={1}
                            step={1}
                            value={cantidadAgregar}
                            onChange={(e) => setCantidadAgregar(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="Ej. 25"
                        />
                        <button
                            className="mt-2 w-full cursor-pointer rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 p-3 font-semibold text-white shadow-lg transition hover:from-emerald-700 hover:to-teal-700 active:scale-[0.98]"
                            onClick={agregarStock}
                        >
                            Agregar stock al lote
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function Tabla({ productos, buscarInicial = '' }: TablaProps) {
    const [buscar, setBuscar] = useState(buscarInicial);
    const [abiertos, setAbiertos] = useState<number[]>([]);
    // La selección se conserva al cambiar de página o de búsqueda
    const [seleccion, setSeleccion] = useState<number[]>([]);
    const [cargandoTodos, setCargandoTodos] = useState(false);
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

    const alternar = (id: number) => setAbiertos((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));

    const handlePageChange = (page: number) => {
        router.visit(`/inventario?buscar=${encodeURIComponent(buscar)}&page=${page}&per_page=${perPage}`, { preserveState: true, replace: true });
    };

    const alternarSeleccion = (id: number) => setSeleccion((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

    const seleccionarTodos = async () => {
        setCargandoTodos(true);
        try {
            const res = await fetch(`/inventario/ids?buscar=${encodeURIComponent(buscar)}`, { headers: { Accept: 'application/json' }, credentials: 'same-origin' });
            if (res.ok) {
                const ids: number[] = await res.json();
                setSeleccion((s) => Array.from(new Set([...s, ...ids])));
            }
        } finally {
            setCargandoTodos(false);
        }
    };

    const imprimirSeleccion = () => {
        sessionStorage.setItem('inventario_imprimir', JSON.stringify(seleccion));
        router.visit('/inventario/imprimir');
    };

    const lista = productos?.data || [];
    const paginaCompletaSeleccionada = lista.length > 0 && lista.every((p) => seleccion.includes(p.id_producto));
    const alternarPagina = () =>
        setSeleccion((s) => (paginaCompletaSeleccionada ? s.filter((id) => !lista.some((p) => p.id_producto === id)) : Array.from(new Set([...s, ...lista.map((p) => p.id_producto)]))));
    const bajoStock = lista.filter((p) => p.existencias < 10).length;

    return (
        <div className="w-full space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-5 text-white shadow-lg">
                    <p className="text-sm opacity-80">📦 Productos activos</p>
                    <p className="text-3xl font-extrabold">{productos?.total ?? 0}</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-md">
                    <p className="text-sm text-slate-500">🧱 Existencias en esta página</p>
                    <p className="text-3xl font-extrabold text-slate-800">{lista.reduce((s, p) => s + p.existencias, 0)}</p>
                </div>
                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5 shadow-md">
                    <p className="text-sm text-amber-700">⚠️ Con poco stock (&lt; 10)</p>
                    <p className="text-3xl font-extrabold text-amber-700">{bajoStock}</p>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-md">
                <input
                    type="text"
                    placeholder="🔍 Buscar producto o código..."
                    value={buscar}
                    onChange={(e) => setBuscar(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-md">
                <button onClick={seleccionarTodos} disabled={cargandoTodos} className="cursor-pointer rounded-xl bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50">
                    {cargandoTodos ? 'Cargando…' : buscar ? '☑️ Seleccionar todos los resultados' : '☑️ Seleccionar todos'}
                </button>
                <button onClick={() => setSeleccion([])} disabled={!seleccion.length} className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50">
                    Quitar selección
                </button>
                <span className="text-sm text-slate-500">{seleccion.length} seleccionados</span>
                <button onClick={imprimirSeleccion} disabled={!seleccion.length} className="ml-auto cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:from-blue-700 hover:to-indigo-700 active:scale-95 disabled:opacity-50">
                    🖨️ Imprimir inventario
                </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-md">
                {lista.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                        <div className="mb-2 text-5xl">📭</div>
                        No hay productos registrados.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-[800px] w-full text-sm">
                            <thead className="bg-gradient-to-r from-slate-900 to-blue-800 text-left text-xs uppercase tracking-wide text-white">
                                <tr>
                                    <th className="w-10 px-4 py-3">
                                        <input type="checkbox" checked={paginaCompletaSeleccionada} onChange={alternarPagina} className="h-4 w-4 cursor-pointer" aria-label="Seleccionar página" />
                                    </th>
                                    <th className="w-10 px-4 py-3"></th>
                                    <th className="px-4 py-3">Producto</th>
                                    <th className="px-4 py-3">Categoría</th>
                                    <th className="px-4 py-3">Descripción</th>
                                    <th className="px-4 py-3">Existencias</th>
                                    <th className="px-4 py-3">Lotes</th>
                                    <th className="px-4 py-3 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {lista.map((p) => {
                                    const abierto = abiertos.includes(p.id_producto);
                                    return (
                                        <Fragment key={p.id_producto}>
                                            <tr className="transition hover:bg-blue-50/60">
                                                <td className="px-4 py-3">
                                                    <input type="checkbox" checked={seleccion.includes(p.id_producto)} onChange={() => alternarSeleccion(p.id_producto)} className="h-4 w-4 cursor-pointer" aria-label="Seleccionar producto" />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <button className="cursor-pointer text-slate-500 transition hover:text-blue-600" onClick={() => alternar(p.id_producto)} aria-label="Ver lotes">
                                                        <span className={`inline-block transition-transform ${abierto ? 'rotate-90' : ''}`}>▶</span>
                                                    </button>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <img src={p.imagen} alt={p.nombre_producto} className="h-14 w-14 rounded-xl border border-slate-200 bg-slate-100 object-cover shadow-sm" />
                                                        <span className="font-semibold text-slate-800">{p.nombre_producto}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {p.categoria ? <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">{p.categoria}</span> : <span className="text-slate-400">—</span>}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="max-w-[200px] truncate text-slate-600" title={p.descripcion || ''}>
                                                        {p.descripcion}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${badgeExistencias(p.existencias)}`}>{p.existencias}</span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-600">{p.lotes.length}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-center gap-3">
                                                        <button
                                                            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-emerald-50 transition hover:scale-110 hover:bg-emerald-100"
                                                            onClick={() => router.visit(`/inventario/${p.id_producto}/lotes/agregar`)}
                                                            title="Agregar lote"
                                                        >
                                                            <span className="text-lg font-bold text-emerald-700">＋</span>
                                                        </button>
                                                        <button
                                                            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg transition hover:scale-110 hover:bg-blue-100"
                                                            onClick={() => router.visit(`/inventario/${p.id_producto}/editar`)}
                                                        >
                                                            <img className="h-full w-full object-contain" src="/assets/icon/editar.png" alt="editar" />
                                                        </button>
                                                        <button className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg transition hover:scale-110 hover:bg-red-100" onClick={() => botonBorrar(p.id_producto)}>
                                                            <img className="h-full w-full object-contain" src="/assets/icon/eliminar.png" alt="eliminar" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {abierto && (
                                                <tr className="bg-slate-50">
                                                    <td colSpan={8} className="px-4 py-4">
                                                        <DetalleLotes data={p} />
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {productos && productos.last_page > 1 && (
                <div className="flex flex-wrap justify-center gap-2">
                    <button className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-sm transition hover:bg-slate-100 disabled:opacity-50" disabled={productos.current_page === 1} onClick={() => handlePageChange(productos.current_page - 1)}>
                        Anterior
                    </button>
                    {Array.from({ length: productos.last_page }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            className={`rounded-xl px-3 py-1.5 shadow-sm transition ${productos.current_page === page ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' : 'border border-slate-200 bg-white hover:bg-slate-100'}`}
                            onClick={() => handlePageChange(page)}
                            disabled={productos.current_page === page}
                        >
                            {page}
                        </button>
                    ))}
                    <button className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-sm transition hover:bg-slate-100 disabled:opacity-50" disabled={productos.current_page === productos.last_page} onClick={() => handlePageChange(productos.current_page + 1)}>
                        Siguiente
                    </button>
                </div>
            )}
        </div>
    );
}
