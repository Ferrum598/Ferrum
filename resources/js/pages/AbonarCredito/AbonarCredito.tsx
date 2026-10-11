import SistemaLayout from "@/layouts/SistemaLayout/SistemaLayout";
import FormularioAbonarCredito from "@/components/FormularioAbonarCredito/FormularioAbonarCredito";
import { Usuario } from "@/components/Interfaces/interfaceUsuario";
import { Cliente } from "@/components/Interfaces/interfaceCliente";
import Swal from "sweetalert2";
import { useEffect } from "react";
import { router, usePage } from "@inertiajs/react";
export default function AbonarCredito({ usuarios, clientes }: { usuarios?: Usuario[], clientes?: Cliente[] }) {
    const { flash } = usePage().props as { flash?: { title?: string; message?: string; icon?: 'success'|'error' } };
    useEffect(() => {
        if (flash) {
            Swal.fire({
                title: flash.title,
                text: flash.message,
                icon: flash.icon,
                showConfirmButton: false,
                timer: 2000,
            }).then(() => {
                router.visit('/creditos');
            });
        }
    }, [flash]);

    return (
        <SistemaLayout>
            <main className="flex flex-col items-center justify-center min-h-[80vh] px-2 sm:px-0 py-4 w-full">
                <div className="w-full max-w-lg bg-white rounded-lg shadow-md p-4 sm:p-8">
                    <FormularioAbonarCredito usuarios={usuarios} clientes={clientes} />
                </div>
            </main>
        </SistemaLayout>
    );
}
                   