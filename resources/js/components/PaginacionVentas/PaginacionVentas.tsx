import { router } from "@inertiajs/react";
import { Paginado } from "@/components/Interfaces/interfaceCatalogo";

const botonBase = "min-w-[44px] min-h-[44px] px-4 py-2 rounded-xl border font-medium shadow-sm transition active:scale-95";

export default function PaginacionVentas<T>({ paginado, onPageChange }: { paginado: Paginado<T>; onPageChange?: (page: number) => void }) {
    if (paginado.last_page <= 1) return null;
    return (
        <div className="flex flex-wrap justify-center mt-6 gap-2 print:hidden">
            {paginado.links.map((link, idx) => {
                const etiqueta = link.label === '&laquo; Previous' ? 'Anterior' : link.label === 'Next &raquo;' ? 'Siguiente' : link.label;
                return (
                    <button
                        key={idx}
                        disabled={!link.url || link.active}
                        onClick={() => {
                            if (!link.url) return;
                            if (onPageChange) {
                                const page = Number(new URL(link.url, window.location.origin).searchParams.get('page'));
                                if (page > 0) onPageChange(page);
                            } else {
                                router.get(link.url, {}, { preserveState: true, preserveScroll: true });
                            }
                        }}
                        className={`${botonBase} disabled:opacity-50 disabled:cursor-not-allowed ${link.active ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-md' : 'bg-white text-slate-700 border-slate-200 hover:bg-blue-50 hover:text-blue-600'}`}
                        dangerouslySetInnerHTML={{ __html: etiqueta }}
                    />
                );
            })}
        </div>
    );
}
