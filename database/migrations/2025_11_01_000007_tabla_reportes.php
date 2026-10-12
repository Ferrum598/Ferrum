<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reporte_ventas', function (Blueprint $table) {
            $table->id('id_reporte');
            $table->unsignedBigInteger('fk_usuario');
            $table->enum('tipo_periodo', ['diario', 'semanal', 'mensual', 'anual']);
            $table->date('fecha_inicio');
            $table->date('fecha_fin');
            $table->integer('cantidad_ventas')->default(0);
            $table->decimal('total_contado', 12, 2)->default(0);
            $table->decimal('total_credito', 12, 2)->default(0);
            $table->decimal('total_abonos', 12, 2)->default(0);
            $table->decimal('total_ingresos', 12, 2)->default(0);
            $table->timestamp('fecha_generacion')->useCurrent();
            $table->foreign('fk_usuario')->references('id_usuario')->on('usuarios')->restrictOnDelete();
            $table->unique(['tipo_periodo', 'fecha_inicio', 'fecha_fin']);
            $table->timestamps();
        });

        Schema::create('gastos_fijos', function (Blueprint $table) {
            $table->id('id_gasto');
            $table->unsignedBigInteger('fk_usuario');
            $table->string('nombre', 100);
            $table->string('descripcion', 255)->nullable();
            $table->decimal('monto', 10, 2);
            $table->boolean('activo')->default(true);
            $table->foreign('fk_usuario')->references('id_usuario')->on('usuarios')->restrictOnDelete();
            $table->timestamps();
        });

        Schema::create('reportes_ganancias', function (Blueprint $table) {
            $table->id('id_reporte_ganancias');
            $table->unsignedBigInteger('fk_usuario');
            $table->smallInteger('mes');
            $table->smallInteger('anio');
            $table->decimal('total_ingreso', 12, 2)->default(0);
            $table->decimal('costo_productos', 12, 2)->default(0);
            $table->decimal('total_gastos', 12, 2)->default(0);
            $table->decimal('ganancia_neta', 12, 2)->default(0);
            $table->timestamp('fecha_generacion')->useCurrent();
            $table->foreign('fk_usuario')->references('id_usuario')->on('usuarios')->restrictOnDelete();
            $table->unique(['mes', 'anio']);
            $table->timestamps();
        });

        Schema::create('detalle_reporte_gasto', function (Blueprint $table) {
            $table->id('id_detalle_gasto');
            $table->unsignedBigInteger('fk_reporte_ganancias');
            $table->unsignedBigInteger('fk_gasto');
            $table->decimal('monto', 10, 2);
            $table->foreign('fk_reporte_ganancias')->references('id_reporte_ganancias')->on('reportes_ganancias')->cascadeOnDelete();
            $table->foreign('fk_gasto')->references('id_gasto')->on('gastos_fijos')->restrictOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('detalle_reporte_gasto');
        Schema::dropIfExists('reportes_ganancias');
        Schema::dropIfExists('gastos_fijos');
        Schema::dropIfExists('reporte_ventas');
    }
};
