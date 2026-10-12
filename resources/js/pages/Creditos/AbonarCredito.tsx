import SistemaLayout from "@/layouts/SistemaLayout/SistemaLayout";
import FormularioAbonarCredito from "@/components/FormularioAbonarCredito/FormularioAbonarCredito";
import { Head, Link } from "@inertiajs/react";
export default function AbonarCredito({ creditoId, clienteId, saldoMaximo }: { creditoId?: number; clienteId?: number; saldoMaximo: number }) {
    return <SistemaLayout><Head title="Registrar abono" /><main className="mx-auto flex min-h-[75vh] w-full max-w-lg flex-col justify-center gap-5 py-6"><Link href={creditoId ? `/creditos/${creditoId}` : `/clientes/${clienteId}/detalle`} className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold text-blue-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50">← Volver</Link><FormularioAbonarCredito creditoId={creditoId} clienteId={clienteId} saldoMaximo={saldoMaximo} /></main></SistemaLayout>;
}