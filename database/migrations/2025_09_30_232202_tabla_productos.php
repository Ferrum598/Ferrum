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
        Schema::create('productos', function (Blueprint $table){
            $table->id('id_producto');
            $table->string('producto',100);
            $table->string('producto_plural',100)->nullable();
            $table->string('descripcion',255)->nullable();
            $table->string('codigo_barra')->nullable();
            $table->enum('estado', ['mostrado', 'oculto'])->default('mostrado');
            $table->enum('estatus', ['activo', 'inactivo'])->default('activo');
            $table->decimal('precio',10,2);
            $table->integer('cantidad');
            $table->unsignedBigInteger('fk_id_categoria')->nullable();
            $table->foreign('fk_id_categoria')->references('id_categoria')->on('categorias')->onDelete('cascade');
            $table->unsignedBigInteger('fk_id_imagen')->nullable();
            $table->foreign('fk_id_imagen')->references('id_imagen')->on('imagenes_productos')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('productos');
    }
};
