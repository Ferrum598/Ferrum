<?php

use App\Models\CodigoBarra;
use App\Models\Lote;
use App\Models\Producto;
use App\Models\Usuario;
use Database\Seeders\RolSeeder;
use Database\Seeders\UsuarioSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RolSeeder::class);
    $this->seed(UsuarioSeeder::class);
    $this->actingAs(Usuario::where('usuario', 'SaulLix123')->first());

    $this->producto = Producto::create([
        'nombre_producto' => 'Arena de río',
        'descripcion' => 'Arena fina para repello',
        'activo' => true,
    ]);
    $this->lote = Lote::create([
        'nombre_lote' => 'Lote principal',
        'fk_producto' => $this->producto->id_producto,
        'precio_compra' => 100,
        'precio_venta' => 200,
        'cantidad' => 10,
        'cantidad_disponible' => 10,
        'fecha_ingreso' => now()->toDateString(),
        'activo' => true,
    ]);
    CodigoBarra::generarParaLote($this->lote, auth()->id());
});

test('cotizaciones busca por nombre o descripcion sin distinguir mayusculas y muestra la descripcion', function () {
    $this->getJson('/cotizaciones/productos?q=ARENA')
        ->assertOk()
        ->assertJsonPath('0.descripcion', 'Arena fina para repello');
    $this->getJson('/cotizaciones/productos?q=REPello')
        ->assertOk()
        ->assertJsonPath('0.descripcion', 'Arena fina para repello');
});

test('cotizaciones usa el nombre como respaldo cuando el producto no tiene descripcion', function () {
    $producto = Producto::create([
        'nombre_producto' => 'Cemento gris',
        'descripcion' => null,
        'activo' => true,
    ]);
    $producto->lotes()->create([
        'nombre_lote' => 'Lote cemento',
        'precio_compra' => 100,
        'precio_venta' => 150,
        'cantidad' => 5,
        'cantidad_disponible' => 5,
        'fecha_ingreso' => now()->toDateString(),
        'activo' => true,
    ]);

    $this->getJson('/cotizaciones/productos?q=CEMENTO')
        ->assertOk()
        ->assertJsonPath('0.descripcion', 'Cemento gris');
});

test('inventario encuentra productos por descripcion y la impresion entrega la descripcion', function () {
    $this->getJson('/inventario/ids?buscar=REPello')
        ->assertOk()
        ->assertJsonFragment([$this->producto->id_producto]);

    $this->postJson('/inventario/imprimir/datos', ['ids' => [$this->producto->id_producto]])
        ->assertOk()
        ->assertJsonPath('0.descripcion', 'Arena fina para repello');
});

test('busqueda de codigos de barras encuentra productos por descripcion ignorando mayusculas', function () {
    $version = app(\App\Http\Middleware\HandleInertiaRequests::class)->version(request());

    $this->get('/codigos-barras?buscar=REPello', [
        'X-Inertia' => 'true',
        'X-Inertia-Version' => (string) $version,
    ])->assertOk()->assertJsonPath('props.codigos.data.0.producto', 'Arena de río');
});
