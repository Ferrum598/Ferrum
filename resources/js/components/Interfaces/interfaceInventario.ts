export interface Producto {
    id_producto?: number;
    producto?: string;
    producto_plural?: string;
    descripcion?: string;
    codigo_barra?: number;
    estado?: 'mostrado' | 'oculto';
    estatus?: 'activo' | 'inactivo';
    precio?: number;
    cantidad?: number;
    fk_id_imagen?: number;
    fk_id_categoria?: number | null;
}
export interface ImagenProducto {
    id_imagen?: number;
    imagen?: string | null;
}
export interface ProductoForm {
    id?: number;
    producto?: string;
    producto_plural?: string;
    descripcion?: string;
    codigo_barra?: number | string;
    precio?: string | number;
    cantidad?: string | number;
    imagen?: File | null;
    categoria?: number | undefined;
}