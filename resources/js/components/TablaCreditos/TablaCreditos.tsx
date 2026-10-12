import { Link } from "@inertiajs/react";
import type { Credito } from "../Interfaces/interfaceCreditos";

const moneda = (valor: string | number) => `Q${Number(valor).toFixed(2)}`;

export default function TablaCreditos({ creditos }: { creditos: Credito[] }) {
    return (
        <div className="w-full overflow-auto rounded bg-white p-2 shadow md:p-5">
            <table className="w-full min-w-[900px] border-collapse text-left">
                <thead><tr className="border-b bg-gray-100">
                    {["Cliente", "Venta / comprobante", "Monto", "Saldo", "Inicio", "Vencimiento", "Estado", ""].map(t => <th className="p-3" key={t}>{t}</th>)}
                </tr></thead>
                <tbody>{creditos.map(c => {
                    const daysLeft = (new Date(`${c.fecha_vencimiento}T00:00:00`).getTime() - new Date(new Date().toDateString()).getTime()) / 86400000;
                    const alert = c.estado === "vencido" || (c.estado === "pendiente" && daysLeft >= 0 && daysLeft <= 3);
                    return <tr className={`border-b hover:bg-gray-50 ${alert ? "bg-red-50 text-red-800" : ""}`} key={c.id_credito}>
                        <td className="p-3">{c.cliente?.nombre_cliente} {c.cliente?.apellido_cliente}</td>
                        <td className="p-3">#{c.fk_venta}{c.venta?.comprobante && <> / <a className="text-blue-600 underline" href={`/comprobantes/${c.venta.comprobante.id_comprobante}`}>{c.venta.comprobante.numero_comprobante}</a></>}</td>
                        <td className="p-3">{moneda(c.monto_total)}</td><td className="p-3">{moneda(c.saldo_pendiente)}</td>
                        <td className="p-3">{c.fecha_inicio}</td><td className="p-3">{c.fecha_vencimiento}{alert && c.estado === "pendiente" && <span className="ml-1 font-bold">(próximo)</span>}</td>
                        <td className="p-3 capitalize">{c.estado}</td><td className="p-3"><Link className="rounded bg-blue-500 px-3 py-2 font-bold text-white hover:bg-blue-700" href={`/creditos/${c.id_credito}`}>Ver</Link></td>
                    </tr>;
                })}</tbody>
            </table>
            {creditos.length === 0 && <p className="p-4 text-center text-gray-600">No hay créditos que coincidan con los filtros.</p>}
        </div>
    );
}