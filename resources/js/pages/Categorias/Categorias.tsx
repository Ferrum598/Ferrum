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
            <div className="mx-auto w-full space-y-8 px-6 py-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-slate-900">Categorías</h1>
                </div>
                <FormularioCategorias editando={editando} onCancelar={() => setEditando(null)} />
                <TablaCategorias categorias={categorias} onEditar={(c) => { setEditando(c); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
            </div>
        </SistemaLayout>
    );
}
