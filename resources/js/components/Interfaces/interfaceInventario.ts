export interface LoteInventario {
    id_lote: number;
    nombre_lote: string | null;
    precio_compra: number;
    precio_venta: number;
    cantidad: number;
    cantidad_disponible: number;
    fecha_ingreso: string | null;
    activo: boolean;
}

export interface ProductoInventario {
    id_producto: number;
    nombre_producto: string;
    descripcion: string | null;
    categoria: string | null;
    imagen: string;
    existencias: number;
    lotes: LoteInventario[];
}

export interface PaginadoInventario<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface ProductoEdicion {
    id_producto: number;
    nombre_producto: string;
    descripcion: string | null;
    fk_categoria: number | null;
    imagen: string | null;
}

export interface CodigoBarraItem {
    id_codigo: number;
    codigo: string;
    tipo_codigo: 'code128' | 'ean13' | 'code39' | 'qr';
    es_personalizado: boolean;
    activo: boolean;
    veces_impreso: number;
    fecha_creacion: string | null;
    id_lote: number | null;
    nombre_lote: string | null;
    producto: string | null;
    precio_venta: number;
}

export interface LoteOpcion {
    id_lote: number;
    etiqueta: string;
}

export interface FlashMensaje {
    title: string;
    message: string;
    icon: 'success' | 'error';
}
