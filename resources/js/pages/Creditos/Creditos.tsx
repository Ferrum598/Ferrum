import SistemaLayout from "@/layouts/SistemaLayout/SistemaLayout";
import TablaCreditos from "@/components/TablaCreditos/TablaCreditos";
import { router, Head } from "@inertiajs/react";
import '../../../css/datatable.css';
export default function Creditos({ usuarios, clientes}: { usuarios?: any, clientes?: any}) {
    return (
        <>
            <SistemaLayout>
            <Head title="Creditos" />
            <main className="flex flex-col w-full h-[90vh] mt-10 gap-3">
                <div className="w-full max-h-[75vh] overflow-auto">
                <TablaCreditos usuarios={usuarios} clientes={clientes} />
                </div>
                    <div className="flex justify-between">
                        <button onClick={() => router.get('/creditos/agregar')} className="cursor-pointer w-[30%] bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out hover:scale-105">
                            Agregar Crédito
                        </button>
                        <button onClick={() => router.get('/creditos/abonarCredito')} className="cursor-pointer w-[30%] bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out hover:scale-105">
                            Pagar Crédito
                        </button>
                        <button onClick={() => router.get('/creditos/abonarSaldo')} className="cursor-pointer w-[30%] bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out hover:scale-105">
                            Abonar Saldo
                        </button>
                    </div>
            </main>
            </SistemaLayout>
        </>
    );
}