<?php

namespace App\Http\Controllers;

use App\Models\Credito;
use Inertia\Inertia;
use App\Models\Cliente;
use App\Models\Usuario;
use App\Models\Total;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CreditoController extends Controller
{
    function index()
    {
        $usuarios = Usuario::with(['creditos','total'])->whereHas('creditos')->get();
        $clientes = Cliente::with(['creditos','total'])->whereHas('creditos')->get();
        return Inertia::render('Creditos/Creditos', [
            'usuarios' => $usuarios,
            'clientes' => $clientes,
        ]);
    }
    function detalles(Request $request)
    {
        try {
            $usuarioId = $request->input('usuarioId');
            $clienteId = $request->input('clienteId');

            if ($usuarioId) {
                $usuario = Usuario::with('creditos')->findOrFail($usuarioId);
                return Inertia::render('DetallesCreditos/DetallesCreditos', [
                    'usuario' => $usuario,
                    'cliente' => null,
                ]);
            } else if ($clienteId) {
                $cliente = Cliente::with('creditos')->findOrFail($clienteId);
                return Inertia::render('DetallesCreditos/DetallesCreditos', [
                    'usuario' => null,
                    'cliente' => $cliente,
                ]);
            }
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Error al obtener los detalles']);
        }
    }
    function agregarCredito()
    {
        $usuarios = Usuario::all();
        $clientes = Cliente::all();
        return Inertia::render('AgregarCredito/AgregarCredito', [
            'usuarios' => $usuarios,
            'clientes' => $clientes,
        ]);
    }
    function guardarCredito(Request $request)
    {
        $data = $request->validate([
            'usuario_id' => 'nullable|exists:usuarios,id_usuario',
            'cliente_id' => 'nullable|exists:clientes,id_cliente',
            'monto' => 'required|numeric|min:0.01',
            'descripcion' => 'required|string|max:100',
        ], [
            'usuario_id.exists' => 'El usuario seleccionado no es válido.',
            'cliente_id.exists' => 'El cliente seleccionado no es válido.',
            'monto.required' => 'El monto es obligatorio.',
            'monto.numeric' => 'El monto debe ser un número válido.',
            'monto.min' => 'El monto debe ser al menos 0.01.',
            'descripcion.required' => 'La descripción es obligatoria.',
            'descripcion.string' => 'La descripción debe ser una cadena de texto.',
            'descripcion.max' => 'La descripción no debe exceder los 100 caracteres.',
        ]);

        try {
            DB::beginTransaction();
            if (!$data['usuario_id']) {

                $cliente = Cliente::find($data['cliente_id']);
                $totalEncontrado = Total::where('id_total', $cliente->fk_id_total)->first();
                
                if (!$totalEncontrado) {
                    $totalEncontrado = new Total();
                    $totalEncontrado->saldo_total = 0;
                    $totalEncontrado->deuda_total = 0;
                    $totalEncontrado->save();
                    
                    $cliente->fk_id_total = $totalEncontrado->id_total;
                    $cliente->save();
                }
                $totalEncontrado->deuda_total += $data['monto'];
                $totalEncontrado->save();
                
                $credito = new Credito();
                $credito->tipo_mov = 'credito';
                $credito->monto = $data['monto'];
                $credito->descripcion = $data['descripcion'];
                $credito->fecha_mov = now();
                $credito->fk_id_cliente = $data['cliente_id'];
                $credito->save();
            } else {
                $usuario = Usuario::find($data['usuario_id']);
                $totalEncontrado = Total::where('id_total', $usuario->fk_id_total)->first();
                if (!$totalEncontrado) {
                    $totalEncontrado = new Total();
                    $totalEncontrado->saldo_total = 0;
                    $totalEncontrado->deuda_total = 0;
                    $totalEncontrado->save();
                    
                    $usuario->fk_id_total = $totalEncontrado->id_total;
                    $usuario->save();
                }
                $totalEncontrado->deuda_total += $data['monto'];
                $totalEncontrado->save();

                $credito = new Credito();
                $credito->tipo_mov = 'credito';
                $credito->monto = $data['monto'];
                $credito->descripcion = $data['descripcion'];
                $credito->fecha_mov = now();
                $credito->fk_id_usuario = $data['usuario_id'];
                $credito->save();
            }

            DB::commit();
            return redirect()->back()->with(['flash' => [
                'title' => 'Éxito',
                'icon' => 'success',
                'message' => 'Crédito creado exitosamente.',
            ]]);
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with(['flash' => [
                'title' => 'Error',
                'icon' => 'error',
                'message' => 'Error al crear el crédito: ',
            ]]);
        }
    }
    function crearCliente(Request $request)
    {
        $data = $request->validate([
            'nombre' => 'required|string|max:100',
            'apellido' => 'required|string|max:100',
            'numero_telefono' => 'required|numeric|digits_between:1,11|unique:clientes,numero_telefono',
        ], [
            'nombre.required' => 'El nombre es obligatorio.',
            'nombre.string' => 'El nombre debe ser una cadena de texto.',
            'nombre.max' => 'El nombre no debe exceder los 100 caracteres.',
            'apellido.required' => 'El apellido es obligatorio.',
            'apellido.string' => 'El apellido debe ser una cadena de texto.',
            'apellido.max' => 'El apellido no debe exceder los 100 caracteres.',
            'numero_telefono.unique' => 'El número de teléfono ya está registrado.',
            'numero_telefono.required' => 'El número de teléfono es obligatorio.',
            'numero_telefono.numeric' => 'El número de teléfono debe ser un número válido.',
            'numero_telefono.digits_between' => 'El número de teléfono debe tener entre 1 y 11 dígitos.',
        ]);

        try {
            DB::beginTransaction();
            $cliente = new Cliente();
            $cliente->nombre = $data['nombre'];
            $cliente->apellido = $data['apellido'];
            $cliente->numero_telefono = $data['numero_telefono'];
            $cliente->save();
            DB::commit();

            return redirect()->back()->with(['flash' => [
                'title' => 'Éxito',
                'icon' => 'success',
                'message' => 'Cliente creado exitosamente.',
            ]]);
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with(['flash' => [
                'title' => 'Error',
                'icon' => 'error',
                'message' => 'Error al crear el cliente: ' . $e->getMessage(),
            ]]);
        }
    }
    function abonar()
    {
        // Usuarios que tienen créditos (no abonos)
        $usuarios = Usuario::with('creditos','total')->whereHas('creditos', function ($query) {
            $query->where('tipo_mov', 'credito'); // Solo usuarios que tienen créditos
        })->get();

        // Clientes que tienen créditos (no abonos)  
        $clientes = Cliente::with('creditos','total')->whereHas('creditos', function ($query) {
            $query->where('tipo_mov', 'credito'); // Solo clientes que tienen créditos
        })->get();

        return Inertia::render('AbonarCredito/AbonarCredito', [
            'usuarios' => $usuarios,
            'clientes' => $clientes,
        ]);
    }
    function guardarAbono(Request $request)
    {
        $data = $request->validate([
            'usuario_id' => 'nullable|exists:usuarios,id_usuario',
            'cliente_id' => 'nullable|exists:clientes,id_cliente',
            'monto' => 'required|numeric|min:0.01',
            'descripcion' => 'required|string|max:100',
            'usaSaldo' => 'required|boolean',
        ], [
            'usuario_id.exists' => 'El usuario seleccionado no es válido.',
            'cliente_id.exists' => 'El cliente seleccionado no es válido.',
            'monto.required' => 'El monto es obligatorio.',
            'monto.numeric' => 'El monto debe ser un número válido.',
            'monto.min' => 'El monto debe ser al menos 0.01.',
            'descripcion.required' => 'La descripción es obligatoria.',
            'descripcion.string' => 'La descripción debe ser una cadena de texto.',
            'descripcion.max' => 'La descripción no debe exceder los 100 caracteres.',
        ]);

        try {
             DB::beginTransaction();
            if (!$data['usuario_id'] && $data['usaSaldo'] != false) {

                $cliente = Cliente::find($data['cliente_id']);
                $totalEncontrado = Total::where('id_total', $cliente->fk_id_total)->first();
                
                $saldoOriginal = $totalEncontrado->saldo_total;
                
                $operacion = $data['monto'] - $totalEncontrado->deuda_total ;
                $totalEncontrado->saldo_total = $operacion;
                $totalEncontrado->saldo_total < 0 ? $totalEncontrado->saldo_total = 0 : null;
                $totalEncontrado->deuda_total -= $data['monto'];
                $totalEncontrado->deuda_total < 0 ? $totalEncontrado->deuda_total = 0 : null;
                $totalEncontrado->save();

                $descontadoDeSaldo = $saldoOriginal - $totalEncontrado->saldo_total;
                
                $credito = new Credito();
                $credito->tipo_mov = 'abonoCredito';
                $credito->monto = $descontadoDeSaldo;
                $credito->descripcion = $data['descripcion'];
                $credito->fecha_mov = now();
                $credito->fk_id_cliente = $data['cliente_id'];
                $credito->save();
            } else if(!$data['cliente_id'] && $data['usaSaldo'] != false) {
                $usuario = Usuario::find($data['usuario_id']);
                $totalEncontrado = Total::where('id_total', $usuario->fk_id_total)->first();
                
                $saldoOriginal = $totalEncontrado->saldo_total;
                
                $operacion = $data['monto'] - $totalEncontrado->deuda_total;
                $totalEncontrado->saldo_total = $operacion;
                $totalEncontrado->saldo_total <= 0 ? $totalEncontrado->saldo_total = 0 : null;
                $totalEncontrado->deuda_total -= $data['monto'];
                $totalEncontrado->deuda_total <= 0 ? $totalEncontrado->deuda_total = 0 : null;
                $totalEncontrado->save();

                $descontadoDeSaldo = $saldoOriginal - $totalEncontrado->saldo_total;
                
                $credito = new Credito();
                $credito->tipo_mov = 'abonoCredito';
                $credito->monto = $descontadoDeSaldo;
                $credito->descripcion = $data['descripcion'];
                $credito->fecha_mov = now();
                $credito->fk_id_usuario = $data['usuario_id'];
                $credito->save();
            }
                else if (!$data['usuario_id']) {
                    $cliente = Cliente::find($data['cliente_id']);
                    $totalEncontrado = Total::where('id_total', $cliente->fk_id_total)->first();
                    $totalEncontrado->deuda_total -= $data['monto'];
                    $totalEncontrado->deuda_total <= 0 ? $totalEncontrado->deuda_total = 0 : null;
                    $totalEncontrado->save();
                    
                    $credito = new Credito();
                    $credito->tipo_mov = 'abonoCredito';
                    $credito->monto = $data['monto'];
                    $credito->descripcion = $data['descripcion'];
                    $credito->fecha_mov = now();
                    $credito->fk_id_cliente = $data['cliente_id'];
                    $credito->save();
                } else {
                    $usuario = Usuario::find($data['usuario_id']);
                    $totalEncontrado = Total::where('id_total', $usuario->fk_id_total)->first();
                    $totalEncontrado->deuda_total -= $data['monto'];
                    $totalEncontrado->deuda_total <= 0 ? $totalEncontrado->deuda_total = 0 : null;
                    $totalEncontrado->save();

                    $credito = new Credito();
                    $credito->tipo_mov = 'abonoCredito';
                    $credito->monto = $data['monto'];
                    $credito->descripcion = $data['descripcion'];
                    $credito->fecha_mov = now();
                    $credito->fk_id_usuario = $data['usuario_id'];
                    $credito->save();
                }
            DB::commit();
            return redirect()->back()->with(['flash' => [
                'title' => 'Éxito',
                'icon' => 'success',
                'message' => 'Abono registrado exitosamente.',
            ]]);
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with(['flash' => [
                'title' => 'Error',
                'icon' => 'error',
                'message' => 'Error al registrar el abono: ' . $e->getMessage(),
            ]]);
        }
    }
    public function AbonarSaldo()
    {
        $usuarios = Usuario::with(['total'])->get();
        $clientes = Cliente::with(['total'])->get();

        return Inertia::render('AbonarSaldo/AbonarSaldo', [
            'usuarios' => $usuarios,
            'clientes' => $clientes,
        ]);
    }
    public function abonoNuevo(Request $request)
    {
        $data = $request->validate([
            'usuario_id' => 'nullable|exists:usuarios,id_usuario',
            'cliente_id' => 'nullable|exists:clientes,id_cliente',
            'monto' => 'required|numeric|min:0.01',
            'descripcion' => 'required|string|max:100',
        ], [
            'usuario_id.exists' => 'El usuario seleccionado no es válido.',
            'cliente_id.exists' => 'El cliente seleccionado no es válido.',
            'monto.required' => 'El monto es obligatorio.',
            'monto.numeric' => 'El monto debe ser un número válido.',
            'monto.min' => 'El monto debe ser al menos 0.01.',
            'descripcion.required' => 'La descripción es obligatoria.',
            'descripcion.string' => 'La descripción debe ser una cadena de texto.',
            'descripcion.max' => 'La descripción no debe exceder los 100 caracteres.',
        ]);

        try {
            DB::beginTransaction();
            if (!$data['usuario_id']) {

                $cliente = Cliente::find($data['cliente_id']);
                $totalEncontrado = Total::where('id_total', $cliente->fk_id_total)->first();
                if (!$totalEncontrado) {
                    $totalEncontrado = new Total();
                    $totalEncontrado->saldo_total = 0;
                    $totalEncontrado->deuda_total = 0;
                    $totalEncontrado->save();
                    
                    $cliente->fk_id_total = $totalEncontrado->id_total;
                    $cliente->save();
                }

                $totalEncontrado->saldo_total += $data['monto'];
                $totalEncontrado->save();
                
                $credito = new Credito();
                $credito->tipo_mov = 'abono';
                $credito->monto = $data['monto'];
                $credito->descripcion = $data['descripcion'];
                $credito->fecha_mov = now();
                $credito->fk_id_cliente = $data['cliente_id'];
                $credito->save();
            } else {
                $usuario = Usuario::find($data['usuario_id']);
                $totalEncontrado = Total::where('id_total', $usuario->fk_id_total)->first();
                if (!$totalEncontrado) { 
                    $totalEncontrado = new Total();
                    $totalEncontrado->saldo_total = 0;
                    $totalEncontrado->deuda_total = 0;
                    $totalEncontrado->save();
                    
                    $usuario->fk_id_total = $totalEncontrado->id_total;
                    $usuario->save();
                }
                
                $totalEncontrado->saldo_total += $data['monto'];
                $totalEncontrado->save();

                $credito = new Credito();
                $credito->tipo_mov = 'abono';
                $credito->monto = $data['monto'];
                $credito->descripcion = $data['descripcion'];
                $credito->fecha_mov = now();
                $credito->fk_id_usuario = $data['usuario_id'];
                $credito->save();
            }

            DB::commit();
            return redirect()->back()->with(['flash' => [
                'title' => 'Éxito',
                'icon' => 'success',
                'message' => 'Abono registrado exitosamente.',
            ]]);
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with(['flash' => [
                'title' => 'Error',
                'icon' => 'error',
                'message' => 'Error al registrar el abono: ' . $e->getMessage(),
            ]]);
        }
    }
}
