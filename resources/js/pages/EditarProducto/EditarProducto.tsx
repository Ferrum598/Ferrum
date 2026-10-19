import SistemaLayout from '@/layouts/SistemaLayout/SistemaLayout';
import FormularioProducto from '@/components/FormularioProducto/FormularioProducto';
import DescuentosProducto, { DescuentoConfig } from '@/components/DescuentosProducto/DescuentosProducto';
import useFlashSwal from '@/components/FlashSwal/useFlashSwal';
import { Head } from '@inertiajs/react';
import { ProductoEdicion } from '@/components/Interfaces/interfaceInventario';
import { Categoria } from '@/components/Interfaces/interfaceCategoria';

export default function EditarProducto({ producto, categorias, descuentos = [] }: { producto: ProductoEdicion; categorias?: Categoria[]; descuentos?: DescuentoConfig[] }) {
    useFlashSwal();
    return (
        <>
            <Head>
                <title>Editar Producto</title>
            </Head>
            <SistemaLayout>
                <FormularioProducto producto={producto} categorias={categorias}>
                    <DescuentosProducto idProducto={producto.id_producto} descuentos={descuentos} />
                </FormularioProducto>
            </SistemaLayout>
        </>
    );
}
