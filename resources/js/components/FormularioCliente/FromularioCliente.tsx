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
        <form onSubmit={submit} className="flex flex-col gap-4 rounded-lg border border-gray-300 bg-white p-4 shadow-md">
            <h2 className="text-xl font-bold">{cliente ? "Editar cliente" : "Agregar cliente"}</h2>
            <label className="flex flex-col gap-1">Nombre
                <input className="rounded border p-2" value={form.data.nombre_cliente} onChange={e => form.setData("nombre_cliente", e.target.value)} required maxLength={100} />
                {form.errors.nombre_cliente && <span className="text-sm text-red-600">{form.errors.nombre_cliente}</span>}
            </label>
            <label className="flex flex-col gap-1">Apellido
                <input className="rounded border p-2" value={form.data.apellido_cliente} onChange={e => form.setData("apellido_cliente", e.target.value)} required maxLength={100} />
                {form.errors.apellido_cliente && <span className="text-sm text-red-600">{form.errors.apellido_cliente}</span>}
            </label>
            <label className="flex flex-col gap-1">Teléfono
                <input className="rounded border p-2" value={form.data.numero_cliente} onChange={e => form.setData("numero_cliente", e.target.value)} maxLength={20} />
                {form.errors.numero_cliente && <span className="text-sm text-red-600">{form.errors.numero_cliente}</span>}
            </label>
            <div className="flex gap-2">
                <button disabled={form.processing} className="rounded bg-green-600 px-4 py-2 font-bold text-white hover:bg-green-700" type="submit">Guardar</button>
                {onCancel && <button className="rounded bg-gray-500 px-4 py-2 font-bold text-white hover:bg-gray-700" type="button" onClick={onCancel}>Cancelar</button>}
            </div>
        </form>
    );
}