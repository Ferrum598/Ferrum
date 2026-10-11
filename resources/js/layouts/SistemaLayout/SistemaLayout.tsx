import BarraDeNavegacion from '@/components/ui/BarraDeNavegacion';
import CarritoComponente from '@/components/ui/CarritoComponente';
import { usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
export default function SistemaLayout({children,}: {children: React.ReactNode;}) {
    const inertiaProps = usePage().props as any;
    const url = inertiaProps.url || (typeof window !== 'undefined' ? window.location.pathname : '');
    const { productos, imagenes } = inertiaProps;
    // Buffer para capturar el código escaneado
    const scanBuffer = useRef('');
    const scanTimeout = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Si el foco está en un input, no hacer nada
            const tag = (e.target as HTMLElement)?.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA') return;

            if (scanTimeout.current) clearTimeout(scanTimeout.current);
            // Si es Enter, procesar el buffer
            if (e.key === 'Enter') {
                const codigo = scanBuffer.current.trim();
                if (codigo) {
                    fetch(`/api/producto/barcode/${encodeURIComponent(codigo)}`)
                        .then(res => res.json())
                        .then(data => {
                            if (data.found && data.producto) {
                                const producto = data.producto;
                                const imagen = data.imagen || null;
                                // Agregar al carrito
                                const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
                                let index = carrito.findIndex((item: any) => item.producto.id_producto === producto.id_producto);
                                if (index !== -1) {
                                    carrito[index].cantidad += 1;
                                } else {
                                    carrito.push({ producto, imagen, cantidad: 1 });
                                }
                                localStorage.setItem('carrito', JSON.stringify(carrito));
                                window.dispatchEvent(new Event('carrito-updated'));
                                Swal.fire({
                                    icon: 'success',
                                    title: `Producto ${producto.producto} agregado al carrito`,
                                    timer: 2000,
                                    showConfirmButton: false,
                                    timerProgressBar: true,
                                });
                            } else {
                                Swal.fire({
                                    icon: 'warning',
                                    title: `No se encontró producto con código: ${codigo}`,
                                    timer: 2000,
                                    showConfirmButton: false,
                                    timerProgressBar: true,
                                });
                            }
                        })
                        .catch(() => {
                            Swal.fire({
                                icon: 'error',
                                title: 'Error al buscar el producto',
                                timer: 2000,
                                showConfirmButton: false,
                                timerProgressBar: true,
                            });
                        });
                }
                scanBuffer.current = '';
                return;
            }
            // Solo aceptar caracteres imprimibles
            if (e.key.length === 1) {
                scanBuffer.current += e.key;
            }
            // Limpiar buffer si no se termina en 500ms
            scanTimeout.current = setTimeout(() => {
                scanBuffer.current = '';
            }, 500);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            if (scanTimeout.current) clearTimeout(scanTimeout.current);
        };
    }, []);

    return (
        <div className="flex h-screen w-full">
            {/* Barra superior en móvil: hamburguesa y carrito */}
            {/* Botón hamburguesa fijo en móvil */}
            <div className="fixed top-0 left-0 z-[101] md:hidden pointer-events-auto p-2">
                <BarraDeNavegacion />
            </div>
            {/* Menú lateral: fixed en desktop, overlay absoluto y transparente en móvil */}
            <aside className="z-50 md:relative md:w-1/6 w-auto absolute md:block hidden">
                <BarraDeNavegacion />
            </aside>
            {/* Contenido principal: margen izquierdo en desktop, full en móvil */}
            <main className="relative flex-1 flex flex-col md:ml-1/6 ml-0 transition-all duration-300 p-2 md:p-4 overflow-x-auto mt-12 md:mt-0">
                <div className="w-full md:flex md:justify-end md:items-start mb-4 fixed top-0 left-85 md:left-0 md:relative z-40">
                    <CarritoComponente url={url} />
                </div>
                <div className="flex-1 w-full max-w-full">{children}</div>
            </main>
        </div>
    );
}
