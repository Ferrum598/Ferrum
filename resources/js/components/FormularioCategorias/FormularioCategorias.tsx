import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { Categoria } from '../Interfaces/interfaceCategoria';
import useFlashSwal from '../FlashSwal/useFlashSwal';

export default function FormularioCategorias({ editando, onCancelar }: { editando?: Categoria | null; onCancelar?: () => void }) {
    useFlashSwal();

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({ nombre_categoria: '' });

    useEffect(() => {
        setData('nombre_categoria', editando?.nombre_categoria ?? '');
        clearErrors();
    }, [editando]);

    const limpiar = () => {
        reset();
        onCancelar?.();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(editando ? `/categorias/${editando.id_categoria}/actualizar` : '/categorias/crear', {
            onSuccess: limpiar,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="w-full rounded-xl bg-white/80 p-6 shadow-lg ring-1 ring-slate-200 backdrop-blur md:p-8">
            <div className="grid grid-cols-1 gap-6">
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-slate-700">{editando ? 'Editar categoría' : 'Nombre de la categoría'}</label>
                    <input
                        className="rounded-lg border border-slate-300 p-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="text"
                        value={data.nombre_categoria}
                        onChange={(e) => setData('nombre_categoria', e.target.value)}
                        placeholder="Ej. Herramientas"
                    />
                    {errors.nombre_categoria && <span className="text-sm text-red-600">{errors.nombre_categoria}</span>}
                </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
                <button type="submit" disabled={processing} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-white hover:bg-blue-700 disabled:opacity-50">
                    {processing ? 'Guardando...' : editando ? 'Actualizar' : 'Guardar'}
                </button>
                <button type="button" onClick={limpiar} className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2.5 text-slate-700 hover:bg-slate-200">
                    {editando ? 'Cancelar' : 'Limpiar'}
                </button>
            </div>
        </form>
    );
}
