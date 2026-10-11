import SistemaLayout from "@/layouts/SistemaLayout/SistemaLayout";
import TablaDetallesCreditos from "@/components/TablaDetallesCreditos/TablaDetallesCreditos";
export default function DetallesCreditos({usuario, cliente}: {usuario?: any, cliente?: any}) {
    return (
        <>
            <SistemaLayout>
                <main className="flex flex-col w-full h-[90vh] mt-10 gap-3">
                    <TablaDetallesCreditos usuario={usuario} cliente={cliente} />
                </main>
            </SistemaLayout>
        </>
    );
}