<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('proformas', function (Blueprint $table){
            $table->id('id_proforma');
            $table->unsignedBigInteger('fk_id_usuario');
            $table->unsignedBigInteger('fk_id_pedido');
            $table->date('fecha_proforma')->nullable();
            $table->timestamps();
            $table->foreign('fk_id_usuario')->references('id_usuario')->on('usuarios')->onDelete('cascade');
            $table->foreign('fk_id_pedido')->references('id_pedido')->on('pedidos')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('proformas');
    }
};
