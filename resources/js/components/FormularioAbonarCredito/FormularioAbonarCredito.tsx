import { useForm } from "@inertiajs/react";

interface Props {
    creditoId?: number;
    clienteId?: number;
    saldoMaximo?: number;
    onCancel?: () => void;
}

export default function FormularioAbonarCredito({ creditoId, clienteId, saldoMaximo, onCancel }: Props) {
    const form = useForm({ monto: "", fecha_abono: new Date().toISOString().slice(0, 10) });
    const action = creditoId ? `/creditos/${creditoId}/abonos` : `/clientes/${clienteId}/abonar`;
    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        form.post(action);
    };

    return (
        <form onSubmit={submit} className="flex flex-col gap-3 rounded border p-4">
            <h2 className="text-lg font-bold">Registrar abono</h2>
            {saldoMaximo !== undefined && <p className="text-sm text-gray-700">Saldo disponible: Q{saldoMaximo.toFixed(2)}</p>}
            <label className="flex flex-col gap-1">Monto
                <input className="rounded border p-2" type="number" min="0.01" step="0.01" max={saldoMaximo} value={form.data.monto} onChange={e => form.setData("monto", e.target.value)} required />
                {form.errors.monto && <span className="text-sm text-red-600">{form.errors.monto}</span>}
            </label>
            <label className="flex flex-col gap-1">Fecha del abono
                <input className="rounded border p-2" type="date" value={form.data.fecha_abono} onChange={e => form.setData("fecha_abono", e.target.value)} />
                {form.errors.fecha_abono && <span className="text-sm text-red-600">{form.errors.fecha_abono}</span>}
            </label>
            <div className="flex gap-2">
                <button disabled={form.processing} className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700" type="submit">Guardar abono</button>
                {onCancel && <button className="rounded bg-gray-500 px-4 py-2 font-bold text-white" type="button" onClick={onCancel}>Cancelar</button>}
            </div>
        </form>
    );
}