<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Cliente;
use Inertia\Inertia;

class CarritoController extends Controller
{
    public function index()
    {
        $clientes = Cliente::all();
        return Inertia::render('Carrito/Carrito', [
            'clientes' => $clientes,
        ]);
    }
}
