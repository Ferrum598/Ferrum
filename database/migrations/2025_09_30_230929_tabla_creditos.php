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
        Schema::create('creditos', function (Blueprint $table) {
            $table->id('id_credito');
            $table->enum('tipo_mov', ['credito', 'abono', 'abonoCredito']);
            $table->decimal('monto', 10, 2);
            $table->string('descripcion', 255)->nullable();
            $table->date('fecha_mov');
            $table->unsignedBigInteger('fk_id_usuario')->nullable();
            $table->unsignedBigInteger('fk_id_cliente')->nullable();
            $table->foreign('fk_id_usuario')->references('id_usuario')->on('usuarios')->onDelete('cascade');
            $table->foreign('fk_id_cliente')->references('id_cliente')->on('clientes')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('creditos');
    }
};
