<?php

// Administración de usuarios, roles y permisos (solo el rol Administrador)

use App\Http\Controllers\RolController;
use App\Http\Controllers\UsuarioController;
use Illuminate\Support\Facades\Route;

Route::middleware('validar.rol:Administrador')->group(function () {
    Route::get('/usuarios', [UsuarioController::class, 'index'])->name('usuarios.index');
    Route::post('/usuarios', [UsuarioController::class, 'store'])->name('usuarios.store');
    Route::put('/usuarios/{usuario}', [UsuarioController::class, 'update'])->whereNumber('usuario')->name('usuarios.update');
    Route::delete('/usuarios/{usuario}', [UsuarioController::class, 'destroy'])->whereNumber('usuario')->name('usuarios.destroy');

    Route::post('/roles', [RolController::class, 'store'])->name('roles.store');
    Route::put('/roles/{rol}', [RolController::class, 'update'])->whereNumber('rol')->name('roles.update');
    Route::delete('/roles/{rol}', [RolController::class, 'destroy'])->whereNumber('rol')->name('roles.destroy');
});
