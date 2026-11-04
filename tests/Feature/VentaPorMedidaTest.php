<?php

use App\Models\Comprobante;
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

    $this->producto = Producto::create(['nombre_producto' => 'Arena de río', 'descripcion' => 'Arena fina para repello', 'activo' => true]);
    $this->lote = Lote::create([
        'nombre_lote' => 'L1', 'fk_producto' => $this->producto->id_producto,
        'precio_compra' => 100, 'precio_venta' => 200,
        'cantidad' => 10, 'cantidad_disponible' => 10,
        'fecha_ingreso' => now()->toDateString(), 'activo' => true,
    ]);
});

function ventaMedida(float|int $cantidad, bool $fraccionado = true): array
{
    return ['items' => [['id_lote' => test()->lote->id_lote, 'cantidad' => $cantidad, 'fraccionado' => $fraccionado]], 'tipo_pago' => 'contado'];
}

test('venta por medida descuenta stock fraccionado y calcula el total', function () {
    $this->postJson('/ventas', ventaMedida(1.5))->assertCreated();

    $lote = $this->lote->fresh();
    expect($lote->cantidad_disponible)->toBe(8.5)
        ->and((float) Comprobante::first()->total)->toBe(300.0)
        ->and($lote->activo)->toBeTrue();
});

test('el stock entero sigue devolviendose como entero', function () {
    $this->postJson('/ventas', ventaMedida(2, false))->assertCreated();

    expect($this->lote->fresh()->cantidad_disponible)->toBe(8);
});

test('una cantidad decimal sin venta por medida se rechaza', function () {
    $this->postJson('/ventas', ventaMedida(0.5, false))->assertStatus(422);

    expect($this->lote->fresh()->cantidad_disponible)->toBe(10)->and(Comprobante::count())->toBe(0);
});

test('mas de dos decimales o cantidad cero se rechazan', function () {
    $this->postJson('/ventas', ventaMedida(0.125))->assertStatus(422);
    $this->postJson('/ventas', ventaMedida(0))->assertStatus(422);

    expect($this->lote->fresh()->cantidad_disponible)->toBe(10);
});

test('no se puede vender mas de lo disponible por medida', function () {
    $this->postJson('/ventas', ventaMedida(10.5))->assertStatus(422);

    expect($this->lote->fresh()->cantidad_disponible)->toBe(10);
});

test('vender el ultimo medio deja el lote agotado', function () {
    $this->lote->update(['cantidad_disponible' => 0.5]);

    $this->postJson('/ventas', ventaMedida(0.5))->assertCreated();

    $lote = $this->lote->fresh();
    expect($lote->cantidad_disponible)->toBe(0)->and($lote->activo)->toBeFalse();
});

test('el comprobante muestra la cantidad fraccionada y anular devuelve el stock', function () {
    $id = $this->postJson('/ventas', ventaMedida(0.5))->json('id_comprobante');

    $version = app(\App\Http\Middleware\HandleInertiaRequests::class)->version(request());
    $this->get("/comprobantes/{$id}", ['X-Inertia' => 'true', 'X-Inertia-Version' => (string) $version])
        ->assertOk()->assertJsonPath('props.comprobante.detalles.0.cantidad', 0.5);

    $this->post("/comprobantes/{$id}/anular")->assertRedirect();
    expect($this->lote->fresh()->cantidad_disponible)->toBe(10);
});

test('la busqueda por medida encuentra por nombre o descripcion sin importar mayusculas', function () {
    $this->getJson('/ventas/medida?q=ARENA')->assertOk()->assertJsonPath('0.nombre_producto', 'Arena de río');
    $this->getJson('/ventas/medida?q=repello')->assertOk()->assertJsonPath('0.id_producto', $this->producto->id_producto);
    $this->getJson('/ventas/medida?q=cemento')->assertOk()->assertJsonCount(0);
    $this->getJson('/ventas/medida?q=')->assertOk()->assertJsonCount(0);
});

test('la busqueda por medida ignora productos sin existencias', function () {
    $this->lote->update(['cantidad_disponible' => 0, 'activo' => false]);

    $this->getJson('/ventas/medida?q=arena')->assertOk()->assertJsonCount(0);
});
