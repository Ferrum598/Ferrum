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
        <main className="mx-auto flex w-full max-w-7xl flex-col gap-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-bold">Clientes</h1>
                <button onClick={() => { setEditando(null); setMostrarFormulario(!mostrarFormulario); }} className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700">Agregar cliente</button>
            </div>
            {mostrarFormulario && <FormularioCliente cliente={editando} onCancel={() => { setMostrarFormulario(false); setEditando(null); }} />}
            <form onSubmit={buscarClientes} className="flex gap-2"><input className="w-full rounded border p-2" placeholder="Buscar por nombre, apellido o teléfono" value={buscar} onChange={e => setBuscar(e.target.value)} /><button className="rounded bg-gray-700 px-4 py-2 font-bold text-white">Buscar</button></form>
            <div className="overflow-auto rounded bg-white p-2 shadow md:p-5">
                <table className="w-full min-w-[680px] text-left"><thead><tr className="border-b bg-gray-100">{["Nombre", "Teléfono", "Deuda total", "Acciones"].map(label => <th className="p-3" key={label}>{label}</th>)}</tr></thead>
                    <tbody>{clientes.data.map(cliente => <tr className="border-b hover:bg-gray-50" key={cliente.id_cliente}>
                        <td className="p-3">{cliente.nombre_cliente} {cliente.apellido_cliente}</td><td className="p-3">{cliente.numero_cliente || "—"}</td><td className="p-3">Q{Number(cliente.deuda_total ?? 0).toFixed(2)}</td>
                        <td className="flex flex-wrap gap-2 p-3"><Link className="rounded bg-green-600 px-3 py-2 font-bold text-white" href={`/clientes/${cliente.id_cliente}/detalle`}>Ver</Link>
                            <button className="rounded bg-blue-500 px-3 py-2 font-bold text-white" onClick={() => { setEditando(cliente); setMostrarFormulario(true); }}>Editar</button>
                            <button className="rounded bg-red-600 px-3 py-2 font-bold text-white" onClick={() => eliminar(cliente)}>Eliminar</button></td>
                    </tr>)}</tbody>
                </table>
                {clientes.data.length === 0 && <p className="p-4 text-center text-gray-600">No hay clientes registrados.</p>}
                <nav className="mt-4 flex flex-wrap gap-2">{clientes.links.map((link, i) => <button key={i} disabled={!link.url} onClick={() => link.url && router.visit(link.url, { preserveState: true })} className={`rounded border px-3 py-1 ${link.active ? "bg-blue-600 text-white" : "bg-white"}`} dangerouslySetInnerHTML={{ __html: link.label }} />)}</nav>
            </div>
        </main>
    </SistemaLayout>;
}