import SistemaLayout from '@/layouts/SistemaLayout/SistemaLayout';
import Tabla from '@/components/Tabla/Tabla';
import useFlashSwal from '@/components/FlashSwal/useFlashSwal';
import { Link, Head } from '@inertiajs/react';
import { PaginadoInventario, ProductoInventario } from '@/components/Interfaces/interfaceInventario';

export default function Inventario({ productos, buscar = '' }: { productos?: PaginadoInventario<ProductoInventario>; buscar?: string }) {
    useFlashSwal();

    return (
        <>
            <Head>
                <title>Inventario</title>
                <meta name="Inventario" content="Inventario de productos" />
            </Head>

            <SistemaLayout>
                <div className="flex min-h-[100%] w-[95%] flex-col gap-6 p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h1 className="bg-gradient-to-r from-slate-900 to-blue-700 bg-clip-text text-3xl font-extrabold text-transparent">📦 Inventario</h1>
                        <Link
                            href="/inventario/agregar"
                            className="cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-center font-semibold text-white shadow-lg transition hover:from-blue-700 hover:to-indigo-700 active:scale-95"
                        >
                            + Agregar un Producto
                        </Link>
                    </div>
                    <Tabla productos={productos} buscarInicial={buscar} />
                </div>
            </SistemaLayout>
        </>
    );
}
