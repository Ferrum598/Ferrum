<?php

namespace App\Http\Controllers;

use App\Models\DetalleReporteGasto;
use App\Models\GastoFijo;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GastoFijoController extends Controller
{
    public function index()
    {
        return Inertia::render('GastosFijos/GastosFijos', [
            'gastos' => GastoFijo::orderByDesc('activo')->orderBy('nombre')->get(),
            'totalMensual' => (float) GastoFijo::where('activo', true)->sum('monto'),
        ]);
    }

    public function store(Request $request)
    {
        $datos = $this->validar($request);
        $datos['fk_usuario'] = $request->user()->getAuthIdentifier();
        $datos['activo'] = $request->boolean('activo', true);
        GastoFijo::create($datos);
        return back()->with('flash', ['title' => 'Gasto agregado', 'icon' => 'success', 'message' => 'El gasto fijo se registr? correctamente.']);
    }

    public function update(Request $request, GastoFijo $gasto)
    {
        $datos = $this->validar($request);
        $datos['activo'] = $request->boolean('activo');
        $gasto->update($datos);
        return back()->with('flash', ['title' => 'Gasto actualizado', 'icon' => 'success', 'message' => 'Los datos del gasto se actualizaron correctamente.']);
    }

    public function destroy(GastoFijo $gasto)
    {
        if (DetalleReporteGasto::where('fk_gasto', $gasto->getKey())->exists()) {
            $gasto->update(['activo' => false]);
            $message = 'El gasto ya forma parte de un reporte y se desactiv? para conservar su historial.';
            $title = 'Gasto desactivado';
        } else {
            $gasto->delete();
            $message = 'El gasto fijo se elimin? correctamente.';
            $title = 'Gasto eliminado';
        }
        return back()->with('flash', ['title' => $title, 'icon' => 'success', 'message' => $message]);
    }

    private function validar(Request $request): array
    {
        return $request->validate([
            'nombre' => 'required|string|max:100',
            'descripcion' => 'nullable|string|max:255',
            'monto' => 'required|numeric|min:0',
        ]);
    }
}
