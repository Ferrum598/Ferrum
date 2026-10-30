<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use App\Models\Credito;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class ClienteController extends Controller
{
    public function index(Request $request)
    {
        $clientes = Cliente::query()
            ->withSum(['creditos as deuda_total' => fn ($query) => $query->where('estado', '!=', 'pagado')], 'saldo_pendiente')
            ->when($request->filled('q'), function ($query) use ($request) {
                $term = trim($request->string('q')->toString());
                $like = '%' . mb_strtolower($term) . '%';
                $query->where(function ($query) use ($like) {
                    $query->whereRaw('LOWER(nombre_cliente) LIKE ?', [$like])
                        ->orWhereRaw('LOWER(apellido_cliente) LIKE ?', [$like])
                        ->orWhereRaw('LOWER(numero_cliente) LIKE ?', [$like]);
                });
            })
            ->orderBy('nombre_cliente')->orderBy('apellido_cliente')
            ->paginate(15)->withQueryString();

        return Inertia::render('Clientes/Clientes', [
            'clientes' => $clientes,
            'filtros' => $request->only('q'),
        ]);
    }

    public function buscar(Request $request)
    {
        $term = trim((string) $request->query('q', ''));
        if ($term === '') {
            return response()->json([]);
        }

        return Cliente::query()
            ->withSum(['creditos as deuda_total' => fn ($query) => $query->where('estado', '!=', 'pagado')], 'saldo_pendiente')
            ->where(function ($query) use ($term) {
                $like = '%' . mb_strtolower($term) . '%';
                $query->whereRaw('LOWER(nombre_cliente) LIKE ?', [$like])
                    ->orWhereRaw('LOWER(apellido_cliente) LIKE ?', [$like])
                    ->orWhereRaw('LOWER(numero_cliente) LIKE ?', [$like]);
            })
            ->orderBy('nombre_cliente')->limit(15)
            ->get(['id_cliente', 'nombre_cliente', 'apellido_cliente', 'numero_cliente'])
            ->map(fn (Cliente $cliente) => [
                'id_cliente' => $cliente->id_cliente,
                'nombre_cliente' => $cliente->nombre_cliente,
                'apellido_cliente' => $cliente->apellido_cliente,
                'numero_cliente' => $cliente->numero_cliente,
                'deuda_total' => (float) ($cliente->deuda_total ?? 0),
            ]);
    }

    public function rapido(Request $request)
    {
        $data = $request->validate([
            'nombre_cliente' => ['required', 'string', 'max:100'],
            'apellido_cliente' => ['required', 'string', 'max:100'],
            'numero_cliente' => ['nullable', 'string', 'max:20'],
        ]);

        $cliente = Cliente::create($data);
        return response()->json([
            'id_cliente' => $cliente->id_cliente,
            'nombre_cliente' => $cliente->nombre_cliente,
            'apellido_cliente' => $cliente->apellido_cliente,
            'numero_cliente' => $cliente->numero_cliente,
        ], 201);
    }

    public function store(Request $request)
    {
        $data = $this->validarCliente($request);
        Cliente::create($data);
        return redirect()->route('clientes.index')->with('flash', [
            'title' => 'Éxito', 'icon' => 'success', 'message' => 'Cliente creado correctamente.',
        ]);
    }

    public function update(Request $request, Cliente $cliente)
    {
        $cliente->update($this->validarCliente($request));
        return redirect()->route('clientes.index')->with('flash', [
            'title' => 'Éxito', 'icon' => 'success', 'message' => 'Cliente actualizado correctamente.',
        ]);
    }

    public function destroy(Cliente $cliente)
    {
        if ($cliente->ventas()->exists()) {
            return redirect()->back()->with('flash', [
                'title' => 'No se puede eliminar', 'icon' => 'error',
                'message' => 'Este cliente tiene ventas asociadas y no puede eliminarse.',
            ]);
        }

        try {
            $cliente->delete();
        } catch (QueryException) {
            return redirect()->back()->with('flash', [
                'title' => 'No se puede eliminar', 'icon' => 'error',
                'message' => 'Este cliente tiene registros asociados y no puede eliminarse.',
            ]);
        }

        return redirect()->route('clientes.index')->with('flash', [
            'title' => 'Éxito', 'icon' => 'success', 'message' => 'Cliente eliminado correctamente.',
        ]);
    }

    public function detalle(Cliente $cliente)
    {
        $cliente->load(['creditos' => fn ($query) => $query->with(['venta.comprobante'])->orderByDesc('fecha_inicio')]);
        return Inertia::render('Clientes/DetalleCliente', ['cliente' => $cliente]);
    }

    public function abonar(Request $request, Cliente $cliente)
    {
        $data = $request->validate([
            'monto' => ['required', 'numeric', 'gt:0'],
            'fecha_abono' => ['nullable', 'date'],
        ]);
        $montoCentavos = (int) round((float) $data['monto'] * 100);
        if ($montoCentavos <= 0) {
            return back()->withErrors(['monto' => 'El monto debe ser de al menos Q0.01.'])->withInput();
        }

        DB::transaction(function () use ($cliente, $data, $montoCentavos) {
            $cliente = Cliente::whereKey($cliente->getKey())->lockForUpdate()->firstOrFail();
            $creditos = Credito::where('fk_cliente', $cliente->id_cliente)
                ->where('estado', '!=', 'pagado')
                ->orderBy('fecha_inicio')->orderBy('id_credito')
                ->lockForUpdate()->get();
            $deudaCentavos = $creditos->sum(fn (Credito $credito) => (int) round((float) $credito->saldo_pendiente * 100));

            if ($montoCentavos > $deudaCentavos) {
                throw ValidationException::withMessages(['monto' => 'El monto excede la deuda pendiente del cliente.']);
            }

            $restante = $montoCentavos;
            foreach ($creditos as $credito) {
                if ($restante <= 0) break;
                $saldoCentavos = (int) round((float) $credito->saldo_pendiente * 100);
                $abonoCentavos = min($restante, $saldoCentavos);
                if ($abonoCentavos <= 0) continue;
                $credito->registrarAbono($abonoCentavos, (int) auth()->id(), $data['fecha_abono'] ?? now()->toDateString());
                $restante -= $abonoCentavos;
            }
        });

        return back()->with('flash', [
            'title' => 'Éxito', 'icon' => 'success', 'message' => 'El abono se distribuyó entre los créditos más antiguos.',
        ]);
    }

    private function validarCliente(Request $request): array
    {
        return $request->validate([
            'nombre_cliente' => ['required', 'string', 'max:100'],
            'apellido_cliente' => ['required', 'string', 'max:100'],
            'numero_cliente' => ['nullable', 'string', 'max:20'],
        ]);
    }
}
