export interface Usuario {
    id_usuario: number;
    usuario: string;
    nit: string;
    direccion: string;
    fk_id_imagen: number;
    fk_id_rol: number;
    creditos: any[];
    total:any;
}
