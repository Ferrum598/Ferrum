import SistemaLayout from "@/layouts/SistemaLayout/SistemaLayout";
import { useEffect } from "react";
import Swal from "sweetalert2";
import { usePage,router } from "@inertiajs/react";
import FormularioCreditos from "@/components/FormularioCreditos/FormularioCreditos";
import { Usuario } from "@/components/Interfaces/interfaceUsuario";
import { Cliente } from "@/components/Interfaces/interfaceCliente";

export default function AgregarCredito({ usuarios, clientes }: { usuarios?: Usuario[], clientes?: Cliente[] }) {
    const { flash } = usePage<{ flash: { title: string; message: string; icon: 'success' | 'error' } }>().props;
    //Flash message 
        useEffect(() => {
            if (flash?.icon) {
                Swal.fire({
                    title: flash.title,
                    text: flash.message,
                    icon: flash.icon,
                    timer: 1500,
                    showConfirmButton: false,
                }).then(() => {
                    router.get('/creditos');
                });
            }
        }, [flash]);
    return (
        <SistemaLayout>
            <main className="flex flex-col items-center justify-center min-h-[80vh] px-2 sm:px-0 py-4 w-full">
                <div className="w-full max-w-lg bg-white rounded-lg shadow-md p-4 sm:p-8">
                    <FormularioCreditos usuarios={usuarios} clientes={clientes} tipo={'credito'} />
                </div>
            </main>
        </SistemaLayout>
    );
}
