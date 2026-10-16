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
    { href: '/cotizaciones', permiso: 'ventas', texto: 'Cotizaciones', icono: '/assets/icon/pedido.png' },
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
                className="fixed z-20 top-2 left-2 md:hidden flex w-auto p-1 rounded-xl bg-gradient-to-br from-slate-900 to-blue-900 text-white shadow-lg focus:outline-none"
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
                className={`print:hidden fixed z-50 top-0 left-0 h-full bg-gradient-to-b from-slate-900 via-slate-900 to-blue-950 border-r border-white/10 flex flex-col items-center p-4 overflow-y-auto overflow-x-hidden transition-transform duration-300
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
                <div className="mb-4 h-28 w-28 shrink-0 overflow-hidden rounded-full bg-white relative flex items-center justify-center ring-4 ring-blue-500/60 shadow-lg shadow-blue-900/50">
                    <img
                        className="object-cover h-full w-full"
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
                        <p className="text-lg font-bold">{usuario.nombre}</p>
                        <span className="mt-1 inline-block rounded-full bg-blue-500/20 px-3 py-0.5 text-xs font-semibold uppercase tracking-wide text-blue-200 border border-blue-400/30">{rol || 'Sin rol'}</span>
                    </div>
                )}

                <div className="flex w-full flex-col items-center">
                    <nav className="mb-6 w-full border-t border-white/10 pt-5 text-base text-slate-200">
                        <ul className="space-y-1.5">
                            {opcionesMenu
                                .filter((opcion) => permisos.includes(opcion.permiso))
                                .map((opcion) => (
                                    <li
                                        key={opcion.href}
                                        className="list-none"
                                    >
                                        <Link
                                            href={opcion.href}
                                            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium transition-all duration-200 ${currentPath.startsWith(opcion.href)
                                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/40'
                                                : 'text-slate-300 hover:bg-white/10 hover:text-white hover:translate-x-1'}`}
                                        >
                                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                                                <img src={opcion.icono} alt="" className="h-5 w-5 brightness-0 invert" />
                                            </span>
                                            {opcion.texto}
                                        </Link>
                                    </li>
                                ))}

                            <div className="mt-4 border-t border-white/10 pt-4"></div>
                            <li className="list-none">
                                <a
                                    onClick={cerrarSesion}
                                    href="#"
                                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium text-rose-300 transition-all duration-200 hover:bg-rose-500/20 hover:text-rose-200"
                                >
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-500/20">
                                        <img src="/assets/icon/logout.svg" alt="" className="h-5 w-5 brightness-0 invert" />
                                    </span>
                                    Cerrar sesión
                                </a>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </>
    );
}
