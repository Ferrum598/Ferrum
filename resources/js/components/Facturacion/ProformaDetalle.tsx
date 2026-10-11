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

interface ProformaDetalleProps {
    proforma: Proforma;
    onClose: () => void;
}

const ProformaDetalle: React.FC<ProformaDetalleProps> = ({ proforma, onClose }) => {
    const { usuario, fecha_creacion, fecha_proforma, pedido } = proforma;
    if (!pedido || !pedido.productos) return null;
    const anioActual = new Date().getFullYear();
        return (
            <div className="font-sans min-h-screen flex flex-col items-center justify-start relative overflow-x-hidden print:bg-white print:min-h-0 print:p-0">
                {/* Fondo patrón decorativo solo en el fondo de la página */}
                <div
                    aria-hidden="true"
                    className="fixed inset-0 w-full h-full z-0 pointer-events-none print:hidden"
                    style={{
                        background: `url('data:image/svg+xml;utf8,<svg width="100%25" height="100%25" viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="%2360a5fa" fill-opacity="0.18" d="M0,160L60,154.7C120,149,240,139,360,154.7C480,171,600,213,720,229.3C840,245,960,235,1080,208C1200,181,1320,139,1380,117.3L1440,96L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"></path></svg>')`,
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: 'cover',
                        opacity: 0.32,
                    }}
                />
            <div className="w-full flex justify-start print:hidden">
                <button
                    onClick={onClose}
                    className="flex items-center gap-2 mt-4 mb-4 px-5 py-2 bg-white border border-emerald-400 text-emerald-600 font-semibold rounded-lg shadow-sm hover:bg-emerald-50 hover:border-emerald-500 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-300 ml-4"
                >
                    <span className="text-lg">←</span>
                    <span>Regresar a Facturación</span>
                </button>
            </div>
                <div className="w-full max-w-2xl bg-white p-4 shadow-lg rounded-lg print:shadow-none print:max-w-full print:p-0 print:rounded-none relative z-10">
                {/* Header */}
                <div className="flex flex-row items-start gap-4 mb-2">
                    <img
                        src="/images/Logotipo.jpg"
                        alt="Libreria Shaddai"
                        className="w-24 h-auto object-contain print:w-32 print:h-auto print:ml-0"
                        style={{ marginTop: 0, transform: 'none', rotate: '90deg' }}
                    />
                    <div className="flex-1">
                        <h1 className="text-lg font-bold leading-tight">
                            LIBRERÍA Y VARIEDADES<br />
                            <span className="font-extrabold">SHADDAI</span>
                        </h1>
                        <small className="block mt-1 text-gray-600">
                            2a. Calle 3a. Avenida Av. 1-70 Zona 4, Santa Apolonia, Chimaltenango
                        </small>
                        <small className="block text-gray-600">
                            Alexander Francisco Cutzal Aju · NIT: 8539510-2 · cel: 4094 6558
                        </small>
                    </div>
                    <div className="text-right min-w-[120px]">
                        <div className="text-base font-bold">PROFORMA</div>
                        <div className="text-red-600 font-bold text-lg">No.{proforma.id_proforma}-{anioActual}</div>
                    </div>
                </div>
                {/* Client Info */}
                <div className="mt-2 flex flex-row gap-8">
                    <div className="flex-1">
                        <table className="w-full text-sm">
                            <tbody>
                                <tr>
                                    <td className="py-1 font-semibold">NOMBRE:</td>
                                    <td className="py-1">{usuario?.nombre || "-"}</td>
                                </tr>
                                <tr>
                                    <td className="py-1 font-semibold">DIRECCIÓN:</td>
                                    <td className="py-1">{usuario?.direccion || "-"}</td>
                                </tr>
                                <tr>
                                    <td className="py-1 font-semibold">FECHA:</td>
                                    <td className="py-1">{fecha_proforma || fecha_creacion}</td>
                                </tr>
                                <tr>
                                    <td className="py-1 font-semibold">NIT:</td>
                                    <td className="py-1">{usuario?.nit || "-"}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                {/* Items Table */}
                <div className="mt-4 overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr>
                                <th className="border px-2 py-2 bg-gray-100 text-left">CANTIDAD</th>
                                <th className="border px-2 py-2 bg-gray-100 text-left">DESCRIPCIÓN</th>
                                <th className="border px-2 py-2 bg-gray-100 text-right">UNITARIO</th>
                                <th className="border px-2 py-2 bg-gray-100 text-right">SUB TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pedido.productos.map((producto, idx) => {
                                const nombre = producto.cantidad > 1
                                    ? (producto.producto?.producto_plural ?? producto.producto?.producto ?? '-')
                                    : (producto.producto?.producto ?? '-');
                                return (
                                    <tr key={idx}>
                                        <td className="border px-2 py-1 text-right">{producto.cantidad ?? '-'}</td>
                                        <td className="border px-2 py-1">{nombre}</td>
                                        <td className="border px-2 py-1 text-right">Q{(Number(producto.producto?.precio) ?? 0).toFixed(2)}</td>
                                        <td className="border px-2 py-1 text-right">Q{(Number(producto.total) ?? 0).toFixed(2)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <div className="mt-2 flex justify-end">
                        <table className="border-collapse w-64">
                            <tbody>
                                <tr>
                                    <td className="px-2 py-1 border bg-gray-50 font-semibold">TOTAL:</td>
                                    <td className="px-2 py-1 border text-right">Q{(Number(pedido.total) ?? 0).toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                {/* Footer */}
                <div className="mt-8 flex flex-row gap-8">
                    <div className="text-center flex-1">
                        <div className="mt-8 tracking-widest">ALEXANDER FRANCISCO CUTZAL AJU</div>
                        <div>REPRESENTANTE LEGAL</div>
                    </div>
                    <div className="text-center flex-1">
                        <div className="h-16">&nbsp;</div>
                        <div>SELLO:</div>
                    </div>
                </div>
            </div>
            <div className="w-full flex justify-center mt-6 print:hidden">
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-lg font-semibold shadow-md hover:bg-emerald-600 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-300 text-base"
                >
                    <span className="text-xl">🖨️</span>
                    <span>Imprimir Proforma</span>
                </button>
            </div>
        </div>
    );
};

export default ProformaDetalle;
