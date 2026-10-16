import SistemaLayout from "@/layouts/SistemaLayout/SistemaLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { FormEvent, useEffect, useState } from "react";

type Producto = { id_producto: number; nombre: string; precio: number };
type Cliente = { id_cliente: number; nombre_cliente: string; apellido_cliente: string };
type Item = { descripcion: string; cantidad: number; precio_unitario: number };

const money = (v: number) => `Q${Number(v || 0).toLocaleString("es-GT", { minimumFractionDigits: 2 })}`;
const input = "w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30";

export default function CrearCotizacion({ clientes }: { clientes: Cliente[] }) {
    const [busqueda, setBusqueda] = useState("");
    const [resultados, setResultados] = useState<Producto[]>([]);
    const [buscando, setBuscando] = useState(false);

    // Búsqueda con retraso para no consultar en cada tecla
    useEffect(() => {
        const texto = busqueda.trim();
        if (texto.length < 2) { setResultados([]); return; }
        const ctrl = new AbortController();
        const t = setTimeout(async () => {
            setBuscando(true);
            try {
                const res = await fetch(`/cotizaciones/productos?q=${encodeURIComponent(texto)}`, { signal: ctrl.signal, headers: { Accept: "application/json" }, credentials: "same-origin" });
                if (res.ok) setResultados(await res.json());
            } catch { /* búsqueda cancelada */ }
            setBuscando(false);
        }, 300);
        return () => { clearTimeout(t); ctrl.abort(); };
    }, [busqueda]);
    const { data, setData, post, processing, errors } = useForm<{ fk_cliente: string; nombre_cliente: string; valida_hasta: string; notas: string; items: Item[] }>({
        fk_cliente: "", nombre_cliente: "", valida_hasta: "", notas: "", items: [],
    });
    const total = data.items.reduce((s, i) => s + i.cantidad * i.precio_unitario, 0);

    const agregar = (item: Item) => setData("items", [...data.items, item]);
    const agregarProducto = (p: Producto) => {
        const existente = data.items.findIndex((i) => i.descripcion === p.nombre && i.precio_unitario === p.precio);
        if (existente >= 0) cambiar(existente, { cantidad: data.items[existente].cantidad + 1 });
        else agregar({ descripcion: p.nombre, cantidad: 1, precio_unitario: p.precio });
        setBusqueda(""); setResultados([]);
    };
    const cambiar = (idx: number, cambio: Partial<Item>) => setData("items", data.items.map((it, i) => (i === idx ? { ...it, ...cambio } : it)));
    const quitar = (idx: number) => setData("items", data.items.filter((_, i) => i !== idx));
    const submit = (e: FormEvent) => { e.preventDefault(); post("/cotizaciones"); };
    const errorItems = Object.entries(errors).filter(([k]) => k.startsWith("items")).map(([, v]) => v as string);

    return (
        <SistemaLayout>
            <Head title="Nueva cotización" />
            <form onSubmit={submit} className="w-full mx-auto px-2 md:px-6 py-6 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-3xl font-extrabold bg-gradient-to-r from-slate-900 to-blue-700 bg-clip-text text-transparent">Nueva cotización</h1>
                    <Link href="/cotizaciones" className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-600 transition hover:bg-slate-50">← Volver</Link>
                </div>

                <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-md md:p-7">
                    <h2 className="mb-4 text-xl font-extrabold text-slate-900">Datos generales</h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="flex flex-col gap-2"><label className="text-sm font-bold text-slate-700">Cliente registrado</label>
                            <select className={input} value={data.fk_cliente} onChange={(e) => setData("fk_cliente", e.target.value)}>
                                <option value="">— Ninguno —</option>
                                {clientes.map((c) => <option key={c.id_cliente} value={c.id_cliente}>{c.nombre_cliente} {c.apellido_cliente}</option>)}
                            </select></div>
                        <div className="flex flex-col gap-2"><label className="text-sm font-bold text-slate-700">O nombre del cliente</label>
                            <input className={input} placeholder="Ej. Juan Pérez" value={data.nombre_cliente} onChange={(e) => setData("nombre_cliente", e.target.value)} />
                            {errors.nombre_cliente && <span className="text-sm text-red-600">{errors.nombre_cliente}</span>}</div>
                        <div className="flex flex-col gap-2"><label className="text-sm font-bold text-slate-700">Válida hasta <span className="font-normal text-slate-400">(opcional)</span></label>
                            <input type="date" className={input} value={data.valida_hasta} onChange={(e) => setData("valida_hasta", e.target.value)} />
                            {errors.valida_hasta && <span className="text-sm text-red-600">{errors.valida_hasta}</span>}</div>
                        <div className="flex flex-col gap-2"><label className="text-sm font-bold text-slate-700">Notas <span className="font-normal text-slate-400">(opcional)</span></label>
                            <input className={input} value={data.notas} onChange={(e) => setData("notas", e.target.value)} /></div>
                    </div>
                </section>

                <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-md md:p-7">
                    <h2 className="mb-4 text-xl font-extrabold text-slate-900">Productos</h2>
                    <div className="mb-4 flex flex-col gap-3 md:flex-row">
                        <div className="relative flex-1">
                            <input className={input} placeholder="Escribe al menos 2 letras para buscar un producto…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                            {busqueda.trim().length >= 2 && (
                                <ul className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                                    {buscando && <li className="p-3 text-sm text-slate-500">Buscando…</li>}
                                    {!buscando && !resultados.length && <li className="p-3 text-sm text-slate-500">Sin resultados</li>}
                                    {resultados.map((p) => (
                                        <li key={p.id_producto}>
                                            <button type="button" onClick={() => agregarProducto(p)} className="flex w-full items-center justify-between gap-3 p-3 text-left text-sm transition hover:bg-blue-50">
                                                <span className="font-bold text-slate-800">{p.nombre}</span>
                                                <span className="font-extrabold text-slate-600">{money(p.precio)}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <button type="button" onClick={() => agregar({ descripcion: "", cantidad: 1, precio_unitario: 0 })} className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-600 transition hover:bg-slate-50">+ Línea manual</button>
                    </div>
                    <div className="overflow-x-auto rounded-2xl border border-slate-100">
                        <table className="w-full min-w-[640px] text-left text-sm">
                            <thead className="bg-gradient-to-r from-slate-900 to-blue-900 text-xs uppercase tracking-wide text-white">
                                <tr><th className="p-3">Descripción</th><th className="p-3 w-28">Cantidad</th><th className="p-3 w-36">Precio (Q)</th><th className="p-3">Subtotal</th><th className="p-3" /></tr>
                            </thead>
                            <tbody>
                                {data.items.map((it, idx) => (
                                    <tr key={idx} className="border-b border-slate-100">
                                        <td className="p-2"><input className={input} value={it.descripcion} onChange={(e) => cambiar(idx, { descripcion: e.target.value })} /></td>
                                        <td className="p-2"><input type="number" min="1" className={input} value={it.cantidad} onChange={(e) => cambiar(idx, { cantidad: Math.max(1, parseInt(e.target.value) || 1) })} /></td>
                                        <td className="p-2"><input type="number" min="0" step="0.01" className={input} value={it.precio_unitario} onChange={(e) => cambiar(idx, { precio_unitario: parseFloat(e.target.value) || 0 })} /></td>
                                        <td className="p-3 font-extrabold text-slate-900">{money(it.cantidad * it.precio_unitario)}</td>
                                        <td className="p-2"><button type="button" onClick={() => quitar(idx)} className="rounded-lg bg-rose-50 px-3 py-1.5 font-bold text-rose-700 transition hover:bg-rose-100">Quitar</button></td>
                                    </tr>
                                ))}
                                {!data.items.length && <tr><td colSpan={5} className="p-8 text-center text-slate-500">Agrega productos a la cotización</td></tr>}
                            </tbody>
                        </table>
                    </div>
                    {errorItems.map((e, i) => <p key={i} className="mt-2 text-sm text-red-600">{e}</p>)}
                </section>

                <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-teal-600 to-cyan-500 p-6 text-white shadow-xl md:p-8">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div><p className="text-sm font-bold uppercase tracking-[0.14em] text-white/80">Total cotizado</p><p className="mt-2 text-4xl font-black tracking-tight">{money(total)}</p></div>
                        <button disabled={processing} className="rounded-xl bg-white px-6 py-3 font-bold text-emerald-700 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50">{processing ? "Guardando…" : "✨ Guardar cotización"}</button>
                    </div>
                </section>
            </form>
        </SistemaLayout>
    );
}
