import LoginLayout from '@/layouts/LoginLayout';
import { useForm, usePage } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
export default function LoginPage() {

    const { flash, ruta } = usePage<{
        flash?: { title: string; message: string; icon: 'success' | 'error' },
        ruta: string;
    }>().props;
    console.log(ruta);
    const [mostrarContraseña, setMostrarContraseña] = useState(false);

    const alternarMostrarContraseña = () => {
        setMostrarContraseña(!mostrarContraseña);
    };

    const { data, setData, post } = useForm({
        usuario: '',
        password: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/login');
    };

    useEffect(() => {
        if (flash?.icon === 'success') {
            Swal.fire({
                title: flash.title,
                text: flash.message,
                icon: flash.icon,
                timer: 2500,
                showConfirmButton: false,
            }).then(() => {
                Inertia.visit(ruta);
            });
        } else if (flash?.icon === 'error') {
            Swal.fire({
                title: flash.title,
                text: flash.message,
                icon: flash.icon,
                timer: 2500,
                showConfirmButton: false,
            });
        }
    }, [flash]);

    const mostrar = <img src="/assets/icon/ver.png" alt="Mostrar" />;
    const ocultar = <img src="/assets/icon/no-ver.png" alt="Ocultar" />;

    return (
        <LoginLayout>
            <form
                className="mt-2 flex flex-col sm:mt-10"
                onSubmit={handleSubmit}
            >
                <label className="text-[22px]" htmlFor="usuario">
                    Usuario
                </label>
                <input
                    type="text"
                    id="usuario"
                    className="mb-4 rounded-[8px] border border-gray-300 bg-[#DADADA] p-3 outline-none focus:border-gray-400"
                    value={data.usuario}
                    placeholder="Usuario"
                    onChange={(e) => setData('usuario', e.target.value)}
                />
                <label className="text-[22px]" htmlFor="password">
                    Contraseña
                </label>
                <div className="relative">
                    <input
                        type={mostrarContraseña ? 'text' : 'password'}
                        id="password"
                        placeholder="Contraseña"
                        className="mb-5 min-w-full rounded-[8px] border border-gray-300 bg-[#DADADA] p-3 outline-none focus:border-gray-400"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <button
                        type="button"
                        className="absolute top-1/3 right-3 w-8 -translate-y-1/2"
                        tabIndex={-1}
                        onClick={alternarMostrarContraseña}
                    >
                        {mostrarContraseña ? mostrar : ocultar}
                    </button>
                </div>
                <div className="flex min-w-full justify-center">
                    <button
                        className="min-w-[60%] rounded-[8px] bg-[#0B0B0B] p-2 text-[22px] text-white transition duration-300 ease-in-out hover:-translate-y-1 hover:bg-[#282727]"
                        type="submit"
                    >
                        Iniciar Sesión
                    </button>
                </div>
            </form>
        </LoginLayout>
    );
}
