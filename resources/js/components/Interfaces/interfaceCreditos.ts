import type { Cliente } from "./interfaceCliente";

export interface Credito {
    id_credito: number;
    fk_cliente: number;
    fk_venta: number;
    monto_total: string | number;
    saldo_pendiente: string | number;
    fecha_inicio: string;
    fecha_vencimiento: string;
    estado: "pendiente" | "pagado" | "vencido";
    cliente?: Cliente;
    venta?: {
        id_venta: number;
        comprobante?: { id_comprobante: number; numero_comprobante: string } | null;
        detalles?: DetalleVenta[];
    };
    abonos?: AbonoCredito[];
}

export interface DetalleVenta {
    id_detalle: number;
    cantidad: number;
    precio_unitario: string | number;
    subtotal: string | number;
    lote?: { nombre_lote: string | null; producto?: { nombre_producto: string } };
}

export interface AbonoCredito {
    id_abono: number;
    monto: string | number;
    fecha_abono: string;
    usuario?: { nombre: string; apellido: string };
}