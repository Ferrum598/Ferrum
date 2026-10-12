<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Credito extends Model
{
    protected $table = 'creditos';
    protected $primaryKey = 'id_credito';

    protected $fillable = [
        'fk_cliente',
        'fk_venta',
        'fk_usuario',
        'monto_total',
        'saldo_pendiente',
        'fecha_inicio',
        'fecha_vencimiento',
        'estado',
        'descripcion',
    ];

    protected $casts = [
        'monto_total' => 'decimal:2',
        'saldo_pendiente' => 'decimal:2',
        'fecha_inicio' => 'date:Y-m-d',
        'fecha_vencimiento' => 'date:Y-m-d',
    ];

    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'fk_cliente', 'id_cliente');
    }

    public function venta()
    {
        return $this->belongsTo(Venta::class, 'fk_venta', 'id_venta');
    }

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'fk_usuario', 'id_usuario');
    }

    public function abonos()
    {
        return $this->hasMany(AbonoCredito::class, 'fk_credito', 'id_credito');
    }

    public function registrarAbono(int $centavos, int $usuarioId, string $fecha): void
    {
        $saldoCentavos = (int) round((float) $this->saldo_pendiente * 100);
        $montoCentavos = min(max(0, $centavos), $saldoCentavos);
        if ($montoCentavos === 0) {
            $this->saldo_pendiente = '0.00';
            $this->estado = 'pagado';
            $this->save();
            return;
        }

        $this->abonos()->create([
            'fk_usuario' => $usuarioId,
            'monto' => number_format($montoCentavos / 100, 2, '.', ''),
            'fecha_abono' => $fecha,
        ]);
        $nuevoSaldo = $saldoCentavos - $montoCentavos;
        $this->saldo_pendiente = number_format($nuevoSaldo / 100, 2, '.', '');
        if ($nuevoSaldo === 0) {
            $this->estado = 'pagado';
        }
        $this->save();
    }
    // Marca como vencidos los créditos pendientes cuya fecha de vencimiento ya pasó
    public static function marcarVencidos(): void
    {
        self::where('estado', 'pendiente')
            ->whereDate('fecha_vencimiento', '<', now()->toDateString())
            ->update(['estado' => 'vencido']);
    }
}
