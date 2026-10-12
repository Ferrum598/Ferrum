<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class ValidarPermiso
{
    /**
     * Permite el acceso solo si el rol del usuario tiene alguno de los permisos indicados.
     */
    public function handle(Request $request, Closure $next, ...$permisos): Response
    {
        $usuario = Auth::user();

        if (!$usuario) {
            return redirect()->route('home')->with('flash', [
                'title' => 'Acceso Denegado',
                'icon' => 'error',
                'message' => 'Debe iniciar sesión para acceder a esta página.',
            ]);
        }

        foreach ($permisos as $permiso) {
            if ($usuario->tienePermiso($permiso)) {
                return $next($request);
            }
        }

        if ($request->expectsJson()) {
            return response()->json(['message' => 'No tiene permisos para esta acción.'], 403);
        }

        return redirect()->back()->with('flash', [
            'title' => 'Acceso Denegado',
            'icon' => 'error',
            'message' => 'No tiene permisos para acceder a esta página.',
        ]);
    }
}
