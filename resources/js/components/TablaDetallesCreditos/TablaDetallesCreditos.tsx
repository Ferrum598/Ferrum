import type { Credito } from "../Interfaces/interfaceCreditos";

export default function TablaDetallesCreditos({ credito }: { credito: Credito }) {
    const detalles = credito.venta?.detalles ?? [];
    return (
        <section className="rounded bg-white p-4 shadow">
            <h2 className="mb-3 text-lg font-bold">Productos de la venta #{credito.fk_venta}</h2>
            <div className="overflow-auto">
                <table className="w-full min-w-[600px] text-left">
                    <thead><tr className="border-b bg-gray-100"><th className="p-2">Producto</th><th className="p-2">Lote</th><th className="p-2">Cantidad</th><th className="p-2">Precio unitario</th><th className="p-2">Subtotal</th></tr></thead>
                    <tbody>{detalles.map(d => <tr className="border-b" key={d.id_detalle}>
                        <td className="p-2">{d.lote?.producto?.nombre_producto ?? "Producto"}</td><td className="p-2">{d.lote?.nombre_lote ?? "—"}</td>
                        <td className="p-2">{d.cantidad}</td><td className="p-2">Q{Number(d.precio_unitario).toFixed(2)}</td><td className="p-2">Q{Number(d.subtotal).toFixed(2)}</td>
                    </tr>)}</tbody>
                </table>
                {detalles.length === 0 && <p className="p-3 text-gray-600">Esta venta no contiene detalles.</p>}
            </div>
        </section>
    );
}