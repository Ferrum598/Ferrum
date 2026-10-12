import SistemaLayout from "@/layouts/SistemaLayout/SistemaLayout";
import FormularioCliente from "@/components/FormularioCliente/FromularioCliente";
import type { Cliente } from "@/components/Interfaces/interfaceCliente";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

interface Paginacion { data: Cliente[]; current_page: number; last_page: number; links: { url: string | null; label: string; active: boolean }[] }
export default function Clientes({ clientes, filtros }: { clientes: Paginacion; filtros: { q?: string } }) {
    const [buscar, setBuscar] = useState(filtros.q ?? "");
    const [editando, setEditando] = useState<Cliente | null>(null);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const { flash } = usePage().props as { flash?: { title?: string; message?: string; icon?: "success" | "error" } };

    useEffect(() => { if (flash?.message) Swal.fire({ title: flash.title, text: flash.message, icon: flash.icon, timer: 2200, showConfirmButton: false }); }, [flash]);
    const buscarClientes = (e: React.FormEvent) => { e.preventDefault(); router.get("/clientes", { q: buscar }, { preserveState: true, replace: true }); };
    const eliminar = (cliente: Cliente) => Swal.fire({ title: "¿Eliminar cliente?", text: `${cliente.nombre_cliente} ${cliente.apellido_cliente}`, icon: "warning", showCancelButton: true, confirmButtonText: "Eliminar", cancelButtonText: "Cancelar" }).then(result => { if (result.isConfirmed) router.delete(`/clientes/${cliente.id_cliente}`); });

    return <SistemaLayout><Head title="Clientes" />
        <main className="mx-auto flex w-full max-w-7xl flex-col gap-5 py-5">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-blue-50/70 p-5 shadow-md sm:p-7"><div><p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Cartera de clientes</p><h1 className="text-3xl font-extrabold text-transparent bg-gradient-to-r from-slate-900 to-blue-700 bg-clip-text">Clientes</h1><p className="mt-1 text-sm text-slate-500">Administra contactos y consulta su deuda pendiente.</p></div>
                <button onClick={() => { setEditando(null); setMostrarFormulario(!mostrarFormulario); }} className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-xl">Agregar cliente</button>
            </div>
            {mostrarFormulario && <FormularioCliente cliente={editando} onCancel={() => { setMostrarFormulario(false); setEditando(null); }} />}
            <form onSubmit={buscarClientes} className="flex gap-2 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm"><input className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20" placeholder="Buscar por nombre, apellido o teléfono" value={buscar} onChange={e => setBuscar(e.target.value)} /><button className="rounded-xl bg-slate-800 px-5 py-2.5 font-bold text-white transition hover:bg-blue-800">Buscar</button></form>
            <div className="overflow-auto rounded-2xl border border-slate-100 bg-white p-3 shadow-md md:p-5">
                <table className="w-full min-w-[680px] border-separate border-spacing-0 text-left"><thead><tr className="bg-gradient-to-r from-slate-900 to-blue-800 text-white">{["Nombre", "Teléfono", "Deuda total", "Acciones"].map(label => <th className="p-3 text-xs font-bold uppercase tracking-wide first:rounded-tl-xl last:rounded-tr-xl" key={label}>{label}</th>)}</tr></thead>
                    <tbody>{clientes.data.map(cliente => <tr className="transition-colors even:bg-slate-50/60 hover:bg-blue-50/70" key={cliente.id_cliente}>
                        <td className="border-b border-slate-100 p-3 font-semibold text-slate-800">{cliente.nombre_cliente} {cliente.apellido_cliente}</td><td className="border-b border-slate-100 p-3 text-slate-600">{cliente.numero_cliente || "—"}</td><td className="border-b border-slate-100 p-3"><span className={`inline-flex rounded-full px-3 py-1 text-sm font-bold ${Number(cliente.deuda_total ?? 0) > 0 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>Q{Number(cliente.deuda_total ?? 0).toFixed(2)}</span></td>
                        <td className="flex flex-wrap gap-2 border-b border-slate-100 p-3"><Link className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 hover:shadow-md" href={`/clientes/${cliente.id_cliente}/detalle`}>Ver</Link>
                            <button className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2 text-sm font-bold text-white shadow-sm transition hover:shadow-md" onClick={() => { setEditando(cliente); setMostrarFormulario(true); }}>Editar</button>
                            <button className="rounded-xl bg-red-600 px-3 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 hover:shadow-md" onClick={() => eliminar(cliente)}>Eliminar</button></td>
                    </tr>)}</tbody>
                </table>
                {clientes.data.length === 0 && <p className="rounded-xl bg-slate-50 p-10 text-center text-slate-500"><span className="mb-2 block text-3xl">🔎</span>No hay clientes registrados.</p>}
                <nav className="mt-5 flex flex-wrap items-center justify-center gap-2 border-t border-slate-100 pt-4">{clientes.links.map((link, i) => <button key={i} disabled={!link.url} onClick={() => link.url && router.visit(link.url, { preserveState: true })} className={`rounded-xl border px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${link.active ? "border-blue-600 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow" : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50"}`} dangerouslySetInnerHTML={{ __html: link.label }} />)}</nav>
            </div>
        </main>
    </SistemaLayout>;
}