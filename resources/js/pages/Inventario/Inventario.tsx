import SistemaLayout from '@/layouts/SistemaLayout/SistemaLayout';
import Tabla from '@/components/Tabla/Tabla';
import { usePage, Link, Head } from '@inertiajs/react';
import { useEffect } from 'react';
import { Producto, ImagenProducto } from '@/components/Interfaces/interfaceInventario';
import '../../../css/datatable.css';
import Swal from "sweetalert2";
export default function Inventario() {
    const { productos, imagenes } = usePage().props as {
        productos?: {
            data: Producto[];
            current_page: number;
            last_page: number;
            per_page: number;
            total: number;
            from: number;
            to: number;
        };
        imagenes?: ImagenProducto[];
    };
    const { flash } = usePage().props as { flash?: { title: string; message: string; icon: 'success' | 'error' } };

    useEffect(() => {
          if (flash?.icon === 'success') {
              Swal.fire({
                  position: 'top-end',
                  title: flash.title,
                  text: flash.message,
                  icon: flash.icon,
                  timer: 1600,
                  showConfirmButton: false,
              });
          } else if (flash?.icon === 'error') {
              Swal.fire({
                  position: 'top-end',
                  title: flash.title,
                  text: flash.message,
                  icon: flash.icon,
                  timer: 1600,
                  showConfirmButton: false,
              });
          }
      }, [flash]);

    // Función para cambiar de página
    const handlePageChange = (page: number) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Mantener el per_page actual
        const perPage = productos?.per_page || 10;
        // Redirigir con la nueva página
        window.location.href = `/inventario?page=${page}&per_page=${perPage}`;
    };


    return (
        <>
            <Head>
                <title>Inventario</title>
                <meta name="Inventario" content="Inventario de productos" />
            </Head>

            <SistemaLayout>
                <div className="flex w-[95%] justify-center p-6 min-h-[100%] flex-col gap-5">
                    <Tabla 
                        productos={productos?.data} 
                        imagenes={imagenes} 
                        paginationProps={productos ? {
                            current_page: productos.current_page,
                            last_page: productos.last_page,
                            per_page: productos.per_page,
                            total: productos.total,
                        } : undefined}
                    />
                    {/* La paginación ahora está dentro de Tabla */}
                    <div className="flex w-full justify-center">
                        <Link
                            href='/inventario/agregar'
                            className='w-full sm:w-[60%] md:w-[30%] h-12 flex items-center justify-center rounded-[8px] bg-[#0B0B0B] text-[15px] text-white transition duration-300 ease-in-out hover:-translate-y-1 hover:bg-[#282727] cursor-pointer text-center font-semibold'
                        >
                            Agregar un Producto
                        </Link>
                    </div>
                </div>
            </SistemaLayout>
        </>
    );
}
