<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AbonoCredito extends Model
{
    protected $table = 'abonos_creditos';
    protected $primaryKey = 'id_abono';

    protected $fillable = ['fk_credito', 'fk_usuario', 'monto', 'fecha_abono'];

    protected $casts = ['monto' => 'decimal:2', 'fecha_abono' => 'date:Y-m-d'];

    public function credito()
    {
        return $this->belongsTo(Credito::class, 'fk_credito', 'id_credito');
    }

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'fk_usuario', 'id_usuario');
    }
}
