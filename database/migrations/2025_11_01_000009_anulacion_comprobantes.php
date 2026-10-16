<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ventas', function (Blueprint $table) {
            $table->boolean('anulado')->default(false);
        });

        Schema::table('comprobantes', function (Blueprint $table) {
            $table->boolean('anulado')->default(false);
            $table->timestamp('fecha_anulacion')->nullable();
            $table->unsignedBigInteger('fk_usuario_anulacion')->nullable();
            $table->foreign('fk_usuario_anulacion')->references('id_usuario')->on('usuarios')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('comprobantes', function (Blueprint $table) {
            $table->dropForeign(['fk_usuario_anulacion']);
            $table->dropColumn(['anulado', 'fecha_anulacion', 'fk_usuario_anulacion']);
        });

        Schema::table('ventas', function (Blueprint $table) {
            $table->dropColumn('anulado');
        });
    }
};
