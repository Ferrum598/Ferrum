<?php

use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\CodigoBarraController;
use App\Http\Controllers\InventarioController;
use Illuminate\Support\Facades\Route;

// Rutas del módulo inventario (se incluyen dentro del grupo 'acceso.pagina' de routes/web.php)

Route::middleware('permiso:inventario')->prefix('inventario')->group(function () {
    Route::get('/', [InventarioController::class, 'index'])->name('inventario.index');
    Route::get('/ids', [InventarioController::class, 'idsProductos'])->name('inventario.ids');
    Route::get('/imprimir', [InventarioController::class, 'imprimir'])->name('inventario.imprimir');
    Route::post('/imprimir/datos', [InventarioController::class, 'datosImpresion'])->name('inventario.imprimir.datos');
    Route::get('/agregar', [InventarioController::class, 'crear'])->name('inventario.crear');
    Route::post('/guardar', [InventarioController::class, 'guardar'])->name('inventario.guardar');
    Route::get('/{producto}/editar', [InventarioController::class, 'editar'])->whereNumber('producto')->name('inventario.editar');
    Route::post('/{producto}/actualizar', [InventarioController::class, 'actualizar'])->whereNumber('producto')->name('inventario.actualizar');
    Route::post('/{producto}/eliminar', [InventarioController::class, 'eliminar'])->whereNumber('producto')->name('inventario.eliminar');

    Route::post('/{producto}/descuentos', [InventarioController::class, 'guardarDescuento'])->whereNumber('producto')->name('descuentos.guardar');
    Route::delete('/descuentos/{descuento}', [InventarioController::class, 'eliminarDescuento'])->whereNumber('descuento')->name('descuentos.eliminar');
    Route::get('/{producto}/lotes/agregar', [InventarioController::class, 'crearLote'])->whereNumber('producto')->name('lotes.crear');
    Route::post('/{producto}/lotes', [InventarioController::class, 'guardarLote'])->whereNumber('producto')->name('lotes.guardar');
    Route::post('/lotes/{lote}/stock', [InventarioController::class, 'agregarStockLote'])->whereNumber('lote')->name('lotes.stock');
    Route::get('/lotes/{lote}/editar', [InventarioController::class, 'editarLote'])->whereNumber('lote')->name('lotes.editar');
    Route::post('/lotes/{lote}/actualizar', [InventarioController::class, 'actualizarLote'])->whereNumber('lote')->name('lotes.actualizar');
});

Route::middleware('permiso:categorias')->prefix('categorias')->group(function () {
    Route::get('/', [CategoriaController::class, 'index'])->name('categorias.index');
    Route::post('/crear', [CategoriaController::class, 'crear'])->name('categorias.crear');
    Route::post('/{categoria}/actualizar', [CategoriaController::class, 'actualizar'])->whereNumber('categoria')->name('categorias.actualizar');
    Route::post('/{categoria}/eliminar', [CategoriaController::class, 'eliminar'])->whereNumber('categoria')->name('categorias.eliminar');
});

Route::middleware('permiso:codigos_barras')->prefix('codigos-barras')->group(function () {
    Route::get('/', [CodigoBarraController::class, 'index'])->name('codigos.index');
    Route::post('/generar', [CodigoBarraController::class, 'generar'])->name('codigos.generar');
    Route::get('/imprimir', [CodigoBarraController::class, 'imprimir'])->name('codigos.imprimir');
    Route::post('/imprimir/registrar', [CodigoBarraController::class, 'registrarImpresion'])->name('codigos.registrar-impresion');
    Route::post('/{codigo}/estado', [CodigoBarraController::class, 'cambiarEstado'])->whereNumber('codigo')->name('codigos.estado');
});
