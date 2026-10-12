import { router } from "@inertiajs/react";
import { Paginado } from "@/components/Interfaces/interfaceCatalogo";

const botonBase = "min-w-[44px] min-h-[44px] px-5 py-3 rounded-md border font-medium shadow-sm transition";

export default function PaginacionVentas<T>({ paginado }: { paginado: Paginado<T> }) {
    if (paginado.last_page <= 1) return null;
    return (
        <div className="flex flex-wrap justify-center mt-6 gap-2">
            {paginado.links.map((link, idx) => {
                const etiqueta = link.label === '&laquo; Previous' ? 'Anterior' : link.label === 'Next &raquo;' ? 'Siguiente' : link.label;
                return (
                    <button
                        key={idx}
                        disabled={!link.url}
                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true, preserveScroll: true })}
                        className={`${botonBase} disabled:opacity-50 disabled:cursor-not-allowed ${link.active ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:text-blue-600'}`}
                        dangerouslySetInnerHTML={{ __html: etiqueta }}
                    />
                );
            })}
        </div>
    );
}
