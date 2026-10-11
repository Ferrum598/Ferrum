<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\DashboardController;
use App\Http\Middleware\AccesoPagina;
use App\Http\Controllers\InventarioController;
use App\Http\Controllers\CatalogoController;
use App\Http\Controllers\PedidoController;
use App\Http\Controllers\CreditoController;
use App\Http\Controllers\ProformaController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\PerfilController;
use App\Http\Controllers\CarritoController;

Route::get('/', function () {
    return Inertia::render('Login/Login');
})->name('home');

Route::get('/SinAcceso', function () {
    return Inertia::render('SinAcceso/SinAcceso');
})->name('sinacceso');

// Rutas de autenticación
Route::post('/login', [LoginController::class, 'iniciarSesion'])->name('login');
Route::get('/logout', [LoginController::class, 'cerrarSesion'])->name('logout');

// Rutas solo para usuarios autenticados
Route::middleware(['acceso.pagina', 'validar.rol:Administrador,Empleado,Escuela'])->group(function () {

    Route::get('/carrito', [CarritoController::class, 'index'])->name('carrito.index');
    Route::get('/catalogo', [CatalogoController::class, 'index'])->name('catalogo.index');
    Route::post('/pedido/crearPedido', [PedidoController::class, 'crearPedido'])->name('pedido.crearPedido');
    Route::get('/perfil', [PerfilController::class, 'mostrarPerfil'])->name('perfil.index');
    Route::post('/perfil/actualizar', [PerfilController::class, 'actualizarPerfil'])->name('perfil.actualizar');
});

// ADMIN Y EMPLEADO
Route::middleware(['acceso.pagina', 'validar.rol:Administrador,Empleado'])->group(function () {
    Route::get('/pedidos', [PedidoController::class, 'index'])->name('pedidos.index');
    Route::post('/pedidos/confirmar', [PedidoController::class, 'confirmarPedido'])->name('pedidos.confirmar');
    Route::post('/pedidos/cancelar', [PedidoController::class, 'cancelarPedido'])->name('pedidos.cancelar');
    Route::post('/pedido/asignarFechas/{id}', [PedidoController::class, 'asignarFechas'])->name('pedidos.asignarFechas');
    Route::post('/pedido/confirmarPedidoCredito', [PedidoController::class, 'crearPedidoCredito'])->name('pedidos.confirmarPedidoCredito');
    Route::get('/creditos', [CreditoController::class, 'index'])->name('creditos.index');
    Route::get('/creditos/detalles', [CreditoController::class, 'detalles'])->name('creditos.detalles');
    Route::get('/creditos/agregar', [CreditoController::class, 'agregarCredito'])->name('creditos.agregar');
    Route::post('/creditos/guardar', [CreditoController::class, 'guardarCredito'])->name('creditos.guardar');
    Route::post('/creditos/crearCliente', [CreditoController::class, 'crearCliente'])->name('creditos.crearCliente');
    Route::get('/creditos/abonarCredito', [CreditoController::class, 'abonar'])->name('creditos.abonar');
    Route::post('/creditos/guardarAbono', [CreditoController::class, 'guardarAbono'])->name('creditos.guardarAbono');
    Route::get('/creditos/abonarSaldo', [CreditoController::class, 'AbonarSaldo'])->name('creditos.abonarSaldo');
    Route::post('/creditos/abonoNuevo', [CreditoController::class, 'abonoNuevo'])->name('creditos.abonoNuevo');

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/inventario', [InventarioController::class, 'index'])->name('inventario.index');
    Route::get('/inventario/editar', [InventarioController::class, 'editarDatos'])->name('inventario.editar');
    Route::post('/inventario/actualizar', [InventarioController::class, 'actualizar'])->name('inventario.actualizar');
    Route::post('/inventario/eliminar', [InventarioController::class, 'eliminar'])->name('inventario.eliminar');
    Route::post('/inventario/actualizarEstado', [InventarioController::class, 'actualizarEstado'])->name('inventario.actualizarEstado');
    Route::get('/inventario/agregar', [InventarioController::class, 'agregar'])->name('inventario.agregar');
    Route::post('/inventario/guardarProducto', [InventarioController::class, 'guardar'])->name('inventario.guardarProducto');

    Route::get('/proformas', [App\Http\Controllers\ProformaController::class, 'index'])->name('proformas.index');
});

//Admin
Route::middleware(['acceso.pagina', 'validar.rol:Administrador'])->group(function () {
    Route::get('/categorias', [CategoriaController::class, 'index'])->name('categorias.index');
    Route::post('/categorias/crear', [CategoriaController::class, 'create'])->name('categorias.create');
});
