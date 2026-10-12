import SistemaLayout from '@/layouts/SistemaLayout/SistemaLayout';
import FormularioLote from '@/components/FormularioLote/FormularioLote';
import { Head } from '@inertiajs/react';
import { LoteInventario } from '@/components/Interfaces/interfaceInventario';

export default function AgregarLote({ producto, lote }: { producto: { id_producto: number; nombre_producto: string }; lote?: LoteInventario | null }) {
    return (
        <>
            <Head>
                <title>{lote ? 'Editar Lote' : 'Agregar Lote'}</title>
            </Head>
            <SistemaLayout>
                <FormularioLote idProducto={producto.id_producto} nombreProducto={producto.nombre_producto} lote={lote} />
            </SistemaLayout>
        </>
    );
}
