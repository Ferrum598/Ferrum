<?php

namespace App\Http\Controllers;

use App\Models\ReporteGanancia;
use App\Services\ReportesService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReporteGananciaController extends Controller
{
    public function index()
    {
        return Inertia::render('Ganancias/Ganancias', [
            'reportes' => ReporteGanancia::with('detalleGastos.gasto')->orderByDesc('anio')->orderByDesc('mes')->get(),
        ]);
    }

    public function generar(Request $request, ReportesService $service)
    {
        $datos = $request->validate(['mes' => 'required|integer|min:1|max:12', 'anio' => 'required|integer|min:2000|max:2100']);
        $reporte = $service->generarReporteGanancias((int) $datos['mes'], (int) $datos['anio'], (int) $request->user()->getAuthIdentifier());
        return redirect()->route('reportes.ganancias.detalle', $reporte->getKey())->with('flash', [
            'title' => 'Reporte generado', 'icon' => 'success', 'message' => 'El reporte mensual de ganancias se guardó correctamente.',
        ]);
    }

    public function mostrar(ReporteGanancia $reporte)
    {
        return Inertia::render('Ganancias/Ganancias', ['reporteActual' => $reporte->load('detalleGastos.gasto')]);
    }

    public function eliminar(ReporteGanancia $reporte)
    {
        $reporte->delete();
        return redirect()->route('reportes.ganancias')->with('flash', [
            'title' => 'Reporte eliminado', 'icon' => 'success', 'message' => 'El reporte mensual se eliminó correctamente.',
        ]);
    }
}
