export const AVISO_INTERNO = 'Comprobante de venta interno — no es un documento fiscal. No es factura ni sustituye una factura (SAT).';

export function AvisoInterno({ className = '' }: { className?: string }) {
    return (
        <div className={`rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-600 ${className}`}>
            <p className="text-[11px] leading-relaxed">{AVISO_INTERNO}</p>
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
