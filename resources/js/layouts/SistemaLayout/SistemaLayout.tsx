import BarraDeNavegacion from '@/components/ui/BarraDeNavegacion';

export default function SistemaLayout({children,}: {children: React.ReactNode;}) {
    return (
        <div className="flex h-screen w-full">
            {/* Botón hamburguesa fijo en móvil */}
            <div className="fixed top-0 left-0 z-[101] md:hidden pointer-events-auto p-2 print:hidden">
                <BarraDeNavegacion />
            </div>
            {/* Menú lateral: fixed en desktop, overlay absoluto y transparente en móvil */}
            <aside className="z-50 md:relative md:w-1/6 w-auto absolute md:block hidden print:hidden">
                <BarraDeNavegacion />
            </aside>
            {/* Contenido principal: margen izquierdo en desktop, full en móvil */}
            <main className="relative flex-1 flex flex-col md:ml-1/6 ml-0 transition-all duration-300 p-2 md:p-4 overflow-x-auto mt-12 md:mt-0 print:m-0 print:p-0">
                <div className="flex-1 w-full max-w-full">{children}</div>
            </main>
        </div>
    );
}
