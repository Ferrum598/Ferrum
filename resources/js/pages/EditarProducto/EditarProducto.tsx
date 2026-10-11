import SistemaLayout from "@/layouts/SistemaLayout/SistemaLayout";
import { usePage } from "@inertiajs/react";
import FormularioProducto from "@/components/FormularioProducto/FormularioProducto";
import { Producto,ImagenProducto } from "@/components/Interfaces/interfaceInventario";
import { useEffect } from "react";
import { Categoria } from "@/components/Interfaces/interfaceCategoria";

export default function EditarProducto({ productos, imagenes, categorias } : { productos?: Producto[], imagenes?: ImagenProducto[], categorias?: Categoria[] }) {

    return (
        <SistemaLayout>
           <FormularioProducto productos={productos} imagenes={imagenes} categorias={categorias} />
        </SistemaLayout>
    );
}