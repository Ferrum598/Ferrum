<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CodigoBarra extends Model
{
    protected $table = 'codigo_barras';
    protected $primaryKey = 'id_codigo';
    public $timestamps = false;

    protected $fillable = [
        'fk_lote',
        'codigo',
        'tipo_codigo',
        'es_personalizado',
        'activo',
        'veces_impreso',
        'fecha_creacion',
        'fk_usuario',
    ];

    protected $casts = [
        'es_personalizado' => 'boolean',
        'activo' => 'boolean',
    ];

    public function lote()
    {
        return $this->belongsTo(Lote::class, 'fk_lote', 'id_lote');
    }

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'fk_usuario', 'id_usuario');
    }

    // Código personalizado por defecto para un lote: FER-000123
    public static function generarParaLote(Lote $lote, ?int $idUsuario = null): self
    {
        return self::firstOrCreate(
            ['codigo' => 'FER-' . str_pad((string) $lote->id_lote, 6, '0', STR_PAD_LEFT)],
            [
                'fk_lote' => $lote->id_lote,
                'tipo_codigo' => 'code128',
                'es_personalizado' => true,
                'activo' => true,
                'fk_usuario' => $idUsuario,
            ]
        );
    }
}
