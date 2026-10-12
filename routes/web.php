<?php

use App\Http\Controllers\LoginController;
use App\Http\Controllers\PerfilController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Login/Login');
})->name('home');

Route::get('/SinAcceso', function () {
    return Inertia::render('SinAcceso/SinAcceso');
})->name('sinacceso');

// Autenticación
Route::post('/login', [LoginController::class, 'iniciarSesion'])->name('login');
Route::get('/logout', [LoginController::class, 'cerrarSesion'])->name('logout');

// Rutas solo para usuarios autenticados
Route::middleware('acceso.pagina')->group(function () {
    Route::get('/perfil', [PerfilController::class, 'mostrarPerfil'])->name('perfil.index');
    Route::post('/perfil/actualizar', [PerfilController::class, 'actualizarPerfil'])->name('perfil.actualizar');

    // Cada módulo protege sus rutas con el middleware 'permiso:<tipo_permiso>'
    require __DIR__ . '/modulos/inventario.php';  // inventario, lotes, categorías, códigos de barras
    require __DIR__ . '/modulos/ventas.php';      // punto de venta, historial, comprobantes
    require __DIR__ . '/modulos/creditos.php';    // clientes, créditos, abonos
    require __DIR__ . '/modulos/reportes.php';    // dashboard, reportes de ventas/ganancias, gastos fijos
});
