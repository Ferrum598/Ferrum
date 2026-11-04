import { DescuentoRegla, LoteVenta, ProductoVenta } from '@/components/Interfaces/interfaceCatalogo';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

interface VentaPorMedidaProps {
    onBuscar: (q: string) => Promise<ProductoVenta[]>;
    onAgregar: (producto: string, lote: LoteVenta, id_producto: number, descuentos: DescuentoRegla[], cantidad: number, fraccionado: boolean) => boolean;
}

const dinero = (n: number) => `Q${n.toFixed(2)}`;
const redondear = (n: number) => Math.round(n * 100) / 100;
const CANTIDADES_RAPIDAS = [0.5, 1, 1.5, 2];
const campo = 'w-full rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition';

export default function VentaPorMedida({ onBuscar, onAgregar }: VentaPorMedidaProps) {
    const [abierto, setAbierto] = useState(false);
    const [texto, setTexto] = useState('');
    const [resultados, setResultados] = useState<ProductoVenta[]>([]);
    const [buscando, setBuscando] = useState(false);
    const [errorBusqueda, setErrorBusqueda] = useState('');
    const [producto, setProducto] = useState<ProductoVenta | null>(null);
    const [idLote, setIdLote] = useState<number | null>(null);
    const [cantidad, setCantidad] = useState('1');

    useEffect(() => {
        if (!abierto || producto) return;
        if (texto.trim() === '') {
            setResultados([]);
            setErrorBusqueda('');
            return;
        }
        let vigente = true;
        const t = setTimeout(async () => {
            setBuscando(true);
            setErrorBusqueda('');
            try {
                const lista = await onBuscar(texto.trim());
                if (vigente) setResultados(lista);
            } catch (error) {
                if (vigente) {
                    setResultados([]);
                    setErrorBusqueda(error instanceof Error ? error.message : 'No se pudo buscar el producto.');
                }
            } finally {
                if (vigente) setBuscando(false);
            }
        }, 250);
        return () => {
            vigente = false;
            clearTimeout(t);
        };
    }, [texto, abierto, producto, onBuscar]);

    const lote = producto?.lotes.find((l) => l.id_lote === idLote) ?? null;
    const numero = Number(cantidad);
    const cantidadValida = cantidad !== '' && !Number.isNaN(numero) && numero > 0;
    const subtotal = lote && cantidadValida ? redondear(Number(lote.precio_venta) * numero) : 0;

    const elegir = (p: ProductoVenta) => {
        setProducto(p);
        setIdLote(p.lotes[0]?.id_lote ?? null);
        setCantidad('1');
    };

    const cancelar = () => {
        setProducto(null);
        setIdLote(null);
        setCantidad('1');
    };

    const escribirCantidad = (valor: string) => {
        if (/^\d*\.?\d{0,2}$/.test(valor)) setCantidad(valor);
    };

    const agregar = () => {
        if (!producto || !lote) return;
        if (!cantidadValida) {
            Swal.fire({ icon: 'warning', title: 'Ingrese una cantidad mayor a 0' });
            return;
        }
        if (numero > lote.cantidad_disponible) {
            Swal.fire({ icon: 'warning', title: `Solo hay ${lote.cantidad_disponible} disponibles en este lote` });
            return;
        }
        if (!onAgregar(producto.nombre_producto, lote, producto.id_producto, producto.descuentos ?? [], numero, true)) return;
        Swal.fire({ icon: 'success', title: `${numero} de ${producto.nombre_producto} agregado`, timer: 1200, showConfirmButton: false, timerProgressBar: true });
        cancelar();
        setTexto('');
        setResultados([]);
    };

    return (
        <div className="rounded-2xl border border-slate-100 bg-white shadow-md">
            <button
                type="button"
                onClick={() => setAbierto((a) => !a)}
                className="flex w-full items-center justify-between gap-2 rounded-2xl p-4 text-left font-bold text-slate-900 transition hover:bg-slate-50"
            >
                <span>📏 Venta por medida <span className="text-sm font-normal text-slate-500">(arena, piedrín y otros productos que se venden por partes)</span></span>
                <span className="text-slate-400">{abierto ? '▲' : '▼'}</span>
            </button>

            {abierto && (
                <div className="space-y-3 border-t border-slate-100 p-4">
                    {!producto ? (
                        <>
                            <input
                                type="text"
                                data-codigo="manual"
                                placeholder="🔍 Buscar producto por nombre o descripción..."
                                value={texto}
                                onChange={(e) => setTexto(e.target.value)}
                                className={campo}
                            />
                            {buscando && <p className="text-sm text-gray-500">Buscando...</p>}
                            {errorBusqueda && <p role="alert" className="text-sm text-red-600">{errorBusqueda}</p>}
                            {!buscando && !errorBusqueda && texto.trim() !== '' && resultados.length === 0 && <p className="text-sm text-gray-500">No se encontraron productos con existencias.</p>}
                            {resultados.length > 0 && (
                                <ul className="max-h-64 space-y-2 overflow-y-auto pr-1">
                                    {resultados.map((p) => (
                                        <li key={p.id_producto}>
                                            <button
                                                type="button"
                                                onClick={() => elegir(p)}
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:bg-blue-50"
                                            >
                                                <div className="font-bold text-slate-900">{p.nombre_producto}</div>
                                                {p.descripcion && <div className="text-sm text-slate-600">{p.descripcion}</div>}
                                                {p.categoria && <div className="text-xs text-slate-500">{p.categoria}</div>}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <div className="text-lg font-bold leading-tight text-slate-900">{producto.nombre_producto}</div>
                                    {producto.descripcion && <div className="mt-1 text-sm text-slate-600">{producto.descripcion}</div>}
                                </div>
                                <button type="button" onClick={cancelar} className="text-sm text-red-600 hover:underline">Cambiar producto</button>
                            </div>

                            <ul className="space-y-2">
                                {producto.lotes.map((l) => (
                                    <li key={l.id_lote}>
                                        <label
                                            className={`flex cursor-pointer items-center justify-between gap-2 rounded-xl border p-2 pl-3 transition ${idLote === l.id_lote ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:bg-blue-50'}`}
                                        >
                                            <span className="flex items-center gap-2">
                                                <input type="radio" name="lote-medida" checked={idLote === l.id_lote} onChange={() => setIdLote(l.id_lote)} className="accent-blue-600" />
                                                <span className="text-base font-extrabold text-blue-700">{dinero(Number(l.precio_venta))}</span>
                                                <span className="text-xs text-slate-500">por unidad</span>
                                            </span>
                                            <span className="text-xs text-slate-500">{l.cantidad_disponible} disponibles</span>
                                        </label>
                                    </li>
                                ))}
                            </ul>

                            <div className="space-y-2">
                                <span className="text-gray-600">Cantidad a vender</span>
                                <div className="flex flex-wrap gap-2">
                                    {CANTIDADES_RAPIDAS.map((c) => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => setCantidad(String(c))}
                                            className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition ${numero === c ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-300 bg-white text-slate-700 hover:bg-blue-50'}`}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    data-codigo="manual"
                                    value={cantidad}
                                    onFocus={(e) => e.target.select()}
                                    onChange={(e) => escribirCantidad(e.target.value)}
                                    placeholder="Ej. 0.5, 1.5, 2.25"
                                    className={campo}
                                />
                                <p className="text-xs text-slate-500">Puede usar decimales (hasta 2), por ejemplo 0.5 para medio o 1.5 para uno y medio.</p>
                            </div>

                            <div className="flex items-center justify-between border-t pt-3 text-lg font-bold">
                                <span>Subtotal</span>
                                <span>{dinero(subtotal)}</span>
                            </div>

                            <button
                                type="button"
                                onClick={agregar}
                                disabled={!lote || !cantidadValida}
                                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-3 font-semibold text-white shadow-lg transition hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                + Agregar al carrito
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
