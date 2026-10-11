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
        Schema::create('pedidos_productos', function (Blueprint $table){
            $table->id('id_pedido_producto');
            $table->unsignedBigInteger('fk_id_pedido');
            $table->unsignedBigInteger('fk_id_producto');
            $table->integer('cantidad');
            $table->decimal('total', 10, 2);
            $table->timestamps();
            $table->foreign('fk_id_pedido')->references('id_pedido')->on('pedidos')->onDelete('cascade');
            $table->foreign('fk_id_producto')->references('id_producto')->on('productos')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pedidos_productos');
    }
};
