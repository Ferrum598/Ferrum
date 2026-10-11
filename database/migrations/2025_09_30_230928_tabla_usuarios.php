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
        Schema::create('usuarios', function (Blueprint $table) {
            $table->id('id_usuario');
            $table->string('usuario', 100);
            $table->string('password', 255);
            $table->bigInteger('nit')->unique();
            $table->string('nit2')->nullable();
            $table->string('telefono', 20)->nullable();
            $table->string('direccion',200)->nullable();
            $table->unsignedBigInteger('fk_id_rol');
            $table->unsignedBigInteger('fk_id_imagen')->nullable();
            $table->unsignedBigInteger('fk_id_total')->nullable();
            $table->foreign('fk_id_total')->references('id_total')->on('totales')->onDelete('set null');
            $table->foreign('fk_id_imagen')->references('id_imagen')->on('imagenes')->onDelete('cascade');
            $table->foreign('fk_id_rol')->references('id_rol')->on('roles')->onDelete('cascade');
            $table->timestamps();
        
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('usuarios');
    }
};
