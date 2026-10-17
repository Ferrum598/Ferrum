import SistemaLayout from "@/layouts/SistemaLayout/SistemaLayout";
import { Head, router, useForm, usePage } from "@inertiajs/react";
import { FormEvent, useEffect, useState } from "react";
import Swal from "sweetalert2";

type Usuario = { id_usuario: number; nombre: string; apellido: string; usuario: string; fk_rol: number; rol: string | null };
type Rol = { id_rol: number; nombre_rol: string; descripcion_rol: string | null; usuarios_count: number; permisos: string[]; es_admin: boolean };
type Props = { usuarios: Usuario[]; roles: Rol[]; permisos: string[]; flash?: { title: string; icon: "success" | "error"; message: string } | null };

const etiquetas: Record<string, string> = {
    dashboard: "Dashboard", ventas: "Ventas y cotizaciones", comprobantes: "Comprobantes", inventario: "Inventario", categorias: "Categorías",
    codigos_barras: "Códigos de barras", clientes: "Clientes", creditos: "Créditos", reportes: "Reportes", gastos: "Gastos fijos",
};
const etiqueta = (p: string) => etiquetas[p] ?? p;
const input = "w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30";
const btnPrincipal = "rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50";
const btnSecundario = "rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-600 transition hover:bg-slate-50";

function FormUsuario({ roles, editando, onFin }: { roles: Rol[]; editando: Usuario | null; onFin: () => void }) {
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({ nombre: "", apellido: "", usuario: "", password: "", password_confirmation: "", fk_rol: "" });
    useEffect(() => {
        clearErrors();
        if (editando) setData({ nombre: editando.nombre, apellido: editando.apellido, usuario: editando.usuario, password: "", password_confirmation: "", fk_rol: String(editando.fk_rol) });
        else reset();
    }, [editando]);
    const submit = (e: FormEvent) => {
        e.preventDefault();
        const opciones = { preserveScroll: true, onSuccess: () => { reset(); onFin(); } };
        if (editando) put(`/usuarios/${editando.id_usuario}`, opciones); else post("/usuarios", opciones);
    };
    const campo = (k: "nombre" | "apellido" | "usuario" | "password" | "password_confirmation", label: string, type = "text", ph = "") => (
        <div className="flex flex-col gap-2"><label className="text-sm font-bold text-slate-700">{label}</label>
            <input type={type} className={input} placeholder={ph} autoComplete="new-password" value={data[k]} onChange={(e) => setData(k, e.target.value)} />
            {errors[k] && <span className="text-sm text-red-600">{errors[k]}</span>}</div>
    );
    return (
        <form onSubmit={submit} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-md md:p-7">
            <div className="mb-5 flex items-center gap-3"><span className="rounded-2xl bg-blue-50 p-3 text-2xl">{editando ? "✏️" : "➕"}</span>
                <div><h2 className="text-xl font-extrabold text-slate-900">{editando ? "Editar usuario" : "Crear usuario"}</h2><p className="text-sm text-slate-500">El rol define a qué módulos tendrá acceso.</p></div></div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {campo("nombre", "Nombre")}
                {campo("apellido", "Apellido")}
                {campo("usuario", "Usuario (para iniciar sesión)")}
                <div className="flex flex-col gap-2"><label className="text-sm font-bold text-slate-700">Rol</label>
                    <select className={input} value={data.fk_rol} onChange={(e) => setData("fk_rol", e.target.value)}>
                        <option value="">Selecciona un rol…</option>
                        {roles.map((r) => <option key={r.id_rol} value={r.id_rol}>{r.nombre_rol}</option>)}
                    </select>
                    {errors.fk_rol && <span className="text-sm text-red-600">{errors.fk_rol}</span>}</div>
                {campo("password", editando ? "Nueva contraseña (opcional)" : "Contraseña", "password", "Mínimo 6 caracteres")}
                {campo("password_confirmation", "Confirmar contraseña", "password")}
                <div className="flex flex-wrap gap-3 md:col-span-2">
                    <button disabled={processing} className={btnPrincipal}>{processing ? "Guardando…" : editando ? "Guardar cambios" : "✨ Crear usuario"}</button>
                    {editando && <button type="button" className={btnSecundario} onClick={onFin}>Cancelar</button>}
                </div>
            </div>
        </form>
    );
}

