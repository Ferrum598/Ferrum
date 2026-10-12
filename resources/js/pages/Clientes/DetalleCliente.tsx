import SistemaLayout from "@/layouts/SistemaLayout/SistemaLayout";
import FormularioAbonarCredito from "@/components/FormularioAbonarCredito/FormularioAbonarCredito";
import type { Cliente } from "@/components/Interfaces/interfaceCliente";
import { Head, Link, usePage } from "@inertiajs/react";
import { useEffect } from "react";
import Swal from "sweetalert2";

type Detalle = Cliente & { creditos: { id_credito: number; fk_venta: number; monto_total: string; saldo_pendiente: string; fecha_inicio: string; fecha_vencimiento: string; estado: string; venta?: { comprobante?: { id_comprobante: number; numero_comprobante: string } } }[] };
export default function DetalleCliente({ cliente }: { cliente: Detalle }) {
    const { flash } = usePage().props as { flash?: { title?: string; message?: string; icon?: "success" | "error" } };
    useEffect(() => { if (flash?.message) Swal.fire({ title: flash.title, text: flash.message, icon: flash.icon, timer: 2200, showConfirmButton: false }); }, [flash]);
    const deuda = cliente.creditos.filter(c => c.estado !== "pagado").reduce((sum, c) => sum + Number(c.saldo_pendiente), 0);
    return <SistemaLayout><Head title={`Cliente: ${cliente.nombre_cliente}`} /><main className="mx-auto flex w-full max-w-6xl flex-col gap-4 py-4">
        <Link href="/clientes" className="text-blue-600 underline">← Volver a clientes</Link>
        <section className="rounded bg-white p-5 shadow"><h1 className="text-2xl font-bold">{cliente.nombre_cliente} {cliente.apellido_cliente}</h1><p>Teléfono: {cliente.numero_cliente || "—"}</p><p className="mt-2 font-semibold">Deuda pendiente: Q{deuda.toFixed(2)}</p></section>
        {deuda > 0 && <FormularioAbonarCredito clienteId={cliente.id_cliente} saldoMaximo={deuda} />}
        <section className="overflow-auto rounded bg-white p-4 shadow"><h2 className="mb-3 text-xl font-bold">Créditos del cliente</h2><table className="w-full min-w-[700px] text-left"><thead><tr className="border-b bg-gray-100">{["Crédito", "Venta", "Monto", "Saldo", "Vencimiento", "Estado"].map(h => <th className="p-2" key={h}>{h}</th>)}</tr></thead><tbody>
            {cliente.creditos.map(c => <tr className="border-b" key={c.id_credito}><td className="p-2"><Link className="text-blue-600 underline" href={`/creditos/${c.id_credito}`}>#{c.id_credito}</Link></td><td className="p-2">#{c.fk_venta}{c.venta?.comprobante && <> · <a className="text-blue-600 underline" href={`/comprobantes/${c.venta.comprobante.id_comprobante}`}>{c.venta.comprobante.numero_comprobante}</a></>}</td><td className="p-2">Q{Number(c.monto_total).toFixed(2)}</td><td className="p-2">Q{Number(c.saldo_pendiente).toFixed(2)}</td><td className="p-2">{c.fecha_vencimiento}</td><td className="p-2 capitalize">{c.estado}</td></tr>)}
        </tbody></table>{cliente.creditos.length === 0 && <p className="p-3">Este cliente todavía no tiene créditos.</p>}</section>
    </main></SistemaLayout>;
}