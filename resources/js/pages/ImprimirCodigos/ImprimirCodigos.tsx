import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import CodigoSvg from '@/components/CodigoSvg/CodigoSvg';
import { CodigoBarraItem } from '@/components/Interfaces/interfaceInventario';

const moneda = (v: number) => Number(v).toLocaleString('es-US', { style: 'currency', currency: 'GTQ' });

function leerCookie(nombre: string): string {
    const m = document.cookie.match(new RegExp('(?:^|; )' + nombre + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : '';
}

export default function ImprimirCodigos({ codigos, copias: copiasInicial }: { codigos: CodigoBarraItem[]; copias: number }) {
    const [copias, setCopias] = useState(copiasInicial);

    const imprimir = async () => {
        if (codigos.length === 0) return;
        try {
            await fetch('/codigos-barras/imprimir/registrar', {
                method: 'POST',
                credentials: 'same-origin',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-XSRF-TOKEN': leerCookie('XSRF-TOKEN') },
                body: JSON.stringify({ ids: codigos.map((c) => c.id_codigo) }),
            });
        } finally {
            window.print();
        }
    };

    const etiquetas = codigos.flatMap((c) => Array.from({ length: copias }, (_, i) => ({ c, clave: `${c.id_codigo}-${i}` })));

    return (
        <>
            <Head title="Imprimir códigos de barras" />
            <style>{`
                .etiqueta { break-inside: avoid; }
                @media print {
                    .no-imprimir { display: none !important; }
                    @page { margin: 8mm; }
                    body { background: #fff !important; }
                    .hoja { padding: 0 !important; }
                    .etiqueta { border: 1px dashed #999; }
                }
            `}</style>
            <div className="hoja min-h-screen bg-white p-6">
                <div className="no-imprimir mb-6 flex flex-wrap items-end gap-4">
                    <h1 className="w-full text-2xl font-bold">Imprimir etiquetas</h1>
                    <label className="flex flex-col gap-1 text-sm">
                        Copias por código
                        <input
                            type="number"
                            min={1}
                            max={200}
                            value={copias}
                            onChange={(e) => setCopias(Math.max(1, Math.min(200, Number(e.target.value) || 1)))}
                            className="w-28 rounded border border-gray-300 p-2"
                        />
                    </label>
                    <button onClick={imprimir} disabled={codigos.length === 0} className="cursor-pointer rounded-[8px] bg-[#0B0B0B] px-5 py-2 font-semibold text-white hover:bg-[#282727] disabled:opacity-50">
                        Imprimir
                    </button>
                    <button onClick={() => (window.history.length > 1 ? window.history.back() : router.visit('/codigos-barras'))} className="cursor-pointer rounded-[8px] bg-gray-200 px-5 py-2 hover:bg-gray-300">
                        Volver
                    </button>
                </div>

                {codigos.length === 0 && <p className="no-imprimir text-gray-600">No hay códigos activos para imprimir.</p>}

                <div className="flex flex-wrap gap-3">
                    {etiquetas.map(({ c, clave }) => (
                        <div key={clave} className="etiqueta flex w-[6cm] flex-col items-center gap-1 rounded border border-gray-200 p-2 text-center">
                            <span className="text-[12px] font-semibold leading-tight">{c.producto}</span>
                            <CodigoSvg codigo={c.codigo} tipo={c.tipo_codigo} />
                            <span className="text-[13px] font-bold">{moneda(c.precio_venta)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
