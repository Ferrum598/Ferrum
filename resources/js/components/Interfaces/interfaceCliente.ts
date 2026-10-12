export interface Cliente {
    id_cliente: number;
    nombre_cliente: string;
    apellido_cliente: string;
    numero_cliente: string | null;
    deuda_total?: number;
}