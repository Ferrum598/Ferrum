export interface Categoria {
    id_categoria: number;
    nombre_categoria: string;
    productos_count?: number;
    // Compatibilidad con pantallas que aún leen el nombre antiguo
    categoria?: string;
}
