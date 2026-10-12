import SistemaLayout from "@/layouts/SistemaLayout/SistemaLayout";
import TablaDetallesCreditos from "@/components/TablaDetallesCreditos/TablaDetallesCreditos";
import FormularioAbonarCredito from "@/components/FormularioAbonarCredito/FormularioAbonarCredito";
import type { Credito } from "@/components/Interfaces/interfaceCreditos";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { useEffect } from "react";
import Swal from "sweetalert2";

export default function DetalleCredito({ credito }: { credito: Credito }) {
    const { flash } = usePage().props as { flash?: { title?: string; message?: string; icon?: "success" | "error" } };
    const fechaForm = useForm({ fecha_vencimiento: credito.fecha_vencimiento });
    useEffect(() => { if (flash?.message) Swal.fire({ title: flash.title, text: flash.message, icon: flash.icon, timer: 2200, showConfirmButton: false }); }, [flash]);
    const cambiarVencimiento = (e: React.FormEvent) => { e.preventDefault(); fechaForm.patch(`/creditos/${credito.id_credito}/vencimiento`); };
    return <SistemaLayout><Head title={`Crédito #${credito.id_credito}`} /><main className="mx-auto flex w-full max-w-6xl flex-col gap-4 py-4">
        <Link href="/creditos" className="text-blue-600 underline">← Volver a créditos</Link>
        <section className="grid gap-2 rounded bg-white p-5 shadow sm:grid-cols-2"><div><h1 className="text-2xl font-bold">Crédito #{credito.id_credito}</h1><p>Cliente: <Link className="text-blue-600 underline" href={`/clientes/${credito.fk_cliente}/detalle`}>{credito.cliente?.nombre_cliente} {credito.cliente?.apellido_cliente}</Link></p><p>Venta: #{credito.fk_venta}{credito.venta?.comprobante && <> · <a className="text-blue-600 underline" href={`/comprobantes/${credito.venta.comprobante.id_comprobante}`}>Comprobante {credito.venta.comprobante.numero_comprobante}</a></>}</p></div>
            <div className="sm:text-right"><p>Monto: Q{Number(credito.monto_total).toFixed(2)}</p><p className="font-bold">Saldo: Q{Number(credito.saldo_pendiente).toFixed(2)}</p><p>Inicio: {credito.fecha_inicio} · Vence: {credito.fecha_vencimiento}</p><p className="capitalize">Estado: {credito.estado}</p></div></section>
        {credito.estado !== "pagado" && <div className="grid gap-4 md:grid-cols-2"><FormularioAbonarCredito creditoId={credito.id_credito} saldoMaximo={Number(credito.saldo_pendiente)} />
            <form onSubmit={cambiarVencimiento} className="flex flex-col gap-3 rounded border bg-white p-4"><h2 className="text-lg font-bold">Cambiar vencimiento</h2><label className="flex flex-col gap-1">Nueva fecha<input type="date" min={new Date().toISOString().slice(0, 10)} className="rounded border p-2" value={fechaForm.data.fecha_vencimiento} onChange={e => fechaForm.setData("fecha_vencimiento", e.target.value)} /></label>{fechaForm.errors.fecha_vencimiento && <span className="text-sm text-red-600">{fechaForm.errors.fecha_vencimiento}</span>}<button className="self-start rounded bg-gray-700 px-4 py-2 font-bold text-white">Actualizar fecha</button></form></div>}
        <TablaDetallesCreditos credito={credito} />
        <section className="rounded bg-white p-4 shadow"><h2 className="mb-3 text-lg font-bold">Historial de abonos</h2>{(credito.abonos ?? []).length ? <table className="w-full text-left"><thead><tr className="border-b bg-gray-100"><th className="p-2">Fecha</th><th className="p-2">Monto</th><th className="p-2">Usuario</th></tr></thead><tbody>{credito.abonos?.map(a => <tr className="border-b" key={a.id_abono}><td className="p-2">{a.fecha_abono}</td><td className="p-2">Q{Number(a.monto).toFixed(2)}</td><td className="p-2">{a.usuario ? `${a.usuario.nombre} ${a.usuario.apellido}` : "—"}</td></tr>)}</tbody></table> : <p className="text-gray-600">Aún no hay abonos registrados.</p>}</section>
    </main></SistemaLayout>;
}