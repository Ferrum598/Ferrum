import SistemaLayout from "@/layouts/SistemaLayout/SistemaLayout";
import { Head, Link } from "@inertiajs/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Swal from "sweetalert2";
import { ClienteVenta, ItemCarrito, LoteVenta, ProductoVenta } from "@/components/Interfaces/interfaceCatalogo";

const leerXsrf = () => {
    const m = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/);
    return m ? decodeURIComponent(m[1]) : '';
};

const peticion = async (url: string, opciones: { method?: string; body?: unknown } = {}) => {
    const res = await fetch(url, {
        method: opciones.method ?? 'GET',
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-XSRF-TOKEN': leerXsrf(),
            ...(opciones.body ? { 'Content-Type': 'application/json' } : {}),
        },
        body: opciones.body ? JSON.stringify(opciones.body) : undefined,
    });
    let data: any = null;
    try { data = await res.json(); } catch { /* respuesta sin cuerpo */ }
    return { ok: res.ok, status: res.status, data };
};

const primerError = (data: any): string => {
    if (data?.errors) return Object.values(data.errors).flat()[0] as string;
    return data?.message ?? 'Ocurrió un error inesperado.';
};

const dinero = (n: number) => `Q${n.toFixed(2)}`;
const manana = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function Ventas() {
    const [buscar, setBuscar] = useState('');
    const [productos, setProductos] = useState<ProductoVenta[]>([]);
    const [cargando, setCargando] = useState(false);
    const [pagina, setPagina] = useState(1);
    const [ultimaPagina, setUltimaPagina] = useState(1);
    const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
    const [codigoManual, setCodigoManual] = useState('');

    const [tipoPago, setTipoPago] = useState<'contado' | 'credito'>('contado');
    const [cliente, setCliente] = useState<ClienteVenta | null>(null);
    const [buscarCliente, setBuscarCliente] = useState('');
    const [clientes, setClientes] = useState<ClienteVenta[]>([]);
    const [fechaVencimiento, setFechaVencimiento] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [guardando, setGuardando] = useState(false);
    const [nuevoCliente, setNuevoCliente] = useState<{ abierto: boolean; nombre: string; apellido: string; numero: string }>({ abierto: false, nombre: '', apellido: '', numero: '' });
    const [ultimaVenta, setUltimaVenta] = useState<{ id_comprobante: number; numero_comprobante: string } | null>(null);

    // Búsqueda de productos con lotes
    const cargarProductos = useCallback(async (q: string, p: number) => {
        setCargando(true);
        const r = await peticion(`/ventas/buscar?q=${encodeURIComponent(q)}&page=${p}`);
        if (r.ok) {
            setProductos(r.data.data);
            setUltimaPagina(r.data.last_page);
        }
        setCargando(false);
    }, []);

    useEffect(() => { setPagina(1); }, [buscar]);

    useEffect(() => {
        const t = setTimeout(() => cargarProductos(buscar, pagina), 250);
        return () => clearTimeout(t);
    }, [buscar, pagina, cargarProductos]);

    // Búsqueda de clientes
    useEffect(() => {
        if (cliente || buscarCliente.trim().length < 1) { setClientes([]); return; }
        const t = setTimeout(async () => {
            const r = await peticion(`/clientes/buscar?q=${encodeURIComponent(buscarCliente)}`);
            if (r.ok) setClientes(r.data);
        }, 250);
        return () => clearTimeout(t);
    }, [buscarCliente, cliente]);

    const agregarAlCarrito = useCallback((producto: string, lote: LoteVenta) => {
        setCarrito((actual) => {
            const i = actual.findIndex((it) => it.id_lote === lote.id_lote);
            if (i === -1) {
                return [...actual, {
                    id_lote: lote.id_lote,
                    producto,
                    nombre_lote: lote.nombre_lote,
                    precio_venta: Number(lote.precio_venta),
                    cantidad_disponible: lote.cantidad_disponible,
                    cantidad: 1,
                }];
            }
            if (actual[i].cantidad >= actual[i].cantidad_disponible) {
                Swal.fire({ icon: 'warning', title: 'No hay más existencias en este lote', timer: 1500, showConfirmButton: false });
                return actual;
            }
            return actual.map((it, idx) => idx === i ? { ...it, cantidad: it.cantidad + 1 } : it);
        });
    }, []);

    const escanear = useCallback(async (codigo: string) => {
        const r = await peticion(`/ventas/codigo/${encodeURIComponent(codigo)}`);
        if (r.ok && r.data?.found) {
            agregarAlCarrito(r.data.producto, r.data.lote);
            Swal.fire({ icon: 'success', title: `${r.data.producto} (${r.data.lote.nombre_lote}) agregado`, timer: 1200, showConfirmButton: false, timerProgressBar: true });
        } else {
            Swal.fire({ icon: 'warning', title: `No se encontró un lote disponible con el código: ${codigo}`, timer: 2000, showConfirmButton: false, timerProgressBar: true });
        }
    }, [agregarAlCarrito]);

    // Lector de códigos tipo teclado: caracteres muy rápidos terminados en Enter
    const buffer = useRef('');
    const ultimaTecla = useRef(0);
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const el = e.target as HTMLElement;
            if (el?.dataset?.codigo === 'manual') return;
            const ahora = Date.now();
            if (ahora - ultimaTecla.current > 80) buffer.current = '';
            ultimaTecla.current = ahora;
            if (e.key === 'Enter') {
                const codigo = buffer.current.trim();
                buffer.current = '';
                if (codigo.length >= 3) {
                    e.preventDefault();
                    if (el?.tagName === 'INPUT') setBuscar('');
                    escanear(codigo);
                }
                return;
            }
            if (e.key.length === 1) buffer.current += e.key;
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [escanear]);

    const cambiarCantidad = (id: number, valor: number) => {
        setCarrito((actual) => actual.map((it) => {
            if (it.id_lote !== id) return it;
            const cant = Math.max(1, Math.min(it.cantidad_disponible, Math.floor(valor) || 1));
            return { ...it, cantidad: cant };
        }));
    };

    const total = useMemo(() => carrito.reduce((s, it) => s + it.precio_venta * it.cantidad, 0), [carrito]);

    const crearCliente = async () => {
        const r = await peticion('/clientes/rapido', {
            method: 'POST',
            body: { nombre_cliente: nuevoCliente.nombre, apellido_cliente: nuevoCliente.apellido, numero_cliente: nuevoCliente.numero || null },
        });
        if (r.ok) {
            setCliente(r.data);
            setNuevoCliente({ abierto: false, nombre: '', apellido: '', numero: '' });
        } else {
            Swal.fire({ icon: 'error', title: 'No se pudo crear el cliente', text: primerError(r.data) });
        }
    };

    const confirmarVenta = async () => {
        if (carrito.length === 0) {
            Swal.fire({ icon: 'warning', title: 'Agregue productos a la venta' });
            return;
        }
        if (tipoPago === 'credito') {
            if (!cliente) { Swal.fire({ icon: 'warning', title: 'Seleccione un cliente para una venta a crédito' }); return; }
            if (!fechaVencimiento || fechaVencimiento < manana()) { Swal.fire({ icon: 'warning', title: 'Seleccione una fecha de vencimiento posterior a hoy' }); return; }
        }
        setGuardando(true);
        const r = await peticion('/ventas', {
            method: 'POST',
            body: {
                items: carrito.map((it) => ({ id_lote: it.id_lote, cantidad: it.cantidad })),
                fk_cliente: cliente?.id_cliente ?? null,
                tipo_pago: tipoPago,
                fecha_vencimiento: tipoPago === 'credito' ? fechaVencimiento : null,
                descripcion: tipoPago === 'credito' ? descripcion || null : null,
            },
        });
        setGuardando(false);
        if (r.ok) {
            setUltimaVenta({ id_comprobante: r.data.id_comprobante, numero_comprobante: r.data.numero_comprobante });
            setCarrito([]);
            setCliente(null);
            setBuscarCliente('');
            setTipoPago('contado');
            setFechaVencimiento('');
            setDescripcion('');
            cargarProductos(buscar, pagina);
            Swal.fire({ title: 'Venta registrada', text: `Comprobante ${r.data.numero_comprobante}`, icon: 'success', timer: 1500, showConfirmButton: false });
        } else {
            Swal.fire({ icon: 'error', title: 'No se pudo registrar la venta', text: primerError(r.data) });
        }
    };

    return (
        <SistemaLayout>
            <Head title="Punto de venta" />
            <div className="w-full mx-auto px-2 md:px-6 py-6 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <h1 className="text-3xl font-extrabold bg-gradient-to-r from-slate-900 to-blue-700 bg-clip-text text-transparent">Punto de venta</h1>
                    <Link href="/ventas/historial" className="text-blue-600 hover:underline">Ver historial de ventas</Link>
                </div>

                {ultimaVenta && (
                    <div className="rounded border border-green-300 bg-green-50 p-3 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-green-800">Venta registrada. Comprobante <b>{ultimaVenta.numero_comprobante}</b></span>
                        <div className="flex gap-2">
                            <Link href={`/comprobantes/${ultimaVenta.id_comprobante}`} className="rounded bg-green-600 text-white px-3 py-1 hover:bg-green-700">Ver / imprimir comprobante</Link>
                            <button onClick={() => setUltimaVenta(null)} className="rounded border px-3 py-1 text-gray-600 hover:bg-gray-100">Cerrar</button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <section className="lg:col-span-2 space-y-4">
                        <div className="flex flex-col md:flex-row gap-3 bg-white shadow-md border border-slate-100 p-3 rounded-2xl">
                            <input
                                type="text"
                                placeholder="🔍 Buscar producto por nombre..."
                                value={buscar}
                                onChange={(e) => setBuscar(e.target.value)}
                                className="w-full md:w-2/3 rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                            />
                            <input
                                type="text"
                                data-codigo="manual"
                                placeholder="Código de barras + Enter"
                                value={codigoManual}
                                onChange={(e) => setCodigoManual(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && codigoManual.trim()) {
                                        escanear(codigoManual.trim());
                                        setCodigoManual('');
                                    }
                                }}
                                className="w-full md:w-1/3 rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                            />
                        </div>

                        {cargando && productos.length === 0 && <p className="text-gray-500">Buscando...</p>}
                        {!cargando && productos.length === 0 && (
                            <p className="text-center text-gray-500 text-xl py-6">No se encontraron productos con existencias.</p>
                        )}
                        <div className={`grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-5 transition-opacity ${cargando ? 'opacity-60' : ''}`}>
                            {productos.map((p) => (
                                <div key={p.id_producto} className="group bg-white rounded-2xl shadow-md hover:shadow-xl border border-slate-100 overflow-hidden transition-all duration-200 hover:-translate-y-1 flex flex-col">
                                    <div className="relative h-44 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                                        <img
                                            src={p.imagen ?? '/assets/productos/no-hay-imagen.jpg'}
                                            alt={p.nombre_producto}
                                            loading="lazy"
                                            decoding="async"
                                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/assets/productos/no-hay-imagen.jpg'; }}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        {p.categoria && (
                                            <span className="absolute top-2 left-2 rounded-full bg-slate-900/80 text-white text-xs font-medium px-3 py-1 backdrop-blur">{p.categoria}</span>
                                        )}
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col">
                                        <h2 className="font-bold text-lg text-slate-900 mb-3 leading-tight">{p.nombre_producto}</h2>
                                        <ul className="space-y-2 mt-auto">
                                            {p.lotes.map((l) => (
                                                <li key={l.id_lote} className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 border border-slate-200 p-2 pl-3">
                                                    <div className="text-sm">
                                                        <div className="font-extrabold text-blue-700 text-base">{dinero(Number(l.precio_venta))}</div>
                                                        <div className="text-slate-500 text-xs">{l.nombre_lote} · {l.cantidad_disponible} disp.{l.fecha_ingreso ? ` · ${l.fecha_ingreso}` : ''}</div>
                                                    </div>
                                                    <button
                                                        onClick={() => agregarAlCarrito(p.nombre_producto, l)}
                                                        className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-2 text-sm font-semibold shadow hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition"
                                                    >
                                                        + Agregar
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {ultimaPagina > 1 && (
                            <div className="flex items-center justify-center gap-3 pt-2">
                                <button
                                    disabled={pagina <= 1 || cargando}
                                    onClick={() => setPagina((p) => p - 1)}
                                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 shadow-sm hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    ← Anterior
                                </button>
                                <span className="text-slate-600 font-medium">Página {pagina} de {ultimaPagina}</span>
                                <button
                                    disabled={pagina >= ultimaPagina || cargando}
                                    onClick={() => setPagina((p) => p + 1)}
                                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 shadow-sm hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    Siguiente →
                                </button>
                            </div>
                        )}
                    </section>

                    <aside className="bg-white rounded-2xl shadow-lg border border-slate-100 p-5 space-y-4 h-fit lg:sticky lg:top-4">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center justify-between">
                            Carrito
                            {carrito.length > 0 && <span className="text-xs font-semibold bg-blue-100 text-blue-700 rounded-full px-2 py-1">{carrito.length} ítem(s)</span>}
                        </h2>
                        {carrito.length === 0 ? (
                            <p className="text-gray-500">Aún no hay productos.</p>
                        ) : (
                            <ul className="divide-y">
                                {carrito.map((it) => (
                                    <li key={it.id_lote} className="py-2 space-y-1">
                                        <div className="flex justify-between gap-2">
                                            <span className="font-semibold">{it.producto} <span className="text-gray-500 font-normal">({it.nombre_lote})</span></span>
                                            <button onClick={() => setCarrito((c) => c.filter((x) => x.id_lote !== it.id_lote))} className="text-red-600 hover:underline text-sm">Quitar</button>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => cambiarCantidad(it.id_lote, it.cantidad - 1)} className="w-7 h-7 rounded border hover:bg-gray-100">-</button>
                                                <input
                                                    type="number"
                                                    min={1}
                                                    max={it.cantidad_disponible}
                                                    value={it.cantidad}
                                                    onChange={(e) => cambiarCantidad(it.id_lote, Number(e.target.value))}
                                                    className="w-16 rounded border p-1 text-center"
                                                />
                                                <button onClick={() => cambiarCantidad(it.id_lote, it.cantidad + 1)} className="w-7 h-7 rounded border hover:bg-gray-100">+</button>
                                                <span className="text-gray-500 ml-1">x {dinero(it.precio_venta)}</span>
                                            </div>
                                            <b>{dinero(it.precio_venta * it.cantidad)}</b>
                                        </div>
                                        <div className="text-xs text-gray-400">Máx. {it.cantidad_disponible}</div>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <div className="flex justify-between text-xl font-bold border-t pt-2">
                            <span>Total</span><span>{dinero(total)}</span>
                        </div>

                        <div>
                            <span className="text-gray-600">Tipo de pago</span>
                            <div className="flex gap-2 mt-1">
                                {(['contado', 'credito'] as const).map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setTipoPago(t)}
                                        className={`flex-1 rounded border p-2 font-medium ${tipoPago === t ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 hover:bg-blue-50'}`}
                                    >
                                        {t === 'contado' ? 'Contado' : 'Crédito'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <span className="text-gray-600">Cliente {tipoPago === 'credito' ? '(obligatorio)' : '(opcional)'}</span>
                            {cliente ? (
                                <div className="flex items-center justify-between rounded border p-2 bg-gray-50">
                                    <span>{cliente.nombre_cliente} {cliente.apellido_cliente}</span>
                                    <button onClick={() => setCliente(null)} className="text-red-600 text-sm hover:underline">Cambiar</button>
                                </div>
                            ) : (
                                <>
                                    <input
                                        type="text"
                                        placeholder="Buscar cliente..."
                                        value={buscarCliente}
                                        onChange={(e) => setBuscarCliente(e.target.value)}
                                        className="w-full rounded border p-2"
                                    />
                                    {clientes.length > 0 && (
                                        <ul className="border rounded max-h-40 overflow-y-auto divide-y">
                                            {clientes.map((c) => (
                                                <li key={c.id_cliente}>
                                                    <button onClick={() => { setCliente(c); setClientes([]); }} className="w-full text-left p-2 hover:bg-blue-50">
                                                        {c.nombre_cliente} {c.apellido_cliente}
                                                        {c.numero_cliente ? <span className="text-gray-500"> · {c.numero_cliente}</span> : null}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    <button onClick={() => setNuevoCliente((n) => ({ ...n, abierto: !n.abierto }))} className="text-blue-600 text-sm hover:underline">
                                        + Crear cliente rápido
                                    </button>
                                    {nuevoCliente.abierto && (
                                        <div className="space-y-2 border rounded p-2">
                                            <input placeholder="Nombre" value={nuevoCliente.nombre} onChange={(e) => setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })} className="w-full rounded border p-2" />
                                            <input placeholder="Apellido" value={nuevoCliente.apellido} onChange={(e) => setNuevoCliente({ ...nuevoCliente, apellido: e.target.value })} className="w-full rounded border p-2" />
                                            <input placeholder="Teléfono (opcional)" value={nuevoCliente.numero} onChange={(e) => setNuevoCliente({ ...nuevoCliente, numero: e.target.value })} className="w-full rounded border p-2" />
                                            <button onClick={crearCliente} className="w-full rounded bg-green-600 text-white p-2 hover:bg-green-700">Guardar cliente</button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {tipoPago === 'credito' && (
                            <div className="space-y-2">
                                <label className="block text-gray-600">Fecha de vencimiento</label>
                                <input
                                    type="date"
                                    min={manana()}
                                    value={fechaVencimiento}
                                    onChange={(e) => setFechaVencimiento(e.target.value)}
                                    className="w-full rounded border p-2"
                                />
                                <label className="block text-gray-600">Descripción (opcional)</label>
                                <textarea
                                    value={descripcion}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                    maxLength={255}
                                    rows={2}
                                    className="w-full rounded border p-2"
                                />
                            </div>
                        )}

                        <button
                            onClick={confirmarVenta}
                            disabled={guardando || carrito.length === 0}
                            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 font-semibold shadow-lg hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {guardando ? 'Guardando...' : 'Confirmar venta'}
                        </button>
                    </aside>
                </div>
            </div>
        </SistemaLayout>
    );
}
