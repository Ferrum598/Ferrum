<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;


class LoginController extends Controller
{
    public function iniciarSesion(Request $request)
    {
        $credentials = $request->validate([
            'usuario' => 'required|max:50',
            'password' => 'required|min:2',
        ]);
        try {
            //Intentar autenticar al usuario
             $loginExitoso = Auth::attempt([
                'nit' => $credentials['usuario'],
                'password' => $credentials['password'],
            ]) || Auth::attempt([
                'nit2' => $credentials['usuario'],
                'password' => $credentials['password'],
            ]);
            if ($loginExitoso) {
                $request->session()->regenerate(); // Cambia el ID de sesión
                $usuario = Auth::user()->load('rol');

                 $ruta = match($usuario->rol->rol) {
                    'Administrador' => '/dashboard',
                    'Empleado' => '/pedidos',
                    'Escuela' => '/catalogo',
                    default => '/catalogo'
                 };

                return Inertia::render('Login/Login')->with('ruta', $ruta)->with('flash', [
                    'title' => 'Éxito',
                    'icon' => 'success',
                    'message' => 'login exitoso'
                ]);
            }
            // Si la autenticación falla
        } catch (\Exception $e) {
            return Inertia::render('Login/Login')->with('flash', [
                'title' => 'Error',
                'icon' => 'error',
                'message' => 'Error al iniciar sesión'
            ]);
        }
    }
    public function cerrarSesion(Request $request)
    {
        //Cerrar sesión
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect()->route('home');
    }
}
