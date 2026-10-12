export interface LoteVenta {
    id_lote: number;
    nombre_lote: string;
    precio_venta: string;
    cantidad_disponible: number;
    fecha_ingreso: string | null;
}

export interface ProductoVenta {
    id_producto: number;
    nombre_producto: string;
    categoria?: string | null;
    imagen?: string;
    lotes: LoteVenta[];
}

export interface ItemCarrito {
    id_lote: number;
    producto: string;
    nombre_lote: string;
    precio_venta: number;
    cantidad_disponible: number;
    cantidad: number;
}

export interface ClienteVenta {
    id_cliente: number;
    nombre_cliente: string;
    apellido_cliente: string;
    numero_cliente: string | null;
    deuda_total?: number | string;
}

export interface Paginado<T> {
    data: T[];
    current_page: number;
    last_page: number;
    links: { url: string | null; label: string; active: boolean }[];
}

export interface VentaHistorial {
    id_venta: number;
    fecha_venta: string;
    total: string;
    cliente: string | null;
    vendedor: string | null;
    tipo_pago: 'contado' | 'credito';
    id_comprobante: number | null;
    numero_comprobante: string | null;
}

export interface ComprobanteLista {
    id_comprobante: number;
    numero_comprobante: string;
    fecha_emision: string;
    total: string;
    cliente: string | null;
    tipo_pago: 'contado' | 'credito';
    veces_impreso: number;
}

export interface ComprobanteDetalle {
    id_comprobante: number;
    numero_comprobante: string;
    fecha_emision: string;
    total: string;
    veces_impreso: number;
    vendedor: string | null;
    cliente: { nombre: string; numero: string | null } | null;
    tipo_pago: 'contado' | 'credito';
    credito: { fecha_vencimiento: string; saldo_pendiente: string; estado: string } | null;
    detalles: { id_detalle: number; producto: string | null; lote: string | null; cantidad: number; precio_unitario: string; subtotal: string }[];
}
