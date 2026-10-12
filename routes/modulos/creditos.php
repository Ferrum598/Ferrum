<?php

use App\Http\Controllers\ClienteController;
use App\Http\Controllers\CreditoController;
use Illuminate\Support\Facades\Route;

// Endpoints compactos usados por el punto de venta; deben preceder a /clientes/{cliente}.
Route::middleware('permiso:ventas,clientes')->group(function () {
    Route::get('/clientes/buscar', [ClienteController::class, 'buscar'])->name('clientes.buscar');
    Route::post('/clientes/rapido', [ClienteController::class, 'rapido'])->name('clientes.rapido');
});

Route::middleware('permiso:clientes')->group(function () {
    Route::get('/clientes', [ClienteController::class, 'index'])->name('clientes.index');
    Route::post('/clientes', [ClienteController::class, 'store'])->name('clientes.store');
    Route::patch('/clientes/{cliente}', [ClienteController::class, 'update'])->name('clientes.update');
    Route::delete('/clientes/{cliente}', [ClienteController::class, 'destroy'])->name('clientes.destroy');
    Route::get('/clientes/{cliente}/detalle', [ClienteController::class, 'detalle'])->name('clientes.detalle');
    Route::post('/clientes/{cliente}/abonar', [ClienteController::class, 'abonar'])->name('clientes.abonar');
});

Route::middleware('permiso:creditos')->group(function () {
    Route::get('/creditos', [CreditoController::class, 'index'])->name('creditos.index');
    Route::get('/creditos/{credito}', [CreditoController::class, 'show'])->name('creditos.show');
    Route::post('/creditos/{credito}/abonos', [CreditoController::class, 'abonar'])->name('creditos.abonos.store');
    Route::patch('/creditos/{credito}/vencimiento', [CreditoController::class, 'cambiarVencimiento'])->name('creditos.vencimiento');
});
