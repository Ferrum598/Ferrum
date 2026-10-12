import { Link } from "@inertiajs/react";
import type { Credito } from "../Interfaces/interfaceCreditos";

const moneda = (valor: string | number) => `Q${Number(valor).toFixed(2)}`;

export default function TablaCreditos({ creditos }: { creditos: Credito[] }) {
    return (
        <div className="w-full overflow-auto rounded-2xl border border-slate-100 bg-white p-3 shadow-md md:p-5">
            <table className="w-full min-w-[900px] border-separate border-spacing-0 text-left">
                <thead><tr className="bg-gradient-to-r from-slate-900 to-blue-800 text-white">
                    {["Cliente", "Venta / comprobante", "Monto", "Saldo", "Inicio", "Vencimiento", "Estado", ""].map(t => <th className="p-3 text-xs font-bold uppercase tracking-wide first:rounded-tl-xl last:rounded-tr-xl" key={t}>{t}</th>)}
                </tr></thead>
                <tbody>{creditos.map(c => {
                    const daysLeft = (new Date(`${c.fecha_vencimiento}T00:00:00`).getTime() - new Date(new Date().toDateString()).getTime()) / 86400000;
                    const alert = c.estado === "vencido" || (c.estado === "pendiente" && daysLeft >= 0 && daysLeft <= 3);
                    return <tr className={`transition-colors hover:bg-blue-50/70 ${c.estado === "vencido" ? "bg-red-50/80 text-red-900" : alert ? "bg-amber-50/80 text-amber-900" : "even:bg-slate-50/60"}`} key={c.id_credito}>
                        <td className="border-b border-slate-100 p-3 font-semibold text-slate-800">{c.cliente?.nombre_cliente} {c.cliente?.apellido_cliente}</td>
                        <td className="border-b border-slate-100 p-3 text-slate-600">#{c.fk_venta}{c.venta?.comprobante && <> / <a className="text-blue-600 underline" href={`/comprobantes/${c.venta.comprobante.id_comprobante}`}>{c.venta.comprobante.numero_comprobante}</a></>}</td>
                        <td className="border-b border-slate-100 p-3 font-medium text-slate-600">{moneda(c.monto_total)}</td><td className="border-b border-slate-100 p-3 font-bold text-slate-900">{moneda(c.saldo_pendiente)}</td>
                        <td className="border-b border-slate-100 p-3 text-slate-500">{c.fecha_inicio}</td><td className="border-b border-slate-100 p-3 font-medium">{c.fecha_vencimiento}{alert && c.estado === "pendiente" && <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">(próximo)</span>}</td>
                        <td className="border-b border-slate-100 p-3"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold capitalize ${c.estado === "pagado" ? "bg-emerald-100 text-emerald-800" : c.estado === "vencido" ? "bg-red-100 text-red-800" : alert ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}`}>{c.estado}</span></td><td className="border-b border-slate-100 p-3"><Link className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2 text-sm font-bold text-white shadow-sm transition hover:shadow-md" href={`/creditos/${c.id_credito}`}>Ver</Link></td>
                    </tr>;
                })}</tbody>
            </table>
            {creditos.length === 0 && <p className="p-8 text-center text-slate-500">💳 No hay créditos que coincidan con los filtros.</p>}
        </div>
    );
}