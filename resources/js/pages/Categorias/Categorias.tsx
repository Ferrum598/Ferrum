import SistemaLayout from '@/layouts/SistemaLayout/SistemaLayout';
import { Categoria } from '@/components/Interfaces/interfaceCategoria';
import FormularioCategorias from '@/components/FormularioCategorias/FormularioCategorias';
import TablaCategorias from '@/components/TablaCategorias/TablaCategorias';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

export default function Categorias({ categorias = [] }: { categorias: Categoria[] }) {
    const [editando, setEditando] = useState<Categoria | null>(null);

    return (
        <SistemaLayout>
            <Head title="Categorías" />
            <div className="mx-auto w-full space-y-6 px-6 py-8">
                <h1 className="bg-gradient-to-r from-slate-900 to-blue-700 bg-clip-text text-3xl font-extrabold text-transparent">🏷️ Categorías</h1>
                <FormularioCategorias editando={editando} onCancelar={() => setEditando(null)} />
                <TablaCategorias categorias={categorias} onEditar={(c) => { setEditando(c); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
            </div>
        </SistemaLayout>
    );
}
