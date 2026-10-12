import type { Credito } from "../Interfaces/interfaceCreditos";

export default function TablaDetallesCreditos({ credito }: { credito: Credito }) {
    const detalles = credito.venta?.detalles ?? [];
    return (
        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-md">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-transparent bg-gradient-to-r from-slate-900 to-blue-700 bg-clip-text"><span className="rounded-xl bg-blue-100 p-2 text-blue-700">📦</span>Productos de la venta #{credito.fk_venta}</h2>
            <div className="overflow-auto">
                <table className="w-full min-w-[600px] border-separate border-spacing-0 text-left">
                    <thead><tr className="bg-gradient-to-r from-slate-900 to-blue-800 text-white"><th className="p-3 text-xs font-bold uppercase tracking-wide first:rounded-tl-xl">Producto</th><th className="p-3 text-xs font-bold uppercase tracking-wide">Lote</th><th className="p-3 text-xs font-bold uppercase tracking-wide">Cantidad</th><th className="p-3 text-xs font-bold uppercase tracking-wide">Precio unitario</th><th className="p-3 text-xs font-bold uppercase tracking-wide last:rounded-tr-xl">Subtotal</th></tr></thead>
                    <tbody>{detalles.map(d => <tr className="transition-colors even:bg-slate-50/70 hover:bg-blue-50/70" key={d.id_detalle}>
                        <td className="border-b border-slate-100 p-3 font-semibold text-slate-800">{d.lote?.producto?.nombre_producto ?? "Producto"}</td><td className="border-b border-slate-100 p-3 text-slate-600">{d.lote?.nombre_lote ?? "—"}</td>
                        <td className="border-b border-slate-100 p-3 text-slate-600">{d.cantidad}</td><td className="border-b border-slate-100 p-3 text-slate-600">Q{Number(d.precio_unitario).toFixed(2)}</td><td className="border-b border-slate-100 p-3 font-bold text-slate-900">Q{Number(d.subtotal).toFixed(2)}</td>
                    </tr>)}</tbody>
                </table>
                {detalles.length === 0 && <p className="p-6 text-center text-slate-500">📦 Esta venta no contiene detalles.</p>}
            </div>
        </section>
    );
}