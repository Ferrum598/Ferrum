import SistemaLayout from "@/layouts/SistemaLayout/SistemaLayout";
import { Head, usePage, useForm } from "@inertiajs/react";
import { Producto,ImagenProducto } from "@/components/Interfaces/interfaceCatalogo";
import {  useEffect, useState } from "react";
import '../../../css/datatable.css';
import DataTable from 'react-data-table-component';
import { Inertia } from "@inertiajs/inertia";
import Swal from "sweetalert2";
import FormularioCliente from "@/components/FormularioCliente/FromularioCliente";

interface CarritoProps {
    clientes: Array<{
        id_cliente: number;
        nombre: string;
    }>;
}

export default function Carrito({ clientes }: CarritoProps) {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [imagenes, setImagenes] = useState<ImagenProducto[]>([]);
    const [role, setRol] = useState<string>('');
    const [fechaProforma, setFechaProforma] = useState<string>('');
    const [ventaCredito, setVentaCredito] = useState<boolean>(false);
    const [listaClientes, setListaClientes] = useState<Array<{id_cliente: number; nombre: string;}>>(clientes);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [idClienteSeleccionado, setIdClienteSeleccionado] = useState<number | null>(null);

    const { flash, auth } = usePage<{ flash: { icon: 'success' | 'error'; title: string; message: string }, auth: { user: any } }>().props;
    const rol = auth.user?.rol;
    useEffect(() => {
        if (rol) {
            setRol(rol);
        }
    }, [rol]);

    useEffect(() => {
        setListaClientes(clientes);
    }, [clientes]);

    useEffect(() => {
        const cargarCarrito = () => {
            const productosGuardados = JSON.parse(localStorage.getItem("carrito") || "[]");
            setProductos(productosGuardados.map((item:any) => {return { ...item.producto, cantidad: item.cantidad }}));
            setImagenes(productosGuardados.map((item:any) => item.imagen));
        };
        cargarCarrito();
        const handleStorage = (e: StorageEvent) => {
            if (e.key === 'carrito') {
                cargarCarrito();
            }
        };
        window.addEventListener('storage', handleStorage);
        window.addEventListener('carrito-updated', cargarCarrito);
        return () => {
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('carrito-updated', cargarCarrito);
        };
    }, []);

    // Mostrar notificaciones de flash messages
    useEffect(() => {
        if (flash?.message) {
            Swal.fire({
                icon: flash.icon,
                title: flash.title,
                text: flash.message,
                timer: 1500,
                showConfirmButton: false,
            }).then(() => {
                cancelarCompra();
                Inertia.visit('/catalogo');
            });
        }
    }, [flash]);

    // Función para eliminar un producto del carrito
    const eliminarProducto = (id_produ: number) => {
       const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
       const nuevoCarrito = carrito.filter((item: any) => item.producto.id_producto !== productos[id_produ].id_producto);
       localStorage.setItem('carrito', JSON.stringify(nuevoCarrito));
       window.location.reload();
    }
    
    // Cancelar la compra
    const cancelarCompra = () => {
        localStorage.removeItem('carrito');
        setProductos([]);
        setImagenes([]);
        setFechaProforma('');
    }

    // Se transforman los datos para la tabla
    const dataCarrito = productos.map((producto, index) => ({
        id: index,
        id_producto: producto.id_producto,
        producto: producto.producto,
        descripcion: producto.descripcion,
        precio: `Q. ${producto.precio}`,
        cantidad: producto.cantidad,
        imagen: imagenes.find(img => img.id_imagen === producto.fk_id_imagen)?.imagen || '/assets/productos/no-hay-imagen.jpg',
    }));
    
    //Total
    const total = dataCarrito.reduce((acc: number, item: any) => acc + (item.cantidad * parseFloat(item.precio.replace('Q. ', '').replace(',', ''))), 0);

    //Función para validar fechas
    const validarFechas = () => {
        const hoy = new Date();
        const proforma = new Date(fechaProforma);

        // Validar que todas las fechas estén seleccionadas
        if (!fechaProforma) {
            Swal.fire({
                icon: 'warning',
                title: 'Fecha incompleta',
                text: 'Por favor seleccione la fecha requerida',
                timer: 2000,
                showConfirmButton: false,
            });
            return false;
        }

        // Validar que las fechas no sean anteriores a hoy
        /*if (proforma < hoy) {
            Swal.fire({
                icon: 'warning',
                title: 'Fechas inválida',
                text: 'Las fecha no puedenser anterior al día de hoy',
                timer: 2000,
                showConfirmButton: false,
            });
            return false;
        }*/

        return true;
    };

    // Función para enviar los datos al backend
    const datosEnviar = (datosPedido:any) => {
        if (datosPedido.length === 0) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No hay productos en el carrito',
                timer: 1500,
                showConfirmButton: false,
            }).then(() => {
                Inertia.visit('/catalogo');
            });
            return;
        }

        // Validar fechas antes de enviar
        if (role === 'Escuela') {
            if (!validarFechas()) {
                return;
            }
        }

        if (role === 'Administrador' && ventaCredito) {
             Inertia.post('/pedido/confirmarPedidoCredito', { 
                productos: datosPedido, 
                total_pedido: total,
                fecha_proforma: fechaProforma,
                id_cliente: idClienteSeleccionado,
            });
        } else {
            Inertia.post('/pedido/crearPedido', { 
                productos: datosPedido, 
                total_pedido: total,
                fecha_proforma: fechaProforma,

            });
        }
    }
    
    // Preparar los datos del pedido
    const datosPedido = productos.map((producto) => ({
        id_producto: producto.id_producto,
        cantidad: producto.cantidad,
        total: Number(producto.cantidad * parseFloat(String(producto.precio).replace('Q. ', '').replace(',', ''))),
    }));

    // Función para obtener fecha mínima (hoy)
    /*const getFechaMinima = () => {
        const hoy = new Date();
        return hoy.toISOString().split('T')[0];
    };*/
   
    const columns = [
        {
            name: 'Imagen',
            selector: (row: any) => row.imagen,
            cell: (row: any) => <img src={row.imagen} alt="imagen" />,
        },
        {
            name: 'Producto',
            selector: (row: any) => row.producto,
        },
        {
            name: 'Descripción',
            selector: (row: any) => row.descripcion,
        },
        {
            name: 'Precio',
            selector: (row: any) => {
                const precio = typeof row.precio === 'string'
                    ? parseFloat(row.precio.replace('Q. ', '').replace(',', ''))
                    : row.precio;
                return precio.toLocaleString('es-US', { style: 'currency', currency: 'GTQ' });
            },
        },
        {
            name: 'Cantidad',
            selector: (row: any) => row.cantidad,
            cell: (row: any) => {
                const [inputValue, setInputValue] = useState(row.cantidad.toString());
                useEffect(() => { setInputValue(row.cantidad.toString()); }, [row.cantidad]);
                return (
                    <input
                        type="number"
                        min={1}
                        value={inputValue}
                        onChange={e => {
                            setInputValue(e.target.value);
                        }}
                        onBlur={e => {
                            const val = e.target.value === '' ? '' : Number(e.target.value);
                            if (val === '' || val < 1) {
                                Swal.fire({
                                    icon: 'warning',
                                    title: 'Cantidad inválida',
                                    text: 'No se puede poner 0 o vacío. Debe ser al menos 1.',
                                    timer: 1500,
                                    showConfirmButton: false,
                                });
                                setInputValue('1');
                                setProductos(prev => prev.map((prod, idx) =>
                                    prod.id_producto === row.id_producto ? { ...prod, cantidad: 1 } : prod
                                ));
                                const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
                                carrito[row.id].cantidad = 1;
                                localStorage.setItem('carrito', JSON.stringify(carrito));
                            } else {
                                setProductos(prev => prev.map((prod, idx) =>
                                    prod.id_producto === row.id_producto ? { ...prod, cantidad: val } : prod
                                ));
                                const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
                                carrito[row.id].cantidad = val;
                                localStorage.setItem('carrito', JSON.stringify(carrito));
                            }
                        }}
                        className="w-16 border rounded px-2 py-1 text-center"
                    />
                );
            },
        },
        {
            name: 'Total',
            selector: (row: any) => {
                const precio = typeof row.precio === 'string'
                    ? parseFloat(row.precio.replace('Q. ', '').replace(',', ''))
                    : row.precio;
                const cantidad = row.cantidad;
                const total = precio * cantidad;
                return total.toLocaleString('es-US', { style: 'currency', currency: 'GTQ' });
            },
        },
        {
            name: 'Acciones',
            cell: (row: any) => (
                <button
                    onClick={() => eliminarProducto(row.id)}
                    className="bg-red-500 cursor-pointer text-white px-2 py-1 rounded hover:bg-red-600 text-xs sm:text-sm md:text-base w-full min-w-[70px] max-w-[120px] transition duration-200 ease-in-out hover:scale-105"
                    style={{ minWidth: 0 }}
                >
                    Eliminar
                </button>
            ),
            width: '120px',
        },
    ];

    //Seteo del estado de venta a crédito
    const hanndleVentaCreditoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setVentaCredito(e.target.checked);
    }

    useEffect(() => {
        const carrito = productos.map((prod, idx) => ({
            producto: { ...prod, cantidad: undefined },
            imagen: imagenes[idx],
            cantidad: prod.cantidad
        }));
        localStorage.setItem('carrito', JSON.stringify(carrito));
    }, [productos]);

    return (
        <SistemaLayout>
            <Head>
                <title>Carrito</title>
                <meta name="description" content="Página del carrito de compras" />
            </Head>
            <div className="flex w-[95%] justify-center p-6 min-h-[100%] flex-col gap-5">
                <div className={`bg-white p-6 rounded-lg shadow-md ${role === 'Escuela' ? '' : 'hidden'}`}>
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Información del Pedido</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className='flex flex-col'>
                            <label htmlFor="fechaProforma" className="mb-2 font-medium text-gray-700">
                                Fecha de Proforma <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="fechaProforma"
                                type="date"
                                value={fechaProforma}
                                //min={getFechaMinima()}
                                onChange={(e) => setFechaProforma(e.target.value)}
                                className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                </div>
                {/* Tabla de productos */}
                <div className="w-full max-h-[75vh] overflow-auto">
                    <DataTable
                        columns={columns}
                        data={dataCarrito}
                        pagination
                        paginationPerPage={10}
                        responsive
                        highlightOnHover
                    />
                </div>
                {/* Venta a crédito */}
                <div className={`flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center p-4 w-full max-w-[600px] mx-auto bg-white rounded-[12px] shadow-md border border-gray-200 mt-6 ${role === 'Administrador' ? '' : 'hidden'}`}>
                    <span className="font-bold text-gray-700 text-lg w-full sm:w-auto">Venta a Crédito</span>
                    <input
                        type="checkbox"
                        name="ventaCredito"
                        id="ventaCredito"
                        onChange={hanndleVentaCreditoChange}
                        className="w-5 h-5 accent-blue-600 cursor-pointer border border-gray-300 rounded self-start sm:self-center"
                    />
                    <select
                        name="usuariosCreditos"
                        id="usuariosCreditos"
                        className={`px-3 py-2 rounded-[8px] border border-gray-300 bg-gray-50 text-gray-700 font-medium shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full sm:w-auto ${ventaCredito ? '' : 'hidden'}`}
                        onChange={(e) => setIdClienteSeleccionado(Number(e.target.value))}
                    >
                        <option value="">Seleccione un cliente</option>
                        {listaClientes.map((cliente) => (
                            <option key={cliente.id_cliente} value={cliente.id_cliente}>
                                {cliente.nombre}
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        onClick={() => setModalAbierto(true)}
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition ease-in-out duration-300 hover:scale-105 w-full sm:w-auto"
                    >
                        Agregar Cliente
                    </button>
                    <FormularioCliente
                        isOpen={modalAbierto}
                        onClose={() => setModalAbierto(false)}
                    />
                </div>
                {/* Sección de total y botones */}
                <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-3 w-full">
                    <p className="bg-black text-white text-2xl p-3 rounded-2xl w-full md:w-auto text-center mb-2 md:mb-0">
                        Total: {total.toLocaleString('es-US', { style: 'currency', currency: 'GTQ' })}
                    </p>
                    <button 
                        onClick={cancelarCompra} 
                        className="bg-red-500 cursor-pointer text-white px-4 py-2 rounded hover:bg-red-600 h-[40px] w-full md:w-[30%] transition ease-in-out hover:scale-105 mb-2 md:mb-0"
                    >
                        Cancelar Compra
                    </button>
                    <button 
                        onClick={() => datosEnviar(datosPedido)} 
                        className="bg-green-500 cursor-pointer text-white px-4 py-2 rounded hover:bg-green-600 h-[40px] w-full md:w-[30%] transition ease-in-out hover:scale-105"
                    >
                        Enviar Pedido
                    </button>
                </div>
            </div>
        </SistemaLayout>
    );
}
