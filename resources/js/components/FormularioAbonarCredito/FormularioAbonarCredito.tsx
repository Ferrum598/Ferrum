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
        <form onSubmit={submit} className="group flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-md transition-shadow hover:shadow-xl sm:p-6">
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900"><span className="rounded-xl bg-blue-100 p-2 text-blue-700">💳</span>Registrar abono</h2>
            {saldoMaximo !== undefined && <p className="rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 text-sm font-medium text-slate-700">Saldo disponible: Q{saldoMaximo.toFixed(2)}</p>}
            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">Monto
                <input className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20" type="number" min="0.01" step="0.01" max={saldoMaximo} value={form.data.monto} onChange={e => form.setData("monto", e.target.value)} required />
                {form.errors.monto && <span className="text-sm font-medium text-red-600">{form.errors.monto}</span>}
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">Fecha del abono
                <input className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20" type="date" value={form.data.fecha_abono} onChange={e => form.setData("fecha_abono", e.target.value)} />
                {form.errors.fecha_abono && <span className="text-sm font-medium text-red-600">{form.errors.fecha_abono}</span>}
            </label>
            <div className="flex flex-wrap gap-2 pt-1">
                <button disabled={form.processing} className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60" type="submit">Guardar abono</button>
                {onCancel && <button className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 font-bold text-slate-700 transition hover:bg-slate-100" type="button" onClick={onCancel}>Cancelar</button>}
            </div>
        </form>
    );
}