<?php

use App\Models\AbonoCredito;
use App\Models\Cliente;
use App\Models\Credito;
use App\Models\DetalleReporteGasto;
use App\Models\DetalleVenta;
use App\Models\GastoFijo;
use App\Models\Lote;
use App\Models\Producto;
use App\Models\ReporteGanancia;
use App\Models\ReporteVenta;
use App\Models\Usuario;
use App\Models\Venta;
use Database\Seeders\RolSeeder;
use Database\Seeders\UsuarioSeeder;

beforeEach(function () {
    $this->withoutVite();
    $this->seed([RolSeeder::class, UsuarioSeeder::class]);
    $this->admin = Usuario::where('usuario', 'JostynPerez123')->firstOrFail();
    $this->actingAs($this->admin);

    $categoria = \App\Models\Categoria::create(['nombre_categoria' => 'General']);
    $this->producto = Producto::create(['nombre_producto' => 'Producto test', 'fk_categoria' => $categoria->id_categoria, 'activo' => true]);
    $this->lote = Lote::create([
        'nombre_lote' => 'Lote test', 'fk_producto' => $this->producto->id_producto,
        'precio_compra' => 10, 'precio_venta' => 20, 'cantidad' => 100,
        'cantidad_disponible' => 100, 'fecha_ingreso' => '2026-01-01', 'activo' => true,
    ]);
    $this->cliente = Cliente::create(['nombre_cliente' => 'Cliente', 'apellido_cliente' => 'Prueba']);
});

function crearVentaReporte($test, string $fecha, float $total, float $cantidad, float $costoUnitario, bool $credito = false): Venta
{
    $venta = Venta::create([
        'fecha_venta' => $fecha,
        'total' => $total,
        'fk_cliente' => $credito ? $test->cliente->id_cliente : null,
        'fk_usuario' => $test->admin->id_usuario,
    ]);
    DetalleVenta::create([
        'fk_venta' => $venta->id_venta, 'fk_lote' => $test->lote->id_lote,
        'cantidad' => $cantidad, 'precio_unitario' => $total / $cantidad,
        'costo_unitario' => $costoUnitario, 'subtotal' => $total,
    ]);
    if ($credito) {
        Credito::create([
            'fk_cliente' => $test->cliente->id_cliente, 'fk_venta' => $venta->id_venta,
            'fk_usuario' => $test->admin->id_usuario, 'monto_total' => $total,
            'saldo_pendiente' => $total - 50, 'fecha_inicio' => substr($fecha, 0, 10),
            'fecha_vencimiento' => substr($fecha, 0, 10), 'estado' => 'pendiente',
        ]);
    }
    return $venta;
}

test('genera reportes diarios y mensuales de ventas con contado, crédito y abonos; regenerar no duplica', function () {
    crearVentaReporte($this, '2026-04-10 10:00:00', 100, 5, 12, false);
    $ventaCredito = crearVentaReporte($this, '2026-04-10 11:00:00', 200, 10, 12, true);
    $credito = Credito::where('fk_venta', $ventaCredito->id_venta)->firstOrFail();
    AbonoCredito::create(['fk_credito' => $credito->id_credito, 'fk_usuario' => $this->admin->id_usuario, 'monto' => 50, 'fecha_abono' => '2026-04-10']);

    $this->post('/reportes/ventas/generar', ['tipo_periodo' => 'diario', 'fecha' => '2026-04-10'])->assertRedirect();
    $diario = ReporteVenta::where('tipo_periodo', 'diario')->firstOrFail();
    expect($diario->cantidad_ventas)->toBe(2)
        ->and((float) $diario->total_contado)->toBe(100.0)
        ->and((float) $diario->total_credito)->toBe(200.0)
        ->and((float) $diario->total_abonos)->toBe(50.0)
        ->and((float) $diario->total_ingresos)->toBe(150.0);

    $this->post('/reportes/ventas/generar', ['tipo_periodo' => 'mensual', 'fecha' => '2026-04-10'])->assertRedirect();
    $mensual = ReporteVenta::where('tipo_periodo', 'mensual')->firstOrFail();
    $this->get('/dashboard')->assertOk();
    $this->get("/reportes/ventas/{$diario->id_reporte}")->assertOk();
    expect($mensual->fecha_inicio->toDateString())->toBe('2026-04-01')
        ->and($mensual->fecha_fin->toDateString())->toBe('2026-04-30')
        ->and((float) $mensual->total_ingresos)->toBe(150.0);

    $this->post("/reportes/ventas/{$diario->id_reporte}/regenerar")->assertRedirect();
    expect(ReporteVenta::where('tipo_periodo', 'diario')->count())->toBe(1);
});

