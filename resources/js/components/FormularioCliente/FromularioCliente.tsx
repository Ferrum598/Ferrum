import { useForm } from "@inertiajs/react";
import type { Cliente } from "../Interfaces/interfaceCliente";

interface Props {
    cliente?: Cliente | null;
    onCancel?: () => void;
}

export default function FormularioCliente({ cliente, onCancel }: Props) {
    const form = useForm({
        nombre_cliente: cliente?.nombre_cliente ?? "",
        apellido_cliente: cliente?.apellido_cliente ?? "",
        numero_cliente: cliente?.numero_cliente ?? "",
    });

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        if (cliente) {
            form.patch(`/clientes/${cliente.id_cliente}`, { onSuccess: () => onCancel?.() });
        } else {
            form.post("/clientes", { onSuccess: () => onCancel?.() });
        }
    };

    return (
        <form onSubmit={submit} className="flex flex-col gap-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-md transition-shadow hover:shadow-xl sm:p-6">
            <h2 className="text-xl font-extrabold text-transparent bg-gradient-to-r from-slate-900 to-blue-700 bg-clip-text">{cliente ? "Editar cliente" : "Agregar cliente"}</h2>
            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">Nombre
                <input className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20" value={form.data.nombre_cliente} onChange={e => form.setData("nombre_cliente", e.target.value)} required maxLength={100} />
                {form.errors.nombre_cliente && <span className="text-sm font-medium text-red-600">{form.errors.nombre_cliente}</span>}
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">Apellido
                <input className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20" value={form.data.apellido_cliente} onChange={e => form.setData("apellido_cliente", e.target.value)} required maxLength={100} />
                {form.errors.apellido_cliente && <span className="text-sm font-medium text-red-600">{form.errors.apellido_cliente}</span>}
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">Teléfono
                <input className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20" value={form.data.numero_cliente} onChange={e => form.setData("numero_cliente", e.target.value)} maxLength={20} />
                {form.errors.numero_cliente && <span className="text-sm font-medium text-red-600">{form.errors.numero_cliente}</span>}
            </label>
            <div className="flex flex-wrap gap-2 pt-1">
                <button disabled={form.processing} className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60" type="submit">Guardar</button>
                {onCancel && <button className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 font-bold text-slate-700 transition hover:bg-slate-100" type="button" onClick={onCancel}>Cancelar</button>}
            </div>
        </form>
    );
}