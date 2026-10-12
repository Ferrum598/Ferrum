<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clientes', function (Blueprint $table) {
            $table->id('id_cliente');
            $table->string('nombre_cliente', 100);
            $table->string('apellido_cliente', 100);
            $table->string('numero_cliente', 20)->nullable();
            $table->timestamps();
        });

        Schema::create('ventas', function (Blueprint $table) {
            $table->id('id_venta');
            $table->timestamp('fecha_venta')->useCurrent();
            $table->decimal('total', 10, 2);
            $table->unsignedBigInteger('fk_cliente')->nullable();
            $table->unsignedBigInteger('fk_usuario');
            $table->foreign('fk_cliente')->references('id_cliente')->on('clientes')->restrictOnDelete();
            $table->foreign('fk_usuario')->references('id_usuario')->on('usuarios')->restrictOnDelete();
            $table->timestamps();
        });

        Schema::create('detalle_venta', function (Blueprint $table) {
            $table->id('id_detalle');
            $table->unsignedBigInteger('fk_venta');
            $table->unsignedBigInteger('fk_lote');
            $table->integer('cantidad');
            $table->decimal('precio_unitario', 10, 2);
            $table->decimal('costo_unitario', 10, 2);
            $table->decimal('subtotal', 10, 2);
            $table->foreign('fk_venta')->references('id_venta')->on('ventas')->restrictOnDelete();
            $table->foreign('fk_lote')->references('id_lote')->on('lotes')->restrictOnDelete();
            $table->timestamps();
        });

        Schema::create('comprobantes', function (Blueprint $table) {
            $table->id('id_comprobante');
            $table->unsignedBigInteger('fk_venta')->unique();
            $table->unsignedBigInteger('fk_usuario');
            $table->string('numero_comprobante', 30)->unique();
            $table->timestamp('fecha_emision')->useCurrent();
            $table->decimal('total', 10, 2);
            $table->integer('veces_impreso')->default(0);
            $table->foreign('fk_venta')->references('id_venta')->on('ventas')->restrictOnDelete();
            $table->foreign('fk_usuario')->references('id_usuario')->on('usuarios')->restrictOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comprobantes');
        Schema::dropIfExists('detalle_venta');
        Schema::dropIfExists('ventas');
        Schema::dropIfExists('clientes');
    }
};
