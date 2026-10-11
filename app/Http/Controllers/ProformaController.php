<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\Proforma;

class ProformaController extends Controller
{
    public function index()
    {
        $proformas = Proforma::with([
            'usuario',
            'pedido.productos'
        ])->get();

        // Transformar los datos para el frontend
        $proformas = $proformas->map(function ($proforma) {
            $pedido = $proforma->pedido;
            $productos = [];
            if ($pedido) {
                $productos = $pedido->productos->map(function ($producto) {
                    return [
                        'producto' => [
                            'producto' => $producto->producto,
                            'producto_plural' => $producto->producto_plural,
                            'precio' => $producto->precio,
                        ],
                        'cantidad' => $producto->pivot->cantidad ?? 0,
                        'total' => $producto->pivot->total ?? 0,
                    ];
                });
            }
            return [
                'id_proforma' => $proforma->id_proforma,
                'usuario' => $proforma->usuario ? [
                    // Si existe 'nombre', úsalo; si no, usa 'usuario' (nombre de usuario)
                    'nombre' => $proforma->usuario->nombre ?? $proforma->usuario->usuario,
                    'direccion' => $proforma->usuario->direccion,
                    'nit' => $proforma->usuario->nit,
                    'telefono' => $proforma->usuario->telefono,
                ] : null,
                'fecha_creacion' => $proforma->created_at ? $proforma->created_at->toDateString() : '',
                'fecha_proforma' => $proforma->fecha_proforma ? $proforma->fecha_proforma : '',
                'pedido' => $pedido ? [
                    'total' => $pedido->total_pedido,
                    'estado' => $pedido->estado,
                    'productos' => $productos,
                ] : null,
            ];
        });

        return Inertia::render('Facturacion/Facturacion', [
            'proformas' => $proformas
        ]);
    }
}
