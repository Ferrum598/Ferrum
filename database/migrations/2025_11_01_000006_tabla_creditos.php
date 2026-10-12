<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('creditos', function (Blueprint $table) {
            $table->id('id_credito');
            $table->unsignedBigInteger('fk_cliente');
            $table->unsignedBigInteger('fk_venta')->unique();
            $table->unsignedBigInteger('fk_usuario');
            $table->decimal('monto_total', 10, 2);
            $table->decimal('saldo_pendiente', 10, 2);
            $table->date('fecha_inicio');
            $table->date('fecha_vencimiento');
            $table->enum('estado', ['pendiente', 'pagado', 'vencido'])->default('pendiente');
            $table->string('descripcion', 255)->nullable();
            $table->foreign('fk_cliente')->references('id_cliente')->on('clientes')->restrictOnDelete();
            $table->foreign('fk_venta')->references('id_venta')->on('ventas')->restrictOnDelete();
            $table->foreign('fk_usuario')->references('id_usuario')->on('usuarios')->restrictOnDelete();
            $table->timestamps();
        });

        Schema::create('abonos_creditos', function (Blueprint $table) {
            $table->id('id_abono');
            $table->unsignedBigInteger('fk_credito');
            $table->unsignedBigInteger('fk_usuario');
            $table->decimal('monto', 10, 2);
            $table->date('fecha_abono');
            $table->foreign('fk_credito')->references('id_credito')->on('creditos')->restrictOnDelete();
            $table->foreign('fk_usuario')->references('id_usuario')->on('usuarios')->restrictOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('abonos_creditos');
        Schema::dropIfExists('creditos');
    }
};