function FormRol({ permisos, editando, onFin }: { permisos: string[]; editando: Rol | null; onFin: () => void }) {
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm<{ nombre_rol: string; descripcion_rol: string; permisos: string[] }>({ nombre_rol: "", descripcion_rol: "", permisos: [] });
    useEffect(() => {
        clearErrors();
        if (editando) setData({ nombre_rol: editando.nombre_rol, descripcion_rol: editando.descripcion_rol ?? "", permisos: editando.permisos });
        else reset();
    }, [editando]);
    const alternar = (p: string) => setData("permisos", data.permisos.includes(p) ? data.permisos.filter((x) => x !== p) : [...data.permisos, p]);
    const submit = (e: FormEvent) => {
        e.preventDefault();
        const opciones = { preserveScroll: true, onSuccess: () => { reset(); onFin(); } };
        if (editando) put(`/roles/${editando.id_rol}`, opciones); else post("/roles", opciones);
    };
    return (
        <form onSubmit={submit} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-md md:p-7">
            <div className="mb-5 flex items-center gap-3"><span className="rounded-2xl bg-indigo-50 p-3 text-2xl">{editando ? "✏️" : "🛡️"}</span>
                <div><h2 className="text-xl font-extrabold text-slate-900">{editando ? "Editar rol" : "Crear rol"}</h2><p className="text-sm text-slate-500">Elige los módulos a los que podrá entrar este rol.</p></div></div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2"><label className="text-sm font-bold text-slate-700">Nombre del rol</label>
                    <input className={input} placeholder="Ej. Cajero" value={data.nombre_rol} onChange={(e) => setData("nombre_rol", e.target.value)} />
                    {errors.nombre_rol && <span className="text-sm text-red-600">{errors.nombre_rol}</span>}</div>
                <div className="flex flex-col gap-2"><label className="text-sm font-bold text-slate-700">Descripción <span className="font-normal text-slate-400">(opcional)</span></label>
                    <input className={input} value={data.descripcion_rol} onChange={(e) => setData("descripcion_rol", e.target.value)} /></div>
                <div className="md:col-span-2"><div className="mb-2 flex items-center justify-between"><label className="text-sm font-bold text-slate-700">Permisos</label>
                    <button type="button" className="text-sm font-bold text-blue-700 hover:underline" onClick={() => setData("permisos", data.permisos.length === permisos.length ? [] : [...permisos])}>{data.permisos.length === permisos.length ? "Quitar todos" : "Seleccionar todos"}</button></div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {permisos.map((p) => <label key={p} className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold text-slate-700">
                            <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600" checked={data.permisos.includes(p)} onChange={() => alternar(p)} />{etiqueta(p)}</label>)}
                    </div></div>
                <div className="flex flex-wrap gap-3 md:col-span-2">
                    <button disabled={processing} className={btnPrincipal}>{processing ? "Guardando…" : editando ? "Guardar cambios" : "✨ Crear rol"}</button>
                    {editando && <button type="button" className={btnSecundario} onClick={onFin}>Cancelar</button>}
                </div>
            </div>
        </form>
    );
}

export default function Usuarios({ usuarios, roles, permisos }: Props) {
    const [pestana, setPestana] = useState<"usuarios" | "roles">("usuarios");
    const [usuarioEdit, setUsuarioEdit] = useState<Usuario | null>(null);
    const [rolEdit, setRolEdit] = useState<Rol | null>(null);
    const { flash } = usePage<Props>().props;
    useEffect(() => { if (flash) Swal.fire({ icon: flash.icon, title: flash.title, text: flash.message, timer: 3500, showConfirmButton: false }); }, [flash]);

    const subir = () => window.scrollTo({ top: 0, behavior: "smooth" });
    const confirmar = async (titulo: string, texto: string, url: string) => {
        const r = await Swal.fire({ title: titulo, text: texto, icon: "warning", showCancelButton: true, confirmButtonColor: "#d33", confirmButtonText: "Sí, eliminar", cancelButtonText: "Cancelar" });
        if (r.isConfirmed) router.delete(url, { preserveScroll: true });
    };
    const tab = (id: "usuarios" | "roles", texto: string) => (
        <button onClick={() => setPestana(id)} className={`rounded-xl px-5 py-2.5 font-bold transition ${pestana === id ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md" : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"}`}>{texto}</button>
    );

    return (
        <SistemaLayout>
            <Head title="Usuarios" />
            <div className="mx-auto w-full max-w-[1600px] space-y-7 px-2 py-5 md:px-6">
                <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-900 p-6 text-white shadow-xl md:p-9">
                    <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full bg-violet-500/20 blur-3xl" />
                    <div className="relative flex flex-wrap items-center justify-between gap-4">
                        <div><span className="mb-3 inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-blue-100">Administración</span>
                            <h1 className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-3xl font-black tracking-tight text-transparent md:text-4xl">Usuarios y permisos</h1>
                            <p className="mt-2 text-slate-300">Crea accesos al sistema y define qué puede hacer cada rol.</p></div>
                        <span className="rounded-2xl border border-white/10 bg-white/10 p-4 text-4xl shadow-inner backdrop-blur">👥</span>
                    </div>
                </header>

                <div className="flex gap-3">{tab("usuarios", "👤 Usuarios")}{tab("roles", "🛡️ Roles y permisos")}</div>

                {pestana === "usuarios" ? <>
                    <FormUsuario roles={roles} editando={usuarioEdit} onFin={() => setUsuarioEdit(null)} />
                    <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-md">
                        <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm">
                            <thead className="bg-gradient-to-r from-slate-900 to-blue-900 text-xs uppercase tracking-wide text-white"><tr><th className="p-4">Nombre</th><th className="p-4">Usuario</th><th className="p-4">Rol</th><th className="p-4">Acciones</th></tr></thead>
                            <tbody>{usuarios.map((u) => <tr key={u.id_usuario} className="border-b border-slate-100 transition-colors hover:bg-blue-50/60">
                                <td className="p-4 font-extrabold text-slate-800">{u.nombre} {u.apellido}</td>
                                <td className="p-4 text-slate-600">{u.usuario}</td>
                                <td className="p-4"><span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-800">{u.rol}</span></td>
                                <td className="p-4"><div className="flex gap-2">
                                    <button className="rounded-lg bg-blue-50 px-3 py-1.5 font-bold text-blue-700 transition hover:bg-blue-100" onClick={() => { setUsuarioEdit(u); subir(); }}>Editar</button>
                                    <button className="rounded-lg bg-rose-50 px-3 py-1.5 font-bold text-rose-700 transition hover:bg-rose-100" onClick={() => confirmar("¿Eliminar usuario?", `${u.nombre} ${u.apellido} ya no podrá iniciar sesión.`, `/usuarios/${u.id_usuario}`)}>Eliminar</button>
                                </div></td></tr>)}</tbody>
                        </table></div>
                    </section>
                </> : <>
                    <FormRol permisos={permisos} editando={rolEdit} onFin={() => setRolEdit(null)} />
                    <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-md">
                        <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm">
                            <thead className="bg-gradient-to-r from-slate-900 to-blue-900 text-xs uppercase tracking-wide text-white"><tr><th className="p-4">Rol</th><th className="p-4">Permisos</th><th className="p-4">Usuarios</th><th className="p-4">Acciones</th></tr></thead>
                            <tbody>{roles.map((r) => <tr key={r.id_rol} className="border-b border-slate-100 align-top transition-colors hover:bg-blue-50/60">
                                <td className="p-4"><p className="font-extrabold text-slate-800">{r.nombre_rol}</p><p className="text-xs text-slate-500">{r.descripcion_rol}</p></td>
                                <td className="p-4"><div className="flex flex-wrap gap-1.5">{r.es_admin ? <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">Acceso total</span>
                                    : r.permisos.length ? r.permisos.map((p) => <span key={p} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{etiqueta(p)}</span>) : <span className="text-slate-400">Sin permisos</span>}</div></td>
                                <td className="p-4 font-bold text-slate-700">{r.usuarios_count}</td>
                                <td className="p-4">{r.es_admin ? <span className="text-xs text-slate-400">No editable</span> : <div className="flex gap-2">
                                    <button className="rounded-lg bg-blue-50 px-3 py-1.5 font-bold text-blue-700 transition hover:bg-blue-100" onClick={() => { setRolEdit(r); subir(); }}>Editar</button>
                                    <button className="rounded-lg bg-rose-50 px-3 py-1.5 font-bold text-rose-700 transition hover:bg-rose-100" onClick={() => confirmar("¿Eliminar rol?", "Solo se puede eliminar si ningún usuario lo usa.", `/roles/${r.id_rol}`)}>Eliminar</button>
                                </div>}</td></tr>)}</tbody>
                        </table></div>
                    </section>
                </>}
            </div>
        </SistemaLayout>
    );
}
