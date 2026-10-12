import SistemaLayout from "@/layouts/SistemaLayout/SistemaLayout";
import { useForm, usePage } from "@inertiajs/react";
import { useEffect } from "react";
import Swal from "sweetalert2";

export default function Perfil({usuario}: {usuario: {nombre: string, apellido: string, usuario: string}}) {
    const {data,errors,setData,post} = useForm({
        nombre: usuario.nombre || '',
        apellido: usuario.apellido || '',
        usuario: usuario.usuario || '',
        password: '',
        password_confirmation: '',
    });

    const { flash } = usePage<{ flash: { icon: 'success'| 'error'; message: string; title: string; } }>().props;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/perfil/actualizar');
    };

    useEffect(() => {
        if (flash) {
            Swal.fire({
                icon: flash.icon,
                title: flash.title,
                text: flash.message,
                timer: 3000,
                showConfirmButton: false,
            });
        }
    }, [flash]);

    const clase = "w-[300px] rounded-[10px] border border-gray-300 p-2";

    return(
        <>
        <SistemaLayout>
            <div className="w-[50%] m-auto pt-3 pb-5">
                <div className="bg-white shadow-md rounded-lg p-1 w-[80%] min-h-[80%] mx-auto mt-10">
                    <div className="flex gap-2 flex-col items-center">
                        <h1 className="text-2xl">Perfil de Usuario</h1>
                        <div className="mb-4 h-32 w-32 overflow-hidden rounded-full bg-gray-200 ">
                            <img src="/images/Avatar.jpg" alt="Imagen de perfil" className="object-cover w-32 h-32" />
                        </div>
                        <form onSubmit={handleSubmit} className="mb-5">
                            <div className="flex flex-col gap-3">
                                <span className="font-bold">Nombre</span>
                                <input className={clase} value={data.nombre} onChange={(e) => setData('nombre', e.target.value)} />
                                {errors.nombre && <span className="text-red-600 text-sm">{errors.nombre}</span>}

                                <span className="font-bold">Apellido</span>
                                <input className={clase} value={data.apellido} onChange={(e) => setData('apellido', e.target.value)} />
                                {errors.apellido && <span className="text-red-600 text-sm">{errors.apellido}</span>}

                                <span className="font-bold">Usuario</span>
                                <input className={clase} value={data.usuario} onChange={(e) => setData('usuario', e.target.value)} />
                                {errors.usuario && <span className="text-red-600 text-sm">{errors.usuario}</span>}

                                <span className="font-bold">Nueva contraseña</span>
                                <input type="password" className={clase} placeholder="Dejar vacío para no cambiarla" value={data.password} onChange={(e) => setData('password', e.target.value)} />
                                {errors.password && <span className="text-red-600 text-sm">{errors.password}</span>}

                                <span className="font-bold">Confirmar contraseña</span>
                                <input type="password" className={clase} value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} />

                                <button type="submit" className=" cursor-pointer mt-4 bg-blue-500 text-white rounded-[10px] p-2 transform duration-300 ease-in-out hover:bg-blue-600 hover:scale-105 hover:shadow-lg hover:-translate-y-1">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </SistemaLayout>
        </>
    );
}
