import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { Inertia } from '@inertiajs/inertia';
import { Link } from '@inertiajs/react';

// Cada opción del menú se muestra solo si el rol del usuario tiene el permiso indicado
const opcionesMenu = [
    { href: '/dashboard', permiso: 'dashboard', texto: 'Dashboard', icono: '/assets/icon/dashboard.png' },
    { href: '/ventas', permiso: 'ventas', texto: 'Ventas', icono: '/assets/icon/catalogo.png' },
    { href: '/comprobantes', permiso: 'comprobantes', texto: 'Comprobantes', icono: '/assets/icon/facturacion.png' },
    { href: '/inventario', permiso: 'inventario', texto: 'Inventario', icono: '/assets/icon/inventario.png' },
    { href: '/codigos-barras', permiso: 'codigos_barras', texto: 'Códigos de barras', icono: '/assets/icon/pedido.png' },
    { href: '/clientes', permiso: 'clientes', texto: 'Clientes', icono: '/assets/icon/carrito.png' },
    { href: '/creditos', permiso: 'creditos', texto: 'Créditos', icono: '/assets/icon/credito.png' },
    { href: '/reportes/ventas', permiso: 'reportes', texto: 'Reportes', icono: '/assets/icon/verEstado.png' },
    { href: '/reportes/ganancias', permiso: 'reportes', texto: 'Ganancias', icono: '/assets/icon/dashboard.png' },
    { href: '/gastos-fijos', permiso: 'gastos', texto: 'Gastos fijos', icono: '/assets/icon/facturacion.png' },
    { href: '/categorias', permiso: 'categorias', texto: 'Categorías', icono: '/assets/icon/categorias.png' },
];

export default function BarraDeNavegacion() {
    const page = usePage();
    const props = page.props as any;
    const usuario = props.auth?.user;
    const rol = usuario?.rol;
    const permisos: string[] = usuario?.permisos ?? [];
    const currentPath = page.url;
    const [open, setOpen] = useState(false);

    // Bloquear scroll del fondo cuando el menú móvil está abierto
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

    const cerrarSesion = () => {
        Swal.fire({
            title: 'Estas seguro?',
            text: 'estas a punto de cerrar sesión!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si, cerrar sesión!',
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Se cerró sesión',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                }).then(() => {
                    Inertia.visit('/logout');
                });
            }
        });
    };

    // Responsive: menú lateral fijo en desktop, drawer en móvil
    return (
        <>
            {/* Botón hamburguesa solo en móvil, compacto y sin fondo blanco extra */}
            <button
                className="fixed z-20 top-2 left-2 md:hidden flex w-auto p-0 rounded bg-[#736D6D] text-white shadow focus:outline-none"
                style={{marginLeft: 0, marginTop: 0}}
                onClick={() => setOpen(true)}
                aria-label="Abrir menú"
            >
                <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {/* Overlay para móvil */}
            {open && (
                <div
                    className="fixed inset-0 z-30 bg-black bg-opacity-50 transition-opacity duration-300 md:hidden"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Menú lateral */}
            <div
                className={`fixed z-50 top-0 left-0 h-full bg-[#736D6D] flex flex-col items-center p-4 overflow-y-auto overflow-x-hidden transition-transform duration-300
                w-4/5 max-w-xs md:w-64 md:max-w-xs md:translate-x-0
                ${open ? 'translate-x-0' : '-translate-x-full'}
                md:relative md:top-0 md:left-0 md:translate-x-0 md:flex md:h-screen`}
                style={{ boxShadow: open ? '2px 0 8px rgba(0,0,0,0.2)' : undefined }}
                onClick={e => e.stopPropagation()}
            >
                {/* Botón cerrar solo en móvil y botón de perfil bien posicionados */}
                <div className="w-full flex justify-between items-center mb-2 md:hidden relative">
                    <button
                        className="p-2 text-white hover:text-gray-300 z-20"
                        onClick={() => setOpen(false)}
                        aria-label="Cerrar menú"
                    >
                        <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <Link href="/perfil" className="z-10">
                        <img className="h-8 w-10 bg-white rounded-full transform ease-in-out duration-300 hover:scale-125 border border-gray-200" src="../assets/icon/settings.svg" alt="Settings" />
                    </Link>
                </div>
                <div className="mb-6 h-32 w-32 overflow-hidden rounded-full bg-white relative flex items-center justify-center">
                    <img
                        className="object-fill h-full w-full"
                        src="/images/Avatar.jpg"
                        alt="Profile"
                    />
                </div>
                {/* En desktop, botón de perfil arriba a la derecha */}
                <div className="hidden md:flex w-full justify-end mb-2">
                    <Link href="/perfil">
                        <img className="h-8 w-10 bg-white rounded-full transform ease-in-out duration-300 hover:scale-125 border border-gray-200" src="../assets/icon/settings.svg" alt="Settings" />
                    </Link>
                </div>

                {/*Mostrar información del usuario si existe */}
                {usuario && (
                    <div className="mb-4 text-center text-white">
                        <p className="text-lg font-semibold">{usuario.nombre}</p>
                        <p className="text-sm opacity-75">{rol || 'Sin rol'}</p>
                    </div>
                )}

                <div className="flex w-full flex-col items-center">
                    <nav className="mb-6 w-full border-t border-gray-300 pt-6 text-3xl text-white">
                        <ul>
                            {opcionesMenu
                                .filter((opcion) => permisos.includes(opcion.permiso))
                                .map((opcion) => (
                                    <li
                                        key={opcion.href}
                                        className={`mb-6 transition delay-75 ease-in-out hover:translate-x-6 hover:scale-110 hover:text-gray-300 ${currentPath.startsWith(opcion.href) ? 'text-gray-600 bg-white/25 w-[90%] p-1 rounded-[8px]' : ''}`}
                                    >
                                        <Link href={opcion.href} className="flex items-center gap-2">
                                            <img src={opcion.icono} alt={opcion.texto} className="h-6 w-6" />
                                            {opcion.texto}
                                        </Link>
                                    </li>
                                ))}

                            <div className="mb-1 flex w-full justify-end border-t border-gray-300 pt-6"></div>
                            <li className="flex w-full justify-end transition delay-75 ease-in-out hover:scale-110">
                                <a onClick={cerrarSesion} href="#">
                                    <img
                                        src="/assets/icon/logout.svg"
                                        alt="Logout"
                                        className="h-10 w-10"
                                    />
                                </a>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </>
    );
}
