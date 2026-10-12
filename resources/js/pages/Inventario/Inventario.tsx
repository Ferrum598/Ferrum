import SistemaLayout from '@/layouts/SistemaLayout/SistemaLayout';
import Tabla from '@/components/Tabla/Tabla';
import useFlashSwal from '@/components/FlashSwal/useFlashSwal';
import { Link, Head } from '@inertiajs/react';
import { PaginadoInventario, ProductoInventario } from '@/components/Interfaces/interfaceInventario';
import '../../../css/datatable.css';

export default function Inventario({ productos, buscar = '' }: { productos?: PaginadoInventario<ProductoInventario>; buscar?: string }) {
    useFlashSwal();

    return (
        <>
            <Head>
                <title>Inventario</title>
                <meta name="Inventario" content="Inventario de productos" />
            </Head>

            <SistemaLayout>
                <div className="flex min-h-[100%] w-[95%] flex-col justify-center gap-5 p-6">
                    <Tabla productos={productos} buscarInicial={buscar} />
                    <div className="flex w-full justify-center">
                        <Link
                            href="/inventario/agregar"
                            className="flex h-12 w-full cursor-pointer items-center justify-center rounded-[8px] bg-[#0B0B0B] text-center text-[15px] font-semibold text-white transition duration-300 ease-in-out hover:-translate-y-1 hover:bg-[#282727] sm:w-[60%] md:w-[30%]"
                        >
                            Agregar un Producto
                        </Link>
                    </div>
                </div>
            </SistemaLayout>
        </>
    );
}
