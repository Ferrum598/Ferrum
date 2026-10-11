import { Link } from '@inertiajs/react';
import { useState } from 'react';
export default function CarritoComponente({url,}: {url: string;}) {
    // Define las rutas donde no se debe mostrar el carrito
    const rutasSinCarrito = ['/carrito', '/inventario/agregar'];
    const ocultarPorPrefijo = ['/inventario/editar'];
    const mostrarCarrito =
        !rutasSinCarrito.some(ruta => url.startsWith(ruta)) &&
        !ocultarPorPrefijo.some(prefijo => url.startsWith(prefijo));
    
    return (
        <>
            {/* Carrito fijo en móvil, alineado en desktop */}
            <Link
                className={`transition duration-300 ease-in-out hover:scale-110 ${mostrarCarrito ? '' : 'hidden'} fixed top-1 right-4 z-50 md:ml-0 md:mr-0 md:relative`}
                href="/carrito"
            >
                <img src="/assets/icon/carrito.png" alt="Carrito" />
            </Link>
        </>
    );
}