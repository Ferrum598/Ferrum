<?php

// Rutas del módulo ventas (se incluyen dentro del grupo 'acceso.pagina' de routes/web.php)

use App\Http\Controllers\ComprobanteController;
use App\Http\Controllers\CotizacionController;
use App\Http\Controllers\VentaController;
use Illuminate\Support\Facades\Route;

Route::middleware('permiso:ventas')->prefix('ventas')->name('ventas.')->group(function () {
    Route::get('/', [VentaController::class, 'index'])->name('index');
    Route::get('/historial', [VentaController::class, 'historial'])->name('historial');
    Route::get('/buscar', [VentaController::class, 'buscar'])->name('buscar');
    Route::get('/imagen/{id}', [VentaController::class, 'imagen'])->whereNumber('id')->name('imagen');
    Route::get('/codigo/{codigo}', [VentaController::class, 'porCodigo'])->where('codigo', '.+')->name('codigo');
    Route::post('/', [VentaController::class, 'store'])->name('store');
});

Route::middleware('permiso:comprobantes')->prefix('comprobantes')->name('comprobantes.')->group(function () {
    Route::get('/', [ComprobanteController::class, 'index'])->name('index');
    Route::get('/{id}', [ComprobanteController::class, 'show'])->whereNumber('id')->name('show');
    Route::post('/{id}/anular', [ComprobanteController::class, 'anular'])->whereNumber('id')->name('anular');
    Route::post('/{id}/impreso', [ComprobanteController::class, 'impreso'])->whereNumber('id')->name('impreso');
});

// Cotizaciones: comparten el permiso de ventas
Route::middleware('permiso:ventas')->prefix('cotizaciones')->name('cotizaciones.')->group(function () {
    Route::get('/', [CotizacionController::class, 'index'])->name('index');
    Route::get('/crear', [CotizacionController::class, 'create'])->name('create');
    Route::get('/productos', [CotizacionController::class, 'buscarProductos'])->name('productos');
    Route::post('/', [CotizacionController::class, 'store'])->name('store');
    Route::get('/{id}', [CotizacionController::class, 'show'])->whereNumber('id')->name('show');
    Route::delete('/{id}', [CotizacionController::class, 'destroy'])->whereNumber('id')->name('destroy');
});
