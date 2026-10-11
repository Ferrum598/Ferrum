import { useState,useEffect } from "react";
import DetallePedido from "../DetallePedido/DetallePedido";
import Swal from "sweetalert2";
import { router, usePage } from "@inertiajs/react";
export default function CardPedido({ pedido }: { pedido: any}) {

    const [mostrarDetalle, setMostrarDetalle] = useState(false);
    const [ocultarBotones, setOcultarBotones] = useState(false);

    const { flash } = usePage<{ flash: { icon: 'success' | 'error'; title: string; message: string } }>().props;
    useEffect(() => {
        if(pedido.estado !== 'pendiente') {
            setOcultarBotones(true);
        }
    }, [pedido.estado]);

    useEffect(() => {
        if (flash) {
            Swal.fire({
                icon: flash.icon,
                title: flash.title,
                text: flash.message,
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false,
            });
        }
    }, [flash]);

    const confirmarPedido = () => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir el pedido confirmado.",
            icon: 'warning',
            showCancelButton: true,
            showConfirmButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, confirmar pedido!'
        }).then((result) => {
            if (result.isConfirmed) {
                router.post('/pedidos/confirmar', { id_pedido: pedido.id_pedido });
            }
        });
    }
    
    const cancelarPedido = () => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir el pedido cancelado.",
            icon: 'warning',
            showCancelButton: true,
            showConfirmButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, cancelar pedido!'
        }).then((result) => {
            if (result.isConfirmed) {
                router.post('/pedidos/cancelar', { id_pedido: pedido.id_pedido });
            }
        });
    }

    return (
        <>
            <div className="h-[48vh] bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out hover:scale-[1.02] overflow-auto">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold">Pedido #{pedido.id_pedido}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            pedido.estado === 'pendiente' ? 'bg-yellow-200 text-yellow-800' :
                            pedido.estado === 'completado' ? 'bg-green-200 text-green-800' :
                            pedido.estado === 'cancelado' ? 'bg-red-200 text-red-800' :
                            'bg-gray-200 text-gray-800'
                        }`}>
                            {pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}
                        </span>
                    </div>
                    <div className="mt-2 space-y-1">
                        <p className="text-blue-100 text-sm">
                            <span className="font-medium">Cliente:</span> {pedido.usuario.usuario}
                        </p>
                        <p className="text-blue-100 text-sm">
                            <span className="font-medium">Fecha:</span> {new Date(pedido.fecha_pedido + 'T00:00:00').toLocaleDateString('es-ES', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                timeZone: 'America/Guatemala'
                            })}
                        </p>
                    </div>
                </div>
                <div className="p-4">
                    <h4 className="text-gray-800 font-semibold mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        Productos
                    </h4>
                    
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                        {pedido.pedido_productos.map((item: any) => (
                            <div key={item.id} className="bg-gray-50 rounded-lg p-3 border-l-4 border-blue-500 hover:bg-gray-100 transition-colors duration-200">
                                <div className="flex justify-between items-center">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-800">{item.producto.producto}</p>
                                        <p className="text-sm text-gray-600">Cantidad: {item.cantidad}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-green-600">{parseFloat(item.total).toLocaleString('en-US', { style: 'currency', currency: 'GTQ' })}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Total del Pedido:</span>
                        <span className="text-2xl font-bold text-green-600">
                            {parseFloat(pedido.total_pedido).toLocaleString('en-US', { style: 'currency', currency: 'GTQ' })}
                        </span>
                    </div>
                </div>
                <div className='p-4 bg-white border-t border-gray-100'>
                    <div className="flex gap-2">
                        <button onClick={() => setMostrarDetalle(true)} className="cursor-pointer flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200">
                            Ver Detalles
                        </button>
                        <button onClick={confirmarPedido} className={`${ocultarBotones ? 'hidden' : 'block'} cursor-pointer flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200`}>
                            Confirmar
                        </button>
                        <button onClick={cancelarPedido} className={`${ocultarBotones ? 'hidden' : 'block'} cursor-pointer flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200`}>
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Modal de detalle */}
                <DetallePedido 
                    pedido={pedido}
                    isOpen={mostrarDetalle}
                    onClose={() => setMostrarDetalle(false)}
                />
            </>
        );
};