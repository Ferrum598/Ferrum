import React from "react";

interface ProductoProforma {
    producto: {
        producto: string;
        producto_plural?: string;
        precio: number;
    };
    cantidad: number;
    total: number;
}

interface Proforma {
    id_proforma: number;
    usuario?: {
        nombre: string;
        direccion?: string;
        nit?: string;
        telefono?: string;
    };
    fecha_creacion: string;
    fecha_proforma?: string;
    pedido: {
        total: number;
        estado: string;
        productos: ProductoProforma[];
    };
}

interface ProformaCardProps {
    proforma: Proforma;
    onVerDetalles: () => void;
}

const ProformaCard: React.FC<ProformaCardProps> = ({ proforma, onVerDetalles }) => {
    return (
        <div className="group bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl hover:border-emerald-200 transition-all duration-200 flex flex-col min-h-[340px] min-w-0 w-full p-4">
            <div className="flex items-center justify-between px-5 pt-5 pb-2">
                <div>
                    <div className="text-xs text-gray-400 font-medium tracking-wide mb-1">No. PROFORMA</div>
                    <div className="text-lg font-bold text-gray-800">#{proforma.id_proforma}</div>
                </div>
                <button
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold shadow-sm transition-all"
                    onClick={onVerDetalles}
                >
                    Ver Detalles
                </button>
            </div>
            <div className="px-5 pb-2">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-gray-500 text-xs">Cliente:</span>
                    <span className="font-medium text-gray-700 break-words max-w-full text-base">{proforma.usuario?.nombre || '-'}</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-gray-500 text-xs">Fecha:</span>
                    <span className="text-xs text-gray-700">{proforma.fecha_proforma || proforma.fecha_creacion}</span>
                </div>
            </div>
            <div className="px-5 pb-4 flex-1 flex flex-col">
                <div className="font-semibold text-gray-700 mb-2 text-sm">Productos</div>
                <ul className="space-y-1 flex-1 text-xs">
                    {proforma.pedido.productos.slice(0, 3).map((pp, idx) => {
                        const nombre = pp.cantidad > 1
                            ? (pp.producto?.producto_plural ?? pp.producto?.producto ?? '-')
                            : (pp.producto?.producto ?? '-');
                        return (
                            <li key={idx} className="flex justify-between items-center">
                                <span className="truncate">{pp.cantidad ?? '-'} x {nombre}</span>
                                <span className="text-gray-600 font-medium">Q{(Number(pp.total) ?? 0).toFixed(2)}</span>
                            </li>
                        );
                    })}
                    {proforma.pedido.productos.length > 3 && (
                        <li className="text-gray-400 italic">...y más productos</li>
                    )}
                </ul>
                <div className="mt-4 text-right font-bold text-emerald-600 text-base">
                    Total: Q{(Number(proforma.pedido.total) ?? 0).toFixed(2)}
                </div>
            </div>
        </div>
    );
};

export default ProformaCard;
