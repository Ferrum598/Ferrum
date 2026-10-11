import SistemaLayout from "@/layouts/SistemaLayout/SistemaLayout";
import { Categoria } from "@/components/Interfaces/interfaceCategoria";
import FormularioCategorias from "@/components/FormularioCategorias/FormularioCategorias";
import TablaCategorias from "@/components/TablaCategorias/TablaCategorias";
import { Head } from "@inertiajs/react";

export default function Categorias({ categorias = [] }: { categorias: Categoria[] }) {
  return (
    <SistemaLayout>
      <Head title="Categorías" />
      <div className="w-full mx-auto px-6 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">Categorías</h1>
        </div>
            <FormularioCategorias />
            <TablaCategorias categorias={categorias} />
       </div>
    </SistemaLayout>
  );
}