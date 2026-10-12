<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categorias', function (Blueprint $table) {
            $table->id('id_categoria');
            $table->string('nombre_categoria', 100);
            $table->timestamps();
        });

        Schema::create('imagen_producto', function (Blueprint $table) {
            $table->id('id_imagen_producto');
            $table->string('nombre_imagen', 255)->nullable();
            $table->binary('imagen')->nullable();
            $table->timestamps();
        });

        Schema::create('productos', function (Blueprint $table) {
            $table->id('id_producto');
            $table->string('nombre_producto', 100);
            $table->text('descripcion')->nullable();
            $table->boolean('activo')->default(true);
            $table->unsignedBigInteger('fk_categoria')->nullable();
            $table->unsignedBigInteger('fk_imagen_producto')->nullable();
            $table->foreign('fk_categoria')->references('id_categoria')->on('categorias')->nullOnDelete();
            $table->foreign('fk_imagen_producto')->references('id_imagen_producto')->on('imagen_producto')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('lotes', function (Blueprint $table) {
            $table->id('id_lote');
            $table->string('nombre_lote', 100)->nullable();
            $table->unsignedBigInteger('fk_producto');
            $table->decimal('precio_compra', 10, 2);
            $table->decimal('precio_venta', 10, 2);
            $table->integer('cantidad');
            $table->integer('cantidad_disponible');
            $table->date('fecha_ingreso');
            $table->boolean('activo')->default(true);
            $table->foreign('fk_producto')->references('id_producto')->on('productos')->restrictOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lotes');
        Schema::dropIfExists('productos');
        Schema::dropIfExists('imagen_producto');
        Schema::dropIfExists('categorias');
    }
};
