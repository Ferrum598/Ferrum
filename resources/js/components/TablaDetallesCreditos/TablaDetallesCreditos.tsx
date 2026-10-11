import DataTable from "react-data-table-component";
import '../../../css/datatable.css';

export default function TablaDetallesCreditos({ usuario, cliente }: { usuario?: any, cliente?: any }) {
    
    // Determinar si es usuario o cliente y obtener los datos correspondientes
    const esUsuario = usuario && !cliente;
    const esCliente = cliente && !usuario;
    
    let data = [];
    
    if (esUsuario) {
        // Datos para usuario
        data = (usuario?.creditos || []).map((credito: any) => ({
            nombre: usuario.usuario,
            monto: credito.monto?.toLocaleString('en-US', {style: 'currency', currency: 'GTQ'}),
            movimiento: credito.tipo_mov,
            descripcion: credito.descripcion,
            fecha: credito.fecha_mov,
        }));
    } else if (esCliente) {
        // Datos para cliente
        data = (cliente?.creditos || []).map((credito: any) => ({
            nombre: cliente.nombre,
            monto: credito.monto?.toLocaleString('en-US', {style: 'currency', currency: 'GTQ'}),
            movimiento: credito.tipo_mov,
            descripcion: credito.descripcion,
            fecha: credito.fecha_mov,
        }));
    }

    const columns = [
        { name: "Nombre", selector: (row: any) => row.nombre, sortable: true },
        { name: "Monto", selector: (row: any) => row.monto, sortable: true },
        { name: "Movimiento", selector: (row: any) => row.movimiento, sortable: true },
        { name: "Descripción", selector: (row: any) => row.descripcion, sortable: true },
        { name: "Fecha", selector: (row: any) => row.fecha, sortable: true },
    ];

    return (
        <div className="w-full h-full overflow-auto p-5">
            <h2 className="text-xl font-bold mb-4">
                {esUsuario && `Movimientos de: ${usuario.usuario}`}
                {esCliente && `Movimientos de: ${cliente.nombre}`}
            </h2>
            
            <DataTable
                columns={columns}
                data={data}
                pagination
                highlightOnHover
            />
        </div>
    );
}
