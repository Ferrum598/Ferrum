export interface DashboardData extends Record<string, unknown> {
    estadisticas: {
        ventas_hoy_cantidad: number;
        ventas_hoy_monto: number;
        ventas_mes_cantidad: number;
        ventas_mes_monto: number;
        costo_ventas_mes: number;
        diferencia_mes: number;
        ingresos_cobrados_mes: number;
        creditos_pendientes: number;
        creditos_vencidos: number;
        stock_bajo_unidades: number;
    };
    productos_mas_vendidos: Array<{ producto: string; total_vendido: number; ingresos_generados: number }>;
    productos_stock_bajo: Array<{ id_producto: number; producto: string; cantidad_disponible: number }>;
    ventas_por_dia: Array<{ fecha: string; etiqueta: string; cantidad: number; total: number }>;
}
