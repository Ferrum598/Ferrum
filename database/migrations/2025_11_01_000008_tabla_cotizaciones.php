<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cotizaciones', function (Blueprint $table) {
            $table->id('id_cotizacion');
            $table->string('numero_cotizacion', 30)->unique();
            $table->unsignedBigInteger('fk_usuario');
            $table->unsignedBigInteger('fk_cliente')->nullable();
            $table->string('nombre_cliente', 150)->nullable();
            $table->date('fecha_emision');
            $table->date('valida_hasta')->nullable();
            $table->decimal('total', 10, 2);
            $table->string('notas', 500)->nullable();
            $table->foreign('fk_usuario')->references('id_usuario')->on('usuarios')->restrictOnDelete();
            $table->foreign('fk_cliente')->references('id_cliente')->on('clientes')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('detalle_cotizacion', function (Blueprint $table) {
            $table->id('id_detalle_cotizacion');
            $table->unsignedBigInteger('fk_cotizacion');
            $table->string('descripcion', 200);
            $table->integer('cantidad');
            $table->decimal('precio_unitario', 10, 2);
            $table->decimal('subtotal', 10, 2);
            $table->foreign('fk_cotizacion')->references('id_cotizacion')->on('cotizaciones')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('detalle_cotizacion');
        Schema::dropIfExists('cotizaciones');
    }
};
