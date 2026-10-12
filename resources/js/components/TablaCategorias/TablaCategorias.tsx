import { Categoria } from '../Interfaces/interfaceCategoria';
import { useEffect, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import Swal from 'sweetalert2';

const btnPag = 'rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:opacity-50';

export default function TablaCategorias({ categorias = [], onEditar }: { categorias: Categoria[]; onEditar?: (c: Categoria) => void }) {
    const [paginaActual, setPaginaActual] = useState(1);
    const porPagina = 10;
    const totalPaginas = Math.max(1, Math.ceil(categorias.length / porPagina));

    useEffect(() => {
        if (paginaActual > totalPaginas) setPaginaActual(totalPaginas);
    }, [categorias.length, totalPaginas, paginaActual]);

    const categoriasPagina = useMemo(() => categorias.slice((paginaActual - 1) * porPagina, paginaActual * porPagina), [categorias, paginaActual]);

    const startPage = Math.max(1, paginaActual - 2);
    const endPage = Math.min(totalPaginas, paginaActual + 2);
    const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

    const eliminar = (c: Categoria) => {
        Swal.fire({
            title: '¿Está seguro?',
            text: `Se eliminará la categoría "${c.nombre_categoria}".`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminarla',
            cancelButtonText: 'Cancelar',
        }).then((r) => {
            if (r.isConfirmed) router.post(`/categorias/${c.id_categoria}/eliminar`);
        });
    };

    return (
        <div className="w-full overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-md">
            <div className="bg-gradient-to-r from-slate-900 to-blue-800 px-6 py-4">
                <h2 className="font-semibold text-white">🗂️ Categorías creadas ({categorias.length})</h2>
            </div>

            {categorias.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                    <div className="mb-2 text-5xl">🏷️</div>
                    Aún no hay categorías registradas.
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="px-6 py-3">Nombre</th>
                                    <th className="px-6 py-3">Productos</th>
                                    <th className="px-6 py-3">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {categoriasPagina.map((c) => (
                                    <tr key={c.id_categoria} className="transition hover:bg-blue-50/60">
                                        <td className="px-6 py-3 font-semibold text-slate-800">{c.nombre_categoria}</td>
                                        <td className="px-6 py-3">
                                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${c.productos_count ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>{c.productos_count ?? 0}</span>
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="flex gap-4 font-medium">
                                                <button className="cursor-pointer text-blue-600 hover:underline" onClick={() => onEditar?.(c)}>✏️ Editar</button>
                                                <button className="cursor-pointer text-red-600 hover:underline" onClick={() => eliminar(c)}>🗑️ Eliminar</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-6 py-4 md:flex-row">
                        <span className="text-sm text-slate-600">
                            Mostrando {(paginaActual - 1) * porPagina + 1}–{Math.min(paginaActual * porPagina, categorias.length)} de {categorias.length}
                        </span>
                        <div className="flex items-center gap-2">
                            <button className={btnPag} onClick={() => setPaginaActual(1)} disabled={paginaActual === 1} aria-label="Primera página">«</button>
                            <button className={btnPag} onClick={() => setPaginaActual((p) => Math.max(1, p - 1))} disabled={paginaActual === 1}>Anterior</button>
                            {pages.map((p) => (
                                <button
                                    key={p}
                                    className={`rounded-xl px-3 py-1.5 shadow-sm transition ${paginaActual === p ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'}`}
                                    onClick={() => setPaginaActual(p)}
                                >
                                    {p}
                                </button>
                            ))}
                            <button className={btnPag} onClick={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))} disabled={paginaActual === totalPaginas}>Siguiente</button>
                            <button className={btnPag} onClick={() => setPaginaActual(totalPaginas)} disabled={paginaActual === totalPaginas} aria-label="Última página">»</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
