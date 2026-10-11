import { useState} from "react";
import { Usuario } from "../Interfaces/interfaceUsuario";
import { Cliente } from "../Interfaces/interfaceCliente";
import { useForm } from "@inertiajs/react";
import FormularioCliente from "../FormularioCliente/FromularioCliente";

type tipo = 'credito' | 'abono';

export default function FormularioCreditos({usuarios, clientes, tipo}: {usuarios?: Usuario[], clientes?: Cliente[], tipo: tipo}) {

    
    // Estado para el modal
    const [modalAbierto, setModalAbierto] = useState(false);
    

    const { data, setData, post, errors } = useForm<{
        cliente_id: number | null,
        usuario_id: number | null,
        monto: number | null,
        descripcion: string,
    }>({
        cliente_id: null,
        usuario_id: null,
        monto: null,
        descripcion: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(tipo === 'credito'){
            post('/creditos/guardar');
        }else{
            post('/creditos/abonoNuevo');
        }
    };

    //Transformar usuarios
    const usuariosTransformados = (usuarios || []).map((usuario) => ({
        id: usuario.id_usuario,
        nombre: usuario.usuario,
        tipo: 'Usuario',
        numero_telefono: undefined
    }));
    
    //Transformar clientes
    const clientesTransformados = (clientes || []).map((cliente) => ({
        id: cliente.id_cliente,
        nombre: `${cliente.nombre} ${cliente.apellido}`,
        numero_telefono: cliente.numero_telefono,
        tipo: 'Cliente'
    }));
    
    //Combinar ambos arrays
    const datos = [...usuariosTransformados, ...clientesTransformados];
    
    return (
        <div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-4 justify-center p-4 border border-gray-300 rounded w-full">
                    <button 
                        type="button" 
                        onClick={() => setModalAbierto(true)}
                        className="cursor-pointer mb-2 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition ease-in-out duration-300 hover:scale-105"
                    >
                        Agregar Cliente
                    </button>
                    <div className="flex flex-col mb-5 w-full">
                        <label htmlFor="lista">Seleccione un cliente: </label>
                        <select 
                            name="lista" 
                            id="lista"
                            className="w-full border rounded px-2 py-1"
                            onChange={(e) => {
                                if (e.target.value) {
                                    const selectedItem = JSON.parse(e.target.value);
                                    if (selectedItem.tipo === 'Usuario') {
                                        setData('usuario_id', selectedItem.id);
                                        setData('cliente_id', null);
                                    } else {
                                        setData('cliente_id', selectedItem.id);
                                        setData('usuario_id', null);
                                    }
                                }
                            }}
                        >
                            <option value="">-- Seleccione --</option>
                            {datos.map((item) => (
                                <option key={item.id} value={JSON.stringify(item)}>
                                    {item.tipo === 'Usuario' ? `${item.nombre}` : `${item.nombre} (Telefono: ${item.numero_telefono})`}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                
                <div className="flex flex-col">
                    <label htmlFor="Monto">Monto</label>
                    <input 
                        className="border" 
                        type="number" 
                        name="monto" 
                        value={data.monto ?? ''} 
                        onChange={(e) => setData('monto', e.target.value === '' ? null : Number(e.target.value))} 
                    />
                    {errors.monto && <span className="text-red-500">{errors.monto}</span>}
                </div>
                
                <div className="flex flex-col">
                    <label htmlFor="descripcion">Descripción</label>
                    <textarea 
                        className="border" 
                        name="descripcion" 
                        value={data.descripcion} 
                        onChange={(e) => setData('descripcion', e.target.value)}
                    ></textarea>
                    {errors.descripcion && <span className="text-red-500">{errors.descripcion}</span>}
                </div>
                
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" type="submit">
                    Guardar Crédito
                </button>
            </form>

            {/* Modal para agregar cliente */}
            <FormularioCliente 
                isOpen={modalAbierto}
                onClose={() => setModalAbierto(false)}
            />
        </div>
    );
}