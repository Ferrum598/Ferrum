import { Categoria } from "../Interfaces/interfaceCategoria";
import { useEffect, useMemo, useState} from "react";

export default function TablaCategorias({ categorias = [] }: { categorias: Categoria[] }) {
    // Paginación
      const [paginaActual, setPaginaActual] = useState(1);
      const porPagina = 10;
      const totalPaginas = Math.max(1, Math.ceil(categorias.length / porPagina));
    
      useEffect(() => {
        if (paginaActual > totalPaginas) setPaginaActual(totalPaginas);
      }, [categorias.length, totalPaginas, paginaActual]);
    
      const categoriasPagina = useMemo(
        () => categorias.slice((paginaActual - 1) * porPagina, paginaActual * porPagina),
        [categorias, paginaActual]
      );
    
      const startPage = Math.max(1, paginaActual - 2);
      const endPage = Math.min(totalPaginas, paginaActual + 2);
      const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
    return (
        <>
            <div className="w-full bg-white rounded-xl shadow-lg ring-1 ring-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/60">
                <h2 className="font-semibold text-slate-800">Categorías creadas</h2>
            </div>

            {categorias.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No hay categorías registradas.</div>
            ) : (
                <>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                    <thead className="bg-slate-50">
                        <tr className="text-left text-slate-600">
                        <th className="px-6 py-3 border-b-2 border-gray-200">Nombre</th>
                        <th className="px-6 py-3 border-b-2 border-gray-200">Descripción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {categoriasPagina.map((c) => (
                        <tr key={c.id_categoria} className="odd:bg-white even:bg-slate-50 hover:bg-blue-50/70">
                            <td className="px-6 py-3 font-medium text-slate-900 border-r-2 border-gray-200">{c.categoria}</td>
                            <td className="px-6 py-3 text-slate-700">{c.descripcion || "-"}</td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>

                {/* Controles de paginación */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-3 px-6 py-4 border-t border-slate-200">
                    <span className="text-sm text-slate-600">
                    Mostrando {(paginaActual - 1) * porPagina + 1}–
                    {Math.min(paginaActual * porPagina, categorias.length)} de {categorias.length}
                    </span>
                    <div className="flex items-center gap-2">
                    <button
                        className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                        onClick={() => setPaginaActual(1)}
                        disabled={paginaActual === 1}
                        aria-label="Primera página"
                    >
                        «
                    </button>
                    <button
                        className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                        onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
                        disabled={paginaActual === 1}
                    >
                        Anterior
                    </button>

                    {pages.map((p) => (
                        <button
                        key={p}
                        className={`px-3 py-1.5 rounded-lg border ${
                            paginaActual === p
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "border-slate-300 text-slate-700 hover:bg-slate-100"
                        }`}
                        onClick={() => setPaginaActual(p)}
                        >
                        {p}
                        </button>
                    ))}

                    <button
                        className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                        onClick={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))}
                        disabled={paginaActual === totalPaginas}
                    >
                        Siguiente
                    </button>
                    <button
                        className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                        onClick={() => setPaginaActual(totalPaginas)}
                        disabled={paginaActual === totalPaginas}
                        aria-label="Última página"
                    >
                        »
                    </button>
                    </div>
                </div>
                </>
            )}
            </div>
        </>
    );
}