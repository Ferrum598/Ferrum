<?php

namespace App\Http\Controllers;

use App\Models\Pedido;
use App\Models\Producto;
use App\Models\PedidoProducto;
use App\Models\Proforma;
use App\Models\Credito;
use App\Models\Total;
use App\Models\Cliente;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class PedidoController extends Controller
{
    function crearPedido(Request $request)
    {
        //Guarda en una variable los datos del productos enviados desde el frontend
        $productos = $request->input('productos');
        $total_pedido = $request->input('total_pedido');
        $fecha_proforma = $request->input('fecha_proforma');
        //Obtiene el id del usuario autenticado
        $usuario = Auth::user()->id_usuario;

        DB::beginTransaction();
        try {
            $pedido = new Pedido();
            $pedido->fk_id_usuario = $usuario;
            $pedido->estado = 'pendiente';
            $pedido->fecha_pedido = now();
            $pedido->total_pedido = $total_pedido;
            $pedido->save();

            if ($fecha_proforma) {
                $proforma = new Proforma();
                $proforma->fk_id_usuario = $usuario;
                $proforma->fk_id_pedido = $pedido->id_pedido;
                $proforma->fecha_proforma = $fecha_proforma;
                $proforma->save();
            }

            foreach ($productos as $item) {

                if ($item['cantidad'] <= 0) {
                    throw new \Exception('La cantidad debe ser mayor que cero para el producto');
                }

                $pedidoProducto = new PedidoProducto();
                $pedidoProducto->fk_id_pedido = $pedido->id_pedido;
                $pedidoProducto->fk_id_producto = $item['id_producto'];
                $pedidoProducto->cantidad = $item['cantidad'];
                $pedidoProducto->total = $item['total'];
                $pedidoProducto->save();

                $producto = Producto::find($item['id_producto']);
                if ($producto) {
                    $totalEnCantidad = $producto->cantidad - $item['cantidad'];
                    $producto->cantidad = $totalEnCantidad < 0 ? 0 : $totalEnCantidad;
                    $producto->save();
                }
            }
            DB::commit();
            return redirect()->route('carrito.index')->with(['flash' => [
                'icon' => 'success',
                'title' => 'Pedido enviado',
                'message' => 'Su pedido ha sido creado exitosamente.',
            ]]);
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->route('carrito.index')->with(['flash' => [
                'icon' => 'error',
                'title' => 'No se pudo crear el pedido',
                'message' => 'Ocurrió un error al procesar su pedido. Por favor, intente nuevamente.',
            ]]);
        }
    }
    function index()
    {
        $pedidos = Pedido::with([
            'usuario',
            'pedidoProductos.producto',
            'proformas',
        ])->orderBy('fecha_entrega', 'asc')->get();


        return Inertia::render('Pedidos/Pedidos', [
            'pedidos' => $pedidos,
        ]);
    }
    function confirmarPedido(Request $request)
    {
        $id_pedido = $request->input('id_pedido');
        DB::beginTransaction();
        try {
            $pedido = Pedido::find($id_pedido);
            if ($pedido) {
                $pedido->estado = 'completado';
                $pedido->save();
                DB::commit();
                return redirect('/pedidos')->with(['flash' => [
                    'icon' => 'success',
                    'title' => 'Pedido confirmado',
                    'message' => 'El pedido ha sido confirmado exitosamente.',
                ]]);
            }
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect('/pedidos')->with(['flash' => [
                'icon' => 'error',
                'title' => 'No se pudo confirmar el pedido',
                'message' => 'Ocurrió un error al confirmar el pedido. Por favor, intente nuevamente.',
            ]]);
        }
    }
    function cancelarPedido(Request $request)
    {
        $id_pedido = $request->input('id_pedido');
        DB::beginTransaction();
        try {
            $pedido = Pedido::find($id_pedido);
            if ($pedido) {
                $pedido->estado = 'cancelado';
                $pedido->save();
                DB::commit();
                return redirect('/pedidos')->with(['flash' => [
                    'icon' => 'success',
                    'title' => 'Pedido cancelado',
                    'message' => 'El pedido ha sido cancelado exitosamente.',
                ]]);
            }
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect('/pedidos')->with(['flash' => [
                'icon' => 'error',
                'title' => 'No se pudo cancelar el pedido',
                'message' => 'Ocurrió un error al cancelar el pedido. Por favor, intente nuevamente.',
            ]]);
        }
    }
    public function asignarFechas(Request $request, $id_pedido)
    {
        $validated = $request->validate([
            'fecha_entrega' => 'nullable|date',
            'fecha_facturacion' => 'nullable|date',
        ]);
        DB::beginTransaction();
        try {
            $pedido = Pedido::find($id_pedido);
            if ($pedido) {
                $pedido->fecha_entrega = $request->input('fecha_entrega');
                $pedido->fecha_facturacion = $request->input('fecha_facturacion');
                $pedido->save();
                DB::commit();
                return redirect('/pedidos')->with(['flash' => [
                    'icon' => 'success',
                    'title' => 'Fechas asignadas',
                    'message' => 'Las fechas de entrega y facturación han sido asignadas exitosamente.',
                ]]);
            }
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect('/pedidos')->with(['flash' => [
                'icon' => 'error',
                'title' => 'No se pudieron asignar las fechas',
                'message' => 'Ocurrió un error al asignar las fechas. Por favor, intente nuevamente.',
            ]]);
        }
    }

    public function crearPedidoCredito(Request $request)
    {
       //Guarda en una variable los datos del productos enviados desde el frontend
        $productos = $request->input('productos');
        $total_pedido = $request->input('total_pedido');
        $fecha_proforma = $request->input('fecha_proforma');
        $id_cliente = $request->input('id_cliente');
        //Obtiene el id del usuario autenticado
        $usuario = Auth::user()->id_usuario;

        DB::beginTransaction();
        try {
            $pedido = new Pedido();
            $pedido->fk_id_usuario = $usuario;
            $pedido->estado = 'pendiente';
            $pedido->fecha_pedido = now();
            $pedido->total_pedido = $total_pedido;
            $pedido->save();

            if ($fecha_proforma) {
                $proforma = new Proforma();
                $proforma->fk_id_usuario = $usuario;
                $proforma->fk_id_pedido = $pedido->id_pedido;
                $proforma->fecha_proforma = $fecha_proforma;
                $proforma->save();
            }

            foreach ($productos as $item) {

                if ($item['cantidad'] <= 0) {
                    throw new \Exception('La cantidad debe ser mayor que cero para el producto');
                }

                $pedidoProducto = new PedidoProducto();
                $pedidoProducto->fk_id_pedido = $pedido->id_pedido;
                $pedidoProducto->fk_id_producto = $item['id_producto'];
                $pedidoProducto->cantidad = $item['cantidad'];
                $pedidoProducto->total = $item['total'];
                $pedidoProducto->save();

                $producto = Producto::find($item['id_producto']);
                if ($producto) {
                    $totalEnCantidad = $producto->cantidad - $item['cantidad'];
                    $producto->cantidad = $totalEnCantidad < 0 ? 0 : $totalEnCantidad;
                    $producto->save();
                }
            }

            $cliente = Cliente::find($id_cliente);
                $totalEncontrado = Total::where('id_total', $cliente->fk_id_total)->first();
                
                if (!$totalEncontrado) {
                    $totalEncontrado = new Total();
                    $totalEncontrado->saldo_total = 0;
                    $totalEncontrado->deuda_total = 0;
                    $totalEncontrado->save();
                    
                    $cliente->fk_id_total = $totalEncontrado->id_total;
                    $cliente->save();
                }
                $totalEncontrado->deuda_total += $total_pedido;
                $totalEncontrado->save();
                
                $credito = new Credito();
                $credito->tipo_mov = 'credito';
                $credito->monto = $total_pedido;
                $credito->descripcion = 'Credito por pedido ID: ' . $pedido->id_pedido;
                $credito->fecha_mov = now();
                $credito->fk_id_cliente = $id_cliente;
                $credito->save();

            DB::commit();
            return redirect()->route('carrito.index')->with(['flash' => [
                'icon' => 'success',
                'title' => 'Pedido enviado',
                'message' => 'Su pedido ha sido creado exitosamente.',
            ]]);
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->route('carrito.index')->with(['flash' => [
                'icon' => 'error',
                'title' => 'No se pudo crear el pedido',
                'message' => 'Ocurrió un error al procesar su pedido. Por favor, intente nuevamente.',
            ]]);
        }
    }
}
