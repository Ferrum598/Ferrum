<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('codigo_barras', function (Blueprint $table) {
            $table->id('id_codigo');
            $table->unsignedBigInteger('fk_lote');
            $table->string('codigo', 50)->unique();
            $table->enum('tipo_codigo', ['code128', 'ean13', 'code39', 'qr'])->default('code128');
            $table->boolean('es_personalizado')->default(true);
            $table->boolean('activo')->default(true);
            $table->integer('veces_impreso')->default(0);
            $table->timestamp('fecha_creacion')->useCurrent();
            $table->unsignedBigInteger('fk_usuario')->nullable();
            $table->foreign('fk_lote')->references('id_lote')->on('lotes')->restrictOnDelete();
            $table->foreign('fk_usuario')->references('id_usuario')->on('usuarios')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('codigo_barras');
    }
};
