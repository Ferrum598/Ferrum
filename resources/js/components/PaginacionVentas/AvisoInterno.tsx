export const AVISO_INTERNO = 'COMPROBANTE DE VENTA INTERNO — NO ES UN DOCUMENTO FISCAL. No es factura ni sustituye una factura (SAT).';

export function AvisoInterno({ className = '' }: { className?: string }) {
    return (
        <div className={`flex items-start gap-3 rounded-xl border-2 border-amber-400 bg-amber-50 px-4 py-3 text-amber-900 ${className}`}>
            <span className="text-2xl leading-none" aria-hidden>⚠️</span>
            <p className="text-sm font-bold uppercase tracking-wide">{AVISO_INTERNO}</p>
        </div>
    );
}

export function BadgeTipoPago({ tipo }: { tipo: 'contado' | 'credito' }) {
    return tipo === 'credito' ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 px-3 py-1 text-xs font-semibold">🕒 Crédito</span>
    ) : (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-semibold">💵 Contado</span>
    );
}
