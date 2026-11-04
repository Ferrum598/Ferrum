<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

// Permite vender por medidas (0.5, 1.5, ...): las cantidades pasan de entero a decimal con 2 decimales
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lotes', function (Blueprint $table) {
            $table->decimal('cantidad', 12, 2)->change();
            $table->decimal('cantidad_disponible', 12, 2)->change();
        });

        Schema::table('detalle_venta', function (Blueprint $table) {
            $table->decimal('cantidad', 12, 2)->change();
        });
    }

    public function down(): void
    {
        $hayFracciones = DB::table('lotes')
            ->whereRaw('cantidad != CAST(cantidad AS INTEGER)')
            ->orWhereRaw('cantidad_disponible != CAST(cantidad_disponible AS INTEGER)')
            ->exists()
            || DB::table('detalle_venta')
                ->whereRaw('cantidad != CAST(cantidad AS INTEGER)')
                ->exists();

        if ($hayFracciones) {
            throw new RuntimeException('No se puede revertir la migración: hay cantidades fraccionadas registradas.');
        }

        Schema::table('lotes', function (Blueprint $table) {
            $table->integer('cantidad')->change();
            $table->integer('cantidad_disponible')->change();
        });

        Schema::table('detalle_venta', function (Blueprint $table) {
            $table->integer('cantidad')->change();
        });
    }
};
