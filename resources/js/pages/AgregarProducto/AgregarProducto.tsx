import SistemaLayout from "@/layouts/SistemaLayout/SistemaLayout";
import FormularioProducto from "@/components/FormularioProducto/FormularioProducto";
import { Head } from "@inertiajs/react";
import { Categoria } from "@/components/Interfaces/interfaceCategoria";
export default function AgregarProducto({ categorias } : { categorias?: Categoria[] }) {
    console.log(categorias);
    return (
        <>
            <Head>
                <title>Agregar Producto</title>
                <meta name="Agregar Producto" content="Agregar un nuevo producto" />
            </Head>
            <SistemaLayout>
                <FormularioProducto categorias={categorias} />
            </SistemaLayout>
        </>
    );
}