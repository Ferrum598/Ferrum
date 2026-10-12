import SistemaLayout from "@/layouts/SistemaLayout/SistemaLayout";
import FormularioAbonarCredito from "@/components/FormularioAbonarCredito/FormularioAbonarCredito";
import { Head, Link } from "@inertiajs/react";
export default function AbonarCredito({ creditoId, clienteId, saldoMaximo }: { creditoId?: number; clienteId?: number; saldoMaximo: number }) {
    return <SistemaLayout><Head title="Registrar abono" /><main className="mx-auto flex min-h-[75vh] w-full max-w-lg flex-col justify-center gap-4 py-4"><Link href={creditoId ? `/creditos/${creditoId}` : `/clientes/${clienteId}/detalle`} className="text-blue-600 underline">← Volver</Link><FormularioAbonarCredito creditoId={creditoId} clienteId={clienteId} saldoMaximo={saldoMaximo} /></main></SistemaLayout>;
}