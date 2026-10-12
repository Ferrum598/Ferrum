<?php

namespace App\Http\Controllers;

use App\Models\CodigoBarra;
use App\Models\Lote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CodigoBarraController extends Controller
{
    private const TIPOS = ['code128', 'ean13', 'code39'];

    private function flash(string $icon, string $title, string $message): array
    {
        return ['title' => $title, 'icon' => $icon, 'message' => $message];
    }

    private static function digitoEan13(string $doce): string
    {
        $suma = 0;
        for ($i = 0; $i < 12; $i++) {
            $suma += (int) $doce[$i] * ($i % 2 === 0 ? 1 : 3);
        }
        return (string) ((10 - $suma % 10) % 10);
    }

    private function formatoItem(CodigoBarra $c): array
    {
        return [
            'id_codigo' => $c->id_codigo,
            'codigo' => $c->codigo,
            'tipo_codigo' => $c->tipo_codigo,
            'es_personalizado' => $c->es_personalizado,
            'activo' => $c->activo,
            'veces_impreso' => $c->veces_impreso,
            'fecha_creacion' => $c->fecha_creacion,
            'id_lote' => $c->lote?->id_lote,
            'nombre_lote' => $c->lote?->nombre_lote,
            'producto' => $c->lote?->producto?->nombre_producto,
            'precio_venta' => (float) ($c->lote?->precio_venta ?? 0),
        ];
    }

    public function index(Request $request)
    {
        $buscar = trim((string) $request->input('buscar', ''));

        $query = CodigoBarra::with('lote.producto')->orderByDesc('id_codigo');
        if ($buscar !== '') {
            $like = '%' . mb_strtolower($buscar) . '%';
            $query->where(function ($q) use ($like) {
                $q->whereRaw('LOWER(codigo) LIKE ?', [$like])
                    ->orWhereHas('lote', fn ($l) => $l->whereRaw('LOWER(nombre_lote) LIKE ?', [$like])
                        ->orWhereHas('producto', fn ($p) => $p->whereRaw('LOWER(nombre_producto) LIKE ?', [$like])));
            });
        }

        $codigos = $query->paginate(10)->withQueryString();
        $codigos->getCollection()->transform(fn (CodigoBarra $c) => $this->formatoItem($c));

        $lotes = Lote::with('producto')
            ->where('activo', true)
            ->whereHas('producto', fn ($p) => $p->where('activo', true))
            ->orderBy('fk_producto')->orderBy('id_lote')
            ->get()
            ->map(fn (Lote $l) => [
                'id_lote' => $l->id_lote,
                'etiqueta' => $l->producto->nombre_producto . ' — ' . ($l->nombre_lote ?: 'Lote #' . $l->id_lote) . ' (Q. ' . number_format((float) $l->precio_venta, 2) . ')',
            ]);

        return Inertia::render('CodigosBarras/CodigosBarras', [
            'codigos' => $codigos,
            'lotes' => $lotes,
            'buscar' => $buscar,
        ]);
    }

    public function generar(Request $request)
    {
        $datos = $request->validate([
            'fk_lote' => 'required|integer|exists:lotes,id_lote',
            'codigo' => 'nullable|string|max:100',
            'tipo_codigo' => ['required', Rule::in(self::TIPOS)],
        ], [
            'fk_lote.required' => 'Seleccione un lote.',
            'fk_lote.exists' => 'El lote seleccionado no existe.',
            'codigo.max' => 'El código no puede superar 100 caracteres.',
            'tipo_codigo.required' => 'Seleccione el tipo de código.',
            'tipo_codigo.in' => 'El tipo de código no es válido.',
        ]);

        $lote = Lote::findOrFail($datos['fk_lote']);
        $tipo = $datos['tipo_codigo'];
        $codigo = trim((string) ($datos['codigo'] ?? ''));
        $personalizado = $codigo !== '';

        if (!$personalizado) {
            $codigo = $tipo === 'ean13'
                ? $this->completarEan13('200' . str_pad((string) $lote->id_lote, 9, '0', STR_PAD_LEFT))
                : 'FER-' . str_pad((string) $lote->id_lote, 6, '0', STR_PAD_LEFT);
        } elseif ($tipo === 'ean13') {
            if (!preg_match('/^\d{12,13}$/', $codigo)) {
                return back()->withErrors(['codigo' => 'El código EAN-13 debe tener 12 o 13 dígitos numéricos.']);
            }
            if (strlen($codigo) === 13 && $codigo[12] !== self::digitoEan13($codigo)) {
                return back()->withErrors(['codigo' => 'El dígito verificador del EAN-13 no es correcto.']);
            }
            $codigo = $this->completarEan13($codigo);
        } elseif ($tipo === 'code39') {
            $codigo = mb_strtoupper($codigo);
            if (!preg_match('/^[A-Z0-9\-. ]+$/', $codigo)) {
                return back()->withErrors(['codigo' => 'El código Code 39 solo admite mayúsculas, dígitos, guion, punto y espacio.']);
            }
        } elseif (!preg_match('/^[\x20-\x7E]+$/', $codigo)) {
            return back()->withErrors(['codigo' => 'El código Code 128 solo admite caracteres ASCII.']);
        }

        if (CodigoBarra::where('codigo', $codigo)->exists()) {
            return back()->withErrors(['codigo' => 'Ya existe un código de barras con ese valor.']);
        }

        CodigoBarra::create([
            'fk_lote' => $lote->id_lote,
            'codigo' => $codigo,
            'tipo_codigo' => $tipo,
            'es_personalizado' => $personalizado,
            'activo' => true,
            'fk_usuario' => Auth::id(),
        ]);

        return redirect()->route('codigos.index')->with('flash', $this->flash('success', 'Código generado', "Se generó el código {$codigo}."));
    }

    private function completarEan13(string $codigo): string
    {
        return strlen($codigo) === 12 ? $codigo . self::digitoEan13($codigo) : $codigo;
    }

    public function cambiarEstado(CodigoBarra $codigo)
    {
        $codigo->update(['activo' => !$codigo->activo]);

        return back()->with('flash', $this->flash('success', 'Estado actualizado', $codigo->activo ? 'El código fue activado.' : 'El código fue desactivado.'));
    }

    // Página de impresión: ?codigos=1,2,3 o ?lote=5 (genera el código del lote si aún no tiene)
    public function imprimir(Request $request)
    {
        $query = CodigoBarra::with('lote.producto')->where('activo', true);

        if ($request->filled('lote')) {
            $lote = Lote::findOrFail((int) $request->input('lote'));
            if (!$lote->codigos()->exists()) {
                CodigoBarra::generarParaLote($lote, Auth::id());
            }
            $query->where('fk_lote', $lote->id_lote);
        } else {
            $ids = array_filter(array_map('intval', explode(',', (string) $request->input('codigos', ''))));
            $query->whereIn('id_codigo', $ids ?: [0]);
        }

        return Inertia::render('ImprimirCodigos/ImprimirCodigos', [
            'codigos' => $query->get()->map(fn (CodigoBarra $c) => $this->formatoItem($c))->values(),
            'copias' => max(1, min(200, (int) $request->input('copias', 1))),
        ]);
    }

    public function registrarImpresion(Request $request)
    {
        $datos = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:codigo_barras,id_codigo',
        ]);

        CodigoBarra::whereIn('id_codigo', $datos['ids'])->increment('veces_impreso');

        return response()->json(['ok' => true]);
    }
}
