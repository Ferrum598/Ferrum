<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class ValidarRol
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        // Verificar si el usuario está autenticado
        if (!Auth::check()) {
            return redirect()->route('home')->with('flash', [
                'title' => 'Acceso Denegado',
                'icon' => 'error',
                'message' => 'Debe iniciar sesión para acceder a esta página.'
            ]);
        }

        $usuario = Auth::user();

        //Cargar el usuario con la relación rol
        $usuario = Auth::user()->load('rol');


        // Verificar si el usuario tiene uno de los roles permitidos
        if (!in_array($usuario->rol->rol, $roles)) {
            return redirect()->back()->with('flash', [
                'title' => 'Acceso Denegado',
                'icon' => 'error',
                'message' => 'No tiene permisos para acceder a esta página.'
            ]);
        }

        return $next($request);
    }
}