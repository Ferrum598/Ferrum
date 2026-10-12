<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Comprobante extends Model
{
    protected $table = 'comprobantes';
    protected $primaryKey = 'id_comprobante';

    protected $fillable = ['fk_venta', 'fk_usuario', 'numero_comprobante', 'fecha_emision', 'total', 'veces_impreso'];

    protected $casts = ['fecha_emision' => 'datetime'];

    public function venta()
    {
        return $this->belongsTo(Venta::class, 'fk_venta', 'id_venta');
    }

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'fk_usuario', 'id_usuario');
    }

    // Folio consecutivo: C-000001
    public static function siguienteNumero(): string
    {
        $ultimo = (int) self::max('id_comprobante');
        return 'C-' . str_pad((string) ($ultimo + 1), 6, '0', STR_PAD_LEFT);
    }
}
