<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GastoFijoController;
use App\Http\Controllers\ReporteGananciaController;
use App\Http\Controllers\ReporteVentaController;
use Illuminate\Support\Facades\Route;

Route::middleware('permiso:dashboard')->get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

Route::middleware('permiso:reportes')->group(function () {
    Route::get('/reportes/ventas', [ReporteVentaController::class, 'index'])->name('reportes.ventas');
    Route::post('/reportes/ventas/generar', [ReporteVentaController::class, 'generar'])->name('reportes.ventas.generar');
    Route::get('/reportes/ventas/{reporte}', [ReporteVentaController::class, 'mostrar'])->name('reportes.ventas.detalle');
    Route::post('/reportes/ventas/{reporte}/regenerar', [ReporteVentaController::class, 'regenerar'])->name('reportes.ventas.regenerar');
    Route::delete('/reportes/ventas/{reporte}', [ReporteVentaController::class, 'eliminar'])->name('reportes.ventas.eliminar');

    Route::get('/reportes/ganancias', [ReporteGananciaController::class, 'index'])->name('reportes.ganancias');
    Route::post('/reportes/ganancias/generar', [ReporteGananciaController::class, 'generar'])->name('reportes.ganancias.generar');
    Route::get('/reportes/ganancias/{reporte}', [ReporteGananciaController::class, 'mostrar'])->name('reportes.ganancias.detalle');
    Route::delete('/reportes/ganancias/{reporte}', [ReporteGananciaController::class, 'eliminar'])->name('reportes.ganancias.eliminar');
});

Route::middleware('permiso:gastos')->group(function () {
    Route::get('/gastos-fijos', [GastoFijoController::class, 'index'])->name('gastos.index');
    Route::post('/gastos-fijos', [GastoFijoController::class, 'store'])->name('gastos.store');
    Route::put('/gastos-fijos/{gasto}', [GastoFijoController::class, 'update'])->name('gastos.update');
    Route::delete('/gastos-fijos/{gasto}', [GastoFijoController::class, 'destroy'])->name('gastos.destroy');
});
