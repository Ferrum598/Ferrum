<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cliente extends Model
{
    protected $table = 'clientes';
    protected $primaryKey = 'id_cliente';

    protected $fillable = ['nombre_cliente', 'apellido_cliente', 'numero_cliente'];

    public function ventas()
    {
        return $this->hasMany(Venta::class, 'fk_cliente', 'id_cliente');
    }

    public function creditos()
    {
        return $this->hasMany(Credito::class, 'fk_cliente', 'id_cliente');
    }

    // Deuda total = suma de los saldos pendientes de sus créditos
    public function deudaTotal(): string
    {
        return (string) $this->creditos()->where('estado', '!=', 'pagado')->sum('saldo_pendiente');
    }
}
