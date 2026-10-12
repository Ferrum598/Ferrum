import JsBarcode from 'jsbarcode';
import { useEffect, useRef } from 'react';

const FORMATOS: Record<string, string> = { code128: 'CODE128', ean13: 'EAN13', code39: 'CODE39', qr: 'CODE128' };

// Dibuja el código de barras como SVG (no se guarda ninguna imagen en la BD)
export default function CodigoSvg({ codigo, tipo, altura = 50 }: { codigo: string; tipo: string; altura?: number }) {
    const ref = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!ref.current) return;
        try {
            JsBarcode(ref.current, codigo, { format: FORMATOS[tipo] ?? 'CODE128', height: altura, width: 1.6, fontSize: 12, margin: 0, displayValue: true });
        } catch {
            ref.current.innerHTML = '';
        }
    }, [codigo, tipo, altura]);

    return <svg ref={ref} />;
}
