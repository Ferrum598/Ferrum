<?php

namespace App\Http\Controllers;

use App\Models\ReporteVenta;
use App\Services\ReportesService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReporteVentaController extends Controller
{
    public function index(Request $request)
    {
        $query = ReporteVenta::query()->orderByDesc('fecha_inicio');
        if ($request->filled('tipo')) {
            $query->where('tipo_periodo', $request->input('tipo'));
        }
        return Inertia::render('ReportesVentas/ReportesVentas', [
            'reportes' => $query->get(),
            'filtroTipo' => $request->input('tipo', ''),
        ]);
    }

    public function generar(Request $request, ReportesService $service)
    {
        $datos = $request->validate([
            'tipo_periodo' => 'required|in:diario,semanal,mensual,anual',
            'fecha' => 'required|date',
        ]);
        $reporte = $service->generarReporteVentas($datos['tipo_periodo'], \Carbon\Carbon::parse($datos['fecha']), (int) $request->user()->getAuthIdentifier());
        return redirect()->route('reportes.ventas.detalle', $reporte->getKey())->with('flash', [
            'title' => 'Reporte generado', 'icon' => 'success', 'message' => 'El reporte de ventas se guard? correctamente.',
        ]);
    }

    public function mostrar(ReporteVenta $reporte)
    {
        $ventas = \App\Models\Venta::with(['cliente', 'detalles.lote.producto', 'credito'])
            ->whereBetween('fecha_venta', [$reporte->fecha_inicio->toDateString().' 00:00:00', $reporte->fecha_fin->toDateString().' 23:59:59'])
            ->orderBy('fecha_venta')->get();
        return Inertia::render('ReportesVentas/ReportesVentas', ['reporteActual' => $reporte, 'ventasDetalle' => $ventas]);
    }

    public function regenerar(ReporteVenta $reporte, Request $request, ReportesService $service)
    {
        $actualizado = $service->generarReporteVentas($reporte->tipo_periodo, \Carbon\Carbon::parse($reporte->fecha_inicio), (int) $request->user()->getAuthIdentifier());
        return redirect()->route('reportes.ventas.detalle', $actualizado->getKey())->with('flash', [
            'title' => 'Reporte actualizado', 'icon' => 'success', 'message' => 'El reporte se regener? correctamente.',
        ]);
    }

    public function eliminar(ReporteVenta $reporte)
    {
        $reporte->delete();
        return redirect()->route('reportes.ventas')->with('flash', [
            'title' => 'Reporte eliminado', 'icon' => 'success', 'message' => 'El reporte se elimin? correctamente.',
        ]);
    }
}
