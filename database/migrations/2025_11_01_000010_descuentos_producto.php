<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('descuentos_producto', function (Blueprint $table) {
            $table->id('id_descuento');
            $table->unsignedBigInteger('fk_producto');
            $table->integer('cantidad_minima');
            $table->decimal('porcentaje', 5, 2);
            $table->foreign('fk_producto')->references('id_producto')->on('productos')->cascadeOnDelete();
            $table->unique(['fk_producto', 'cantidad_minima']);
            $table->timestamps();
        });

        Schema::table('detalle_venta', function (Blueprint $table) {
            $table->decimal('descuento_porcentaje', 5, 2)->default(0);
            $table->decimal('descuento_monto', 10, 2)->default(0);
        });
    }

    public function down(): void
    {
        Schema::table('detalle_venta', function (Blueprint $table) {
            $table->dropColumn(['descuento_porcentaje', 'descuento_monto']);
        });
        Schema::dropIfExists('descuentos_producto');
    }
};
