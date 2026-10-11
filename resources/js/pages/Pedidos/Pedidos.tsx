import CardPedido from "@/components/CardPedido/CardPedido";
import SistemaLayout from "@/layouts/SistemaLayout/SistemaLayout";
import { Head } from "@inertiajs/react";

const MensajeVacio = ({ tipo, icono }: { tipo: string, icono: React.ReactNode }) => (
    <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
        {icono}
        <h3 className="text-lg font-medium text-gray-600 mb-2">No hay pedidos {tipo}</h3>
        <p className="text-sm text-gray-500">
            {tipo === 'pendientes' ? 'Los nuevos pedidos aparecerán aquí cuando se realicen' :
             tipo === 'completados' ? 'Los pedidos completados aparecerán aquí' :
             'Los pedidos cancelados aparecerán aquí'}
        </p>
    </div>
);

export default function Pedidos({ pedidos }: { pedidos: any[] }) {
    
    const pedidosPendientes = pedidos.filter(pedido => pedido.estado === 'pendiente');
    const pedidosCompletados = pedidos.filter(pedido => pedido.estado === 'completado');
    const pedidosCancelados = pedidos.filter(pedido => pedido.estado === 'cancelado');

    const iconoPendiente = <svg className="w-16 h-16 mb-4 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    const iconoCompletado = <svg className="w-16 h-16 mb-4 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    const iconoCancelado = <svg className="w-16 h-16 mb-4 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

    return (
        <SistemaLayout>
            <Head title="Pedidos" />
            <div className="flex flex-col gap-6 mt-12 w-full p-5 h-full">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Pedidos Pendientes ({pedidosPendientes.length})</h1>
                    <div className="w-full min-h-[90vh] max-h-[90vh] border border-gray-200 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-scroll">
                        {pedidosPendientes.length > 0 ? 
                            pedidosPendientes.map(pedido => <CardPedido key={pedido.id_pedido} pedido={pedido}/>) :
                            <MensajeVacio tipo="pendientes" icono={iconoPendiente} />
                        }
                    </div>
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Pedidos Realizados ({pedidosCompletados.length})</h1>
                    <div className="w-full min-h-[90vh] max-h-[90vh] border border-gray-200 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-scroll">
                        {pedidosCompletados.length > 0 ? 
                            pedidosCompletados.map(pedido => <CardPedido key={pedido.id_pedido} pedido={pedido} />) :
                            <MensajeVacio tipo="completados" icono={iconoCompletado} />
                        }
                    </div>
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Pedidos Cancelados ({pedidosCancelados.length})</h1>
                    <div className="w-full min-h-[90vh] max-h-[90vh] border border-gray-200 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-scroll">
                        {pedidosCancelados.length > 0 ? 
                            pedidosCancelados.map(pedido => <CardPedido key={pedido.id_pedido} pedido={pedido} />) :
                            <MensajeVacio tipo="cancelados" icono={iconoCancelado} />
                        }
                    </div>
                </div>
            </div>
        </SistemaLayout>
    );
}
