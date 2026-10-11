import { usePage,useForm,router } from "@inertiajs/react";
import { useEffect, } from "react";
import Swal from 'sweetalert2';

export default function DetallePedido({ pedido, isOpen, onClose }: { 
    pedido: any, 
    isOpen: boolean, 
    onClose: () => void 
}) {
    if (!isOpen) return null;

    const calcularTotalPedido = () => {
        return pedido.pedido_productos.reduce((total: number, item: any) => {
            return total + parseFloat(item.total);
        }, 0);
    };

    const { post, errors, data, setData } = useForm<{
        fecha_facturacion: string;
        fecha_entrega: string;
    }>({
        fecha_facturacion: '',
        fecha_entrega: '',
    });

    const handleAsignarFechas = () => {
        post(`/pedido/asignarFechas/${pedido.id_pedido}`);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white relative">
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-3xl font-bold mb-2">Pedido #{pedido.id_pedido}</h2>
                            <div className="flex items-center space-x-4">
                                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                                    pedido.estado === 'pendiente' ? 'bg-yellow-200 text-yellow-800' :
                                    pedido.estado === 'completado' ? 'bg-green-200 text-green-800' :
                                    pedido.estado === 'cancelado' ? 'bg-red-200 text-red-800' :
                                    'bg-gray-200 text-gray-800'
                                }`}>
                                    {pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}
                                </span>
                            </div>
                        </div>
                        <div className="text-right mt-3">
                            <p className="text-blue-100 text-lg">Total del Pedido</p>
                            <p className="text-3xl font-bold">{calcularTotalPedido().toLocaleString('en-US', { style: 'currency', currency: 'GTQ' })}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/10 rounded-lg p-4">
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Información del Cliente</h3>
                            <div className="space-y-1">
                                <p className="text-blue-100">
                                    <span className="font-medium">Cliente:</span> {pedido.usuario.usuario}
                                </p>
                                 <p className="text-blue-100">
                                    <span className="font-medium">Fecha Entrega:</span> {pedido.fecha_entrega !== null ? (
                                        new Date(pedido.fecha_entrega + 'T00:00:00').toLocaleDateString('es-ES', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        timeZone: 'America/Guatemala'
                                    })
                                     ) : (
                                        <>
                                            <input
                                                type="date"
                                                className="ml-2 px-2 py-1 border border-gray-300 rounded"
                                                onChange={(e) => {
                                                    setData('fecha_entrega', e.target.value);
                                                }}
                                            />
                                        </>
                                    )}
                                </p>
                                 <p className="text-blue-100 flex items-center gap-2">
                                    <span className="font-medium">Fecha Faturación:</span>
                                    {pedido.fecha_facturacion !== null ? (
                                        new Date(pedido.fecha_facturacion + 'T00:00:00').toLocaleDateString('es-ES', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            timeZone: 'America/Guatemala'
                                        })
                                    ) : (
                                        <>
                                            <input
                                                type="date"
                                                className="ml-2 px-2 py-1 border border-gray-300 rounded"
                                                onChange={(e) => {
                                                    setData('fecha_facturacion', e.target.value);
                                                }}
                                            />
                                            <button
                                                type="button"
                                                className="ml-2 px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm"
                                                onClick={() => {handleAsignarFechas()}}
                                            >
                                                Asignar Fechas
                                            </button>
                                        </>
                                    )}
                                </p>
                                <p className="text-blue-100">
                                    <span className="font-medium">Fecha Proforma:</span> {pedido.proformas !== null ? new Date(pedido.proformas.fecha_proforma + 'T00:00:00').toLocaleDateString('es-ES', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        timeZone: 'America/Guatemala'
                                    }) : 'No disponible'}
                                </p>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Información del Pedido</h3>
                            <div className="space-y-1">
                                <p className="text-blue-100">
                                    <span className="font-medium">Fecha:</span> {new Date(pedido.fecha_pedido + 'T00:00:00').toLocaleDateString('es-ES', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        timeZone: 'America/Guatemala'
                                    })}
                                </p>
                                <p className="text-blue-100">
                                    <span className="font-medium">Productos:</span> {pedido.pedido_productos.length} artículos
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-6 max-h-[50vh] overflow-y-auto">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                        <svg className="w-7 h-7 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        Productos del Pedido
                    </h3>
                    
                    <div className="space-y-4">
                        {pedido.pedido_productos.map((item: any, index: number) => (
                            <div key={item.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center mb-3">
                                            <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full mr-3">
                                                #{index + 1}
                                            </span>
                                            <h4 className="text-xl font-bold text-gray-800">{item.producto.producto}</h4>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                            <div>
                                                <p className="font-medium text-gray-800">Cantidad Solicitada</p>
                                                <p className="text-2xl font-bold text-blue-600">{item.cantidad}</p>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">Precio Unitario</p>
                                                <p className="text-lg font-semibold text-gray-700">
                                                    {(parseFloat(item.total) / item.cantidad).toLocaleString('en-US', { style: 'currency', currency: 'GTQ' })}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">Subtotal</p>
                                                <p className="text-2xl font-bold text-green-600">{parseFloat(item.total).toLocaleString('en-US', { style: 'currency', currency: 'GTQ' })}</p>
                                            </div>
                                        </div>
                                        
                                       
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <div className="text-gray-600">
                            <p className="text-lg">Resumen del Pedido</p>
                            <p className="text-sm">{pedido.pedido_productos.length} productos • {pedido.pedido_productos.reduce((total: number, item: any) => total + item.cantidad, 0)} artículos</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600">Total a Pagar</p>
                            <p className="text-3xl font-bold text-green-600">{calcularTotalPedido().toLocaleString('en-US', { style: 'currency', currency: 'GTQ' })}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}