import { useForm, usePage } from "@inertiajs/react";
import { useEffect } from "react";
import Swal from 'sweetalert2';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function FormularioCliente({ isOpen, onClose}: Props) {
    const { flash } = usePage<{ flash: { title: string; message: string; icon: 'success' | 'error' } }>().props;
 

    const { data, setData, post, errors, reset } = useForm<{
        nombre: string,
        apellido: string,
        numero_telefono: number | null,
    }>({
        nombre: '',
        apellido: '',
        numero_telefono: null,
    });

    // Detectar flash messages
    useEffect(() => {
        if (flash?.icon) {
            Swal.fire({
                title: flash.title,
                text: flash.message,
                icon: flash.icon,
                timer: 1500,
                showConfirmButton: false,
            }).then(() => {
                onClose();
                reset();
            });
        }

    }, [flash]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/creditos/crearCliente', {
            onError: (errors) => {
                // Mostrar errores de validación
                const errorMessages = Object.values(errors).join('\n');
                Swal.fire({
                    title: 'Error de validación',
                    text: errorMessages,
                    icon: 'error',
                    timer: 2000,
                    showConfirmButton: false,
                });
            }
        });
    }

    const handleClose = () => {
        onClose();
        reset();
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4">Agregar Nuevo Cliente</h2>
                
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col">
                        <label htmlFor="nombre">Nombre</label>
                        <input 
                            className="border p-2 rounded" 
                            type="text" 
                            name="nombre" 
                            value={data.nombre}
                            onChange={(e) => setData('nombre', e.target.value)}
                            required
                        />
                        {errors.nombre && <span className="text-red-500">{errors.nombre}</span>}
                    </div>
                    
                    <div className="flex flex-col">
                        <label htmlFor="apellido">Apellido</label>
                        <input 
                            className="border p-2 rounded" 
                            type="text" 
                            name="apellido" 
                            value={data.apellido}
                            onChange={(e) => setData('apellido', e.target.value)}
                            required
                        />
                        {errors.apellido && <span className="text-red-500">{errors.apellido}</span>}
                    </div>
                    
                    <div className="flex flex-col">
                        <label htmlFor="dpi">Numero de telefono</label>
                        <input 
                            className="border p-2 rounded" 
                            type="number" 
                            name="numero_telefono" 
                            value={data.numero_telefono ?? ''}
                            onChange={(e) => setData('numero_telefono', e.target.value === '' ? null : Number(e.target.value))}
                            required
                        />
                        {errors.numero_telefono && <span className="text-red-500">{errors.numero_telefono}</span>}
                    </div>
                    
                    <div className="flex gap-2 justify-end">
                        <button 
                            type="button"
                            onClick={handleClose}
                            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit"
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Guardar Cliente
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}