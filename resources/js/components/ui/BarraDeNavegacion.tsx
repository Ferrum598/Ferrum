
import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { Inertia } from '@inertiajs/inertia';
import { Link } from '@inertiajs/react';

export default function BarraDeNavegacion() {
    const page = usePage();
    const props = page.props as any;
    const usuario = props.auth?.user;
    const rol = usuario?.rol;
    const currentPath = page.url;
    const imagenPerfil = props.auth?.imagenPerfil;
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
                        src={imagenPerfil || '/images/Avatar.jpg'}
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
                           {/*Dashboard*/}
                            {rol === 'Administrador' && (
                                <li className={`mb-6 transition delay-75 ease-in-out hover:translate-x-6 hover:scale-110 hover:text-gray-300 ${currentPath === '/dashboard' ? 'text-gray-600 bg-white/25 w-[90%] p-1 rounded-[8px]' : ''}`}>
                                    <Link
                                        href="/dashboard"
                                        className="flex items-center gap-2"
                                    >
                                        <img
                                            src="/assets/icon/dashboard.png"
                                            alt="Dashboard"
                                            className="h-6 w-6"
                                        />
                                        Dashboard
                                    </Link>
                                </li>
                          )}
                            

                            {/*Catálogo - Todos */}
                            <li className={`mb-6 transition delay-75 ease-in-out hover:translate-x-6 hover:scale-110 hover:text-gray-300 ${currentPath === '/catalogo' ? 'text-gray-600 bg-white/25 w-[90%] p-1 rounded-[8px]' : ''}`}>
                                <Link href="/catalogo" className="flex items-center gap-2">
                                    <img
                                        src="/assets/icon/catalogo.png"
                                        alt="Catalogo"
                                        className="h-6 w-6"
                                    />
                                    Catalogo
                                </Link>
                            </li>

                            {/*Proformas - Admin y Empleado */}
                            {(rol === 'Administrador' || rol === 'Empleado') && (
                                <li className={`mb-6 transition delay-75 ease-in-out hover:translate-x-6 hover:scale-110 hover:text-gray-300 ${currentPath === '/proformas' ? 'text-gray-600 bg-white/25 w-[90%] p-1 rounded-[8px]' : ''}`}>
                                    <Link href="/proformas" className="flex items-center gap-2">
                                        <img
                                            src="/assets/icon/facturacion.png"
                                            alt="Proformas"
                                            className="h-6 w-6"
                                        />
                                        Proformas
                                    </Link>
                                </li>
                            )}
                            

                            {/*Créditos - Admin y empleado */}
                            {(rol === 'Administrador' || rol === 'Empleado') && (
                            <li className={`mb-6 transition delay-75 ease-in-out hover:translate-x-6 hover:scale-110 hover:text-gray-300 ${currentPath === '/creditos' ? 'text-gray-600 bg-white/25 w-[90%] p-1 rounded-[8px]' : ''}`}>
                                <Link href="/creditos" className="flex items-center gap-2">
                                    <img
                                        src="/assets/icon/credito.png"
                                        alt="Creditos"
                                        className="h-6 w-6"
                                    />
                                    Creditos
                                </Link>
                            </li>
                            )}

                            {/*Inventario - Solo Administrador y empleado */}
                            {(rol === 'Administrador' || rol === 'Empleado') && (
                                <li className={`mb-6 transition delay-75 ease-in-out hover:translate-x-6 hover:scale-110 hover:text-gray-300 ${currentPath === '/inventario' ? 'text-gray-600 bg-white/25 w-[90%] p-1 rounded-[8px]' : ''}`}>
                                    <Link href="/inventario" className="flex items-center gap-2">
                                        <img
                                            src="/assets/icon/inventario.png"
                                            alt="Inventario"
                                            className="h-6 w-6"
                                        />
                                        Inventario
                                    </Link>
                                </li>
                            )}

                            {/*Pedidos - Admin y Empleado */}
                            {(rol === 'Administrador' || rol === 'Empleado') && (
                                <li className={`mb-6 transition delay-75 ease-in-out hover:translate-x-6 hover:scale-110 hover:text-gray-300 ${currentPath === '/pedidos' ? 'text-gray-600 bg-white/25 w-[90%] p-1 rounded-[8px]' : ''}`}>
                                    <Link href="/pedidos" className="flex items-center gap-2">
                                        <img
                                            src="/assets/icon/pedido.png"
                                            alt="Pedidos"
                                            className="h-6 w-6"
                                        />
                                        Pedidos
                                    </Link>
                                </li>
                            )}
                            {/*Categorías - Solo Administrador */}
                            {rol === 'Administrador' && (
                                <li className={`mb-6 transition delay-75 ease-in-out hover:translate-x-6 hover:scale-110 hover:text-gray-300 ${currentPath === '/categorias' ? 'text-gray-600 bg-white/25 w-[90%] p-1 rounded-[8px]' : ''}`}>
                                    <Link href="/categorias" className="flex items-center gap-2">
                                        <img
                                            src="/assets/icon/categorias.png"
                                            alt="Categorías"
                                            className="h-9 w-8"
                                        />
                                        Categorías
                                    </Link>
                                </li>
                            )}

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