test('calcula ganancia neta sobre cobros con costo proporcional de abonos y registra pérdida', function () {
    crearVentaReporte($this, '2026-05-08 09:00:00', 100, 5, 12, false); // costo 60
    $ventaCredito = crearVentaReporte($this, '2026-04-20 09:00:00', 200, 10, 12, true); // costo 120
    $credito = Credito::where('fk_venta', $ventaCredito->id_venta)->firstOrFail();
    AbonoCredito::create(['fk_credito' => $credito->id_credito, 'fk_usuario' => $this->admin->id_usuario, 'monto' => 50, 'fecha_abono' => '2026-05-12']);
    $gasto = GastoFijo::create(['fk_usuario' => $this->admin->id_usuario, 'nombre' => 'Renta', 'descripcion' => null, 'monto' => 70, 'activo' => true]);

    $this->post('/reportes/ganancias/generar', ['mes' => 5, 'anio' => 2026])->assertRedirect();
    $reporte = ReporteGanancia::where(['mes' => 5, 'anio' => 2026])->firstOrFail();
    $this->get("/reportes/ganancias/{$reporte->id_reporte_ganancias}")->assertOk();
    expect((float) $reporte->total_ingreso)->toBe(150.0)
        ->and((float) $reporte->costo_productos)->toBe(90.0)
        ->and((float) $reporte->total_gastos)->toBe(70.0)
        ->and((float) $reporte->ganancia_neta)->toBe(-10.0)
        ->and($reporte->detalleGastos()->count())->toBe(1)
        ->and((int) $reporte->detalleGastos()->first()->fk_gasto)->toBe($gasto->id_gasto);

    $gasto->update(['monto' => 90]);
    $this->post('/reportes/ganancias/generar', ['mes' => 5, 'anio' => 2026])->assertRedirect();
    $reporte->refresh();
    expect(ReporteGanancia::where(['mes' => 5, 'anio' => 2026])->count())->toBe(1)
        ->and($reporte->detalleGastos()->count())->toBe(1)
        ->and((float) $reporte->detalleGastos()->first()->monto)->toBe(90.0);
});

test('desactiva en lugar de eliminar un gasto usado en un reporte', function () {
    $gasto = GastoFijo::create(['fk_usuario' => $this->admin->id_usuario, 'nombre' => 'Internet', 'monto' => 25, 'activo' => true]);
    $this->post('/reportes/ganancias/generar', ['mes' => 6, 'anio' => 2026])->assertRedirect();
    $this->delete("/gastos-fijos/{$gasto->id_gasto}")->assertRedirect();
    expect($gasto->fresh()->activo)->toBeFalse()
        ->and(DetalleReporteGasto::where('fk_gasto', $gasto->id_gasto)->exists())->toBeTrue();
});

test('empleado sin permiso no puede acceder a reportes ni gastos', function () {
    $empleado = Usuario::where('usuario', 'empleado')->firstOrFail();
    $this->actingAs($empleado);
    $this->getJson('/reportes/ventas')->assertForbidden();
    $this->getJson('/gastos-fijos')->assertForbidden();
});
