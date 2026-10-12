import SistemaLayout from '@/layouts/SistemaLayout/SistemaLayout';
import FormularioProducto from '@/components/FormularioProducto/FormularioProducto';
import { Head } from '@inertiajs/react';
import { ProductoEdicion } from '@/components/Interfaces/interfaceInventario';
import { Categoria } from '@/components/Interfaces/interfaceCategoria';

export default function EditarProducto({ producto, categorias }: { producto: ProductoEdicion; categorias?: Categoria[] }) {
    return (
        <>
            <Head>
                <title>Editar Producto</title>
            </Head>
            <SistemaLayout>
                <FormularioProducto producto={producto} categorias={categorias} />
            </SistemaLayout>
        </>
    );
}
