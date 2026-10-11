export interface DashboardData extends Record<string, any> {
    estadisticas?: {
        total_pedidos: number;
        total_usuarios: number;
        total_productos: number;
        ventas_hoy: number;
        ventas_mes: number;
    };
    productos_mas_vendidos?: Array<{
        producto: string;
        precio: number;
        total_vendido: number;
        ingresos_generados: number;
    }>;
    productos_menos_vendidos?: Array<{
        producto: string;
        precio: number;
        stock_actual: number;
        total_vendido: number;
    }>;
    ventas_por_mes?: Array<{
        mes: string;
        año: number;
        total: number;
        cantidad_pedidos: number;
    }>;
    productos_stock_bajo?: Array<{
        producto: string;
        cantidad: number;
        precio: number;
    }>;
    pedidos_recientes?: Array<{
        id: number;
        usuario: string;
        total: number;
        estado: string;
        fecha: string;
        productos_count: number;
    }>;
    estados_pedidos?: Array<{
        estado: string;
        cantidad: number;
    }>;
}
