<?php

namespace App\Http\Controllers;

use App\Models\Credito;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class CreditoController extends Controller
{
    public function index(Request $request)
    {
        Credito::marcarVencidos();
        $creditos = Credito::with(['cliente', 'venta.comprobante'])
            ->when($request->filled('estado'), fn ($query) => $query->where('estado', $request->input('estado')))
            ->when($request->filled('cliente'), fn ($query) => $query->where('fk_cliente', $request->input('cliente')))
            ->when($request->filled('desde'), fn ($query) => $query->whereDate('fecha_vencimiento', '>=', $request->input('desde')))
            ->when($request->filled('hasta'), fn ($query) => $query->whereDate('fecha_vencimiento', '<=', $request->input('hasta')))
            ->orderByRaw("CASE estado WHEN 'vencido' THEN 0 WHEN 'pendiente' THEN 1 ELSE 2 END")
            ->orderBy('fecha_vencimiento')->paginate(15)->withQueryString();

        $resumenClientes = Credito::query()->with('cliente')
            ->select('fk_cliente', DB::raw('SUM(saldo_pendiente) as deuda_total'))
            ->where('estado', '!=', 'pagado')->groupBy('fk_cliente')->havingRaw('SUM(saldo_pendiente) > 0')
            ->orderByDesc('deuda_total')->get();

        return Inertia::render('Creditos/Creditos', [
            'creditos' => $creditos,
            'clientes' => \App\Models\Cliente::orderBy('nombre_cliente')->get(['id_cliente', 'nombre_cliente', 'apellido_cliente']),
            'resumenClientes' => $resumenClientes,
            'totales' => [
                'deuda_total' => (float) Credito::where('estado', '!=', 'pagado')->sum('saldo_pendiente'),
                'deuda_vencida' => (float) Credito::where('estado', 'vencido')->sum('saldo_pendiente'),
            ],
            'filtros' => $request->only('estado', 'cliente', 'desde', 'hasta'),
        ]);
    }

    public function show(Credito $credito)
    {
        $credito->load([
            'cliente', 'abonos.usuario',
            'venta.comprobante', 'venta.detalles.lote.producto',
        ]);
        return Inertia::render('Creditos/DetalleCredito', ['credito' => $credito]);
    }

    public function abonar(Request $request, Credito $credito)
    {
        $data = $request->validate([
            'monto' => ['required', 'numeric', 'gt:0'],
            'fecha_abono' => ['nullable', 'date'],
        ]);
        $centavos = (int) round((float) $data['monto'] * 100);
        if ($centavos <= 0) {
            return back()->withErrors(['monto' => 'El monto debe ser de al menos Q0.01.'])->withInput();
        }

        DB::transaction(function () use ($credito, $data, $centavos) {
            $credito = Credito::whereKey($credito->getKey())->lockForUpdate()->firstOrFail();
            if ($credito->estado === 'pagado') {
                throw ValidationException::withMessages(['monto' => 'Este crédito ya está pagado y no admite más abonos.']);
            }

            $saldoCentavos = (int) round((float) $credito->saldo_pendiente * 100);
            if ($centavos > $saldoCentavos) {
                throw ValidationException::withMessages(['monto' => 'El abono no puede exceder el saldo pendiente.']);
            }
            $credito->registrarAbono($centavos, (int) auth()->id(), $data['fecha_abono'] ?? now()->toDateString());
        });

        return back()->with('flash', [
            'title' => 'Éxito', 'icon' => 'success', 'message' => 'Abono registrado correctamente.',
        ]);
    }

    public function cambiarVencimiento(Request $request, Credito $credito)
    {
        $data = $request->validate([
            'fecha_vencimiento' => ['required', 'date', 'after_or_equal:today'],
        ]);
        if ($credito->estado === 'pagado') {
            return back()->withErrors(['fecha_vencimiento' => 'No se puede cambiar el vencimiento de un crédito pagado.']);
        }
        $credito->fecha_vencimiento = $data['fecha_vencimiento'];
        $credito->estado = 'pendiente';
        $credito->save();
        return back()->with('flash', [
            'title' => 'Éxito', 'icon' => 'success', 'message' => 'Fecha de vencimiento actualizada.',
        ]);
    }

}
