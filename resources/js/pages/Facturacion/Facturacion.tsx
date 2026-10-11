import React, { useState } from "react";
import SistemaLayout from "@/layouts/SistemaLayout/SistemaLayout";
import { Head } from "@inertiajs/react";
import ProformaCard from "@/components/Facturacion/ProformaCard";
import ProformaDetalle from "@/components/Facturacion/ProformaDetalle";


interface ProductoProforma {
    producto: {
        producto: string;
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
    fecha_proforma?: string;
    fecha_creacion: string;
    pedido: {
        total: number;
        estado: string;
        productos: ProductoProforma[];
    };
}

interface FacturacionProps {
    proformas: Proforma[];
}


export default function Facturacion({ proformas = [] }: FacturacionProps) {
    const [mostrarFactura, setMostrarFactura] = useState(false);
    const [proformaSeleccionada, setProformaSeleccionada] = useState<Proforma | null>(null);
    const [busqueda, setBusqueda] = useState("");

    const verDetallesProforma = (proforma: Proforma) => {
        setProformaSeleccionada(proforma);
        setMostrarFactura(true);
    };

    const filtrarProformas = (proformas: Proforma[], busqueda: string) => {
        if (!busqueda.trim()) return proformas;
        const b = busqueda.toLowerCase();
        return proformas.filter((p) =>
            (p.usuario?.nombre?.toLowerCase().includes(b) ||
            String(p.id_proforma).includes(b) ||
            (p.fecha_proforma && p.fecha_proforma.includes(b)) ||
            (p.fecha_creacion && p.fecha_creacion.includes(b)))
        );
    };

    const proformasFiltradas = filtrarProformas(proformas, busqueda);

    if (mostrarFactura && proformaSeleccionada) {
        return (
            <>
                <Head title="Factura - Librería Shaddai" />
                <ProformaDetalle
                    proforma={proformaSeleccionada}
                    onClose={() => setMostrarFactura(false)}
                />
            </>
        );
    }

    return (
        <SistemaLayout>
            <Head title="Facturación" />
            <div className="w-full max-w-6xl mx-auto p-4 md:p-8 space-y-8">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">Proformas</h1>
                        <p className="text-gray-500 text-base">Gestión de proformas</p>
                    </div>
                    <div className="relative w-full md:w-80">
                        <input
                            type="text"
                            placeholder="Buscar por nombre, número o fecha..."
                            value={busqueda}
                            onChange={e => setBusqueda(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 bg-white text-gray-800 placeholder-gray-400 transition"
                        />
                        {/* Icono de lupa SVG inline, sin dependencias */}
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" style={{height: '1.25em', width: '1.25em'}}>
                            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                <path fillRule="evenodd" d="M12.9 14.32a8 8 0 111.414-1.414l4.387 4.387a1 1 0 01-1.414 1.414l-4.387-4.387zM14 8a6 6 0 11-12 0 6 6 0 0112 0z" clipRule="evenodd" />
                            </svg>
                        </span>
                    </div>
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">
                        Proformas encontradas: <span className="font-bold text-emerald-600">{proformasFiltradas.length}</span>
                    </h2>
                    <div className="grid gap-8" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))'}}>
                        {proformasFiltradas.map((proforma) => (
                            <ProformaCard
                                key={proforma.id_proforma}
                                proforma={proforma}
                                onVerDetalles={() => verDetallesProforma(proforma)}
                            />
                        ))}
                        {proformasFiltradas.length === 0 && (
                            <div className="text-gray-400 col-span-full text-center py-12 text-lg">No hay proformas registradas.</div>
                        )}
                    </div>
                </div>
            </div>
        </SistemaLayout>
    );
}