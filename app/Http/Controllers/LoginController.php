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
            'usuario' => 'required|max:100',
            'password' => 'required|min:2',
        ]);

        if (Auth::attempt(['usuario' => $credentials['usuario'], 'password' => $credentials['password']])) {
            $request->session()->regenerate();
            $usuario = Auth::user();

            // El Administrador entra al dashboard; el resto, al punto de venta
            $ruta = $usuario->tienePermiso('dashboard') ? '/dashboard' : '/ventas';

            return Inertia::render('Login/Login')->with('ruta', $ruta)->with('flash', [
                'title' => 'Éxito',
                'icon' => 'success',
                'message' => 'login exitoso',
            ]);
        }

        return Inertia::render('Login/Login')->with('flash', [
            'title' => 'Error',
            'icon' => 'error',
            'message' => 'Usuario o contraseña incorrectos',
        ]);
    }

    public function cerrarSesion(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect()->route('home');
    }
}
