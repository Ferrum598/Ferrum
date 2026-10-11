import { useForm, usePage } from "@inertiajs/react";
import { useEffect } from "react";
import Swal from "sweetalert2";
export default function FormularioCategorias() {

    const { flash } = usePage<{ flash: {title: string; message: string; icon: 'success' | 'error'} }>().props;
    useEffect(() => {
        if (flash?.icon) {
            Swal.fire({
                icon: flash.icon,
                title: flash.title,
                text: flash.message,
                showConfirmButton: false,
                timer: 2000,
            });
        }
    }, [flash]);

    const { data, setData, post, processing, errors, reset } = useForm<{
        categoria: string;
        descripcion: string;
      }>( {
        categoria: "",
        descripcion: "",
      });
    
      const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post("/categorias/crear", {
          onSuccess: () => reset(),
        });
      };
    return (
        <>
            <form
            onSubmit={handleSubmit}
            className="w-full bg-white/80 backdrop-blur rounded-xl shadow-lg ring-1 ring-slate-200 p-6 md:p-8"
            >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">Nombre de la categoría</label>
                <input
                    className="border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    type="text"
                    value={data.categoria}
                    onChange={(e) => setData("categoria", e.target.value)}
                    placeholder="Ej. Útiles Escolares"
                />
                {errors.categoria && <span className="text-sm text-red-600">{errors.categoria}</span>}
                </div>

                <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-sm font-medium text-slate-700">Descripción</label>
                <textarea
                    className="border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    value={data.descripcion}
                    onChange={(e) => setData("descripcion", e.target.value)}
                    placeholder="Descripción breve de la categoría"
                />
                {errors.descripcion && <span className="text-sm text-red-600">{errors.descripcion}</span>}
                </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
                <button
                type="submit"
                disabled={processing}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                {processing ? "Guardando..." : "Guardar"}
                </button>
                <button
                type="button"
                onClick={() => reset()}
                className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2.5 rounded-lg hover:bg-slate-200"
                >
                Limpiar
                </button>
            </div>
            </form>
        </>
    );
}