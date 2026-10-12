<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id('id_rol');
            $table->string('nombre_rol', 100)->unique();
            $table->text('descripcion_rol')->nullable();
            $table->timestamps();
        });

        Schema::create('permisos', function (Blueprint $table) {
            $table->id('id_permisos');
            $table->string('tipo_permiso', 100)->unique();
            $table->timestamps();
        });

        Schema::create('rol_permiso', function (Blueprint $table) {
            $table->id('id_rol_permiso');
            $table->unsignedBigInteger('fk_rol');
            $table->unsignedBigInteger('fk_permiso');
            $table->foreign('fk_rol')->references('id_rol')->on('roles')->cascadeOnDelete();
            $table->foreign('fk_permiso')->references('id_permisos')->on('permisos')->cascadeOnDelete();
            $table->unique(['fk_rol', 'fk_permiso']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rol_permiso');
        Schema::dropIfExists('permisos');
        Schema::dropIfExists('roles');
    }
};
