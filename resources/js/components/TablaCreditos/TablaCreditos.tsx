import { router } from "@inertiajs/react";
import DataTable from "react-data-table-component";
import { useState } from "react";

export default function TablaCreditos({ usuarios, clientes}: { usuarios?: any, clientes?: any}) {

    // Estado para la búsqueda
        const [buscar, setBuscar] = useState('');

    // Transformar usuarios
    const dataUsuarios = (usuarios || []).map((credito: any) => {

        return {
            id: credito.id_usuario,
            tipo: 'Usuario',
            cliente: credito.usuario,
            apellido: '--',
            numero_telefono: 'N/A',
            deuda: Number(credito.total.deuda_total).toLocaleString('en-US', {style: 'currency', currency: 'GTQ'}),
            saldo: Number(credito.total.saldo_total).toLocaleString('en-US', {style: 'currency', currency: 'GTQ'}),
            acciones: (
                <button 
                    onClick={() => router.get('/creditos/detalles', { usuarioId: credito.id_usuario })} 
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer"
                >
                    Ver Detalles
                </button>
            )
        };
    });

    // Transformar clientes (con créditos también)
    const dataClientes = (clientes || []).map((cliente: any) => {
    
        return {
            id: cliente.id_cliente,
            tipo: 'Cliente',
            cliente: cliente.nombre,
            apellido: cliente.apellido,
            numero_telefono: cliente.numero_telefono,
            deuda: Number(cliente.total.deuda_total).toLocaleString('en-US', {style: 'currency', currency: 'GTQ'}),
            saldo: Number(cliente.total.saldo_total).toLocaleString('en-US', {style: 'currency', currency: 'GTQ'}),
            acciones: (
                <button 
                    onClick={() => router.get('/creditos/detalles', { clienteId: cliente.id_cliente })} 
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded cursor-pointer"
                >
                    Ver Detalles
                </button>
            )
        };
    });

    // Combina ambos arrays
    const data = [...dataUsuarios, ...dataClientes];

    // Filtro para la búsqueda
    const datosFiltrados = data.filter((item) =>
        item.cliente?.toLowerCase().includes(buscar.toLowerCase()) ||
        item.apellido?.toLowerCase().includes(buscar.toLowerCase()) ||
        item.tipo?.toLowerCase().includes(buscar.toLowerCase()) ||
        item.numero_telefono?.toLowerCase().includes(buscar.toLowerCase())
    );

    const columns = [
        { name: "Tipo", selector: (row: any) => row.tipo, sortable: true },
        { name: "Cliente", selector: (row: any) => row.cliente, sortable: true },
        { name: "Apellido", selector: (row: any) => row.apellido, sortable: true },
        { name: "Telefono", selector: (row: any) => row.numero_telefono, sortable: true },
        { name: "Saldo", selector: (row: any) => row.saldo, sortable: true },
        { name: "Deuda", selector: (row: any) => row.deuda, sortable: true },
        { name: "Acciones", selector: (row: any) => row.acciones, sortable: false },
    ];

    return (
        <>
            <div className="w-full p-2 md:p-4 mt-0">
                <input
                    type="text"
                    placeholder="Buscar cliente..."
                    value={buscar}
                    onChange={(e) => setBuscar(e.target.value)}
                    className="mb-3 w-full rounded border p-2"
                />
            </div>
            <div className="w-full p-2 md:p-5">
                {/* Solo móvil: scroll horizontal */}
                <div className="w-full max-h-[75vh] overflow-auto">
                    <DataTable
                        columns={columns}
                        data={datosFiltrados}
                        pagination
                        highlightOnHover
                    />
                </div>
                {/* Escritorio: tabla normal */}
                <div className="hidden md:block w-full">
                    <DataTable
                        columns={columns}
                        data={datosFiltrados}
                        pagination
                        highlightOnHover
                    />
                </div>
            </div>
        </>
    );
}
