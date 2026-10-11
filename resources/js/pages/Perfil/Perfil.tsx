import SistemaLayout from "@/layouts/SistemaLayout/SistemaLayout";
import { useForm, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function Perfil({usuario, imagene}: {usuario: any, imagene: string | null}) {
    const {data,errors,setData,post} = useForm<{
        usuario: string, 
        direccion: string, 
        nit: string, 
        nit2: string, 
        telefono: string,
        imagen?: File | string | null
    }>({
        usuario: usuario.usuario || '',
        direccion: usuario.direccion || '',
        nit: usuario.nit || '',
        nit2: usuario.nit2 || '',
        telefono: usuario.telefono || '',
        imagen: undefined,
    });

    const { flash } = usePage<{ flash: { icon: 'success'| 'error'; message: string; title: string; } }>().props;
    const [previewImagen, setPreviewImagen] = useState<string | undefined>(undefined);

    useEffect(() => {
         if (!data.imagen) {
            setPreviewImagen(undefined);
            return;
        }
        const img = data.imagen;
        const preview =
            img && typeof img !== 'string' ? URL.createObjectURL(img) : img;
        setPreviewImagen(preview);
    }, [data.imagen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/perfil/actualizar', { forceFormData: true });
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

    return( 
        <>
        <SistemaLayout>
            <div className="w-[50%] m-auto pt-3 pb-5">
                <div className="bg-white shadow-md rounded-lg p-1 w-[80%] min-h-[80%] mx-auto mt-10">
                    <div className="flex gap-2 flex-col items-center">
                        <h1 className="text-2xl">Perfil de Usuario</h1>
                        <div className="mb-4 h-32 w-32 overflow-hidden rounded-full bg-gray-200 ">
                            <img
                                src={
                                    previewImagen
                                        ? previewImagen
                                        : imagene
                                        ? imagene
                                        : '/images/Avatar.jpg'
                                }
                                alt="Imagen de perfil"
                                className="object-cover w-32 h-32"
                            />
                        </div>
                        <form onSubmit={handleSubmit} className="mb-5">
                            <div className="flex flex-col gap-3">
            
                                <span className="font-bold">Imagen de perfil</span>
                                    <input 
                                    className="w-[300px] rounded-[10px] border border-gray-300 p-2" type="file"
                                    onChange={(e) => {
                                        setData('imagen', e.target.files?.[0] || null);
                                    }}
                                    />

                                <span className="font-bold">Usuario</span>
                                    <input className="w-[300px] rounded-[10px] border border-gray-300 p-2" 
                                    value={data.usuario} 
                                    onChange={(e) => {setData('usuario', e.target.value)}} />

                                <span className="font-bold">Dirección</span>
                                    <textarea className="w-[300px] rounded-[10px] border border-gray-300 p-2" 
                                    value={data.direccion} 
                                    onChange={(e) => {setData('direccion', e.target.value)}} />

                                <span className="font-bold">NIT</span>
                                    <input className="w-[300px] rounded-[10px] border border-gray-300 p-2" 
                                    value={data.nit} 
                                    onChange={(e) => {setData('nit', e.target.value)}} />  

                                <span className="font-bold">NIT2</span>
                                    <input className="w-[300px] rounded-[10px] border border-gray-300 p-2" 
                                    value={data.nit2} 
                                    onChange={(e) => {setData('nit2', e.target.value)}} />

                                <span className="font-bold">Teléfono</span>
                                    <input className="w-[300px] rounded-[10px] border border-gray-300 p-2" 
                                    value={data.telefono} 
                                    onChange={(e) => {setData('telefono', e.target.value)}} />
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