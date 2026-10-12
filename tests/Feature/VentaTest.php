<?php

use App\Models\CodigoBarra;
use App\Models\Cliente;
use App\Models\Comprobante;
use App\Models\Credito;
use App\Models\Lote;
use App\Models\Producto;
use App\Models\Rol;
use App\Models\Usuario;
use Database\Seeders\RolSeeder;
use Database\Seeders\UsuarioSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RolSeeder::class);
    $this->seed(UsuarioSeeder::class);
    $this->vendedor = Usuario::where('usuario', 'empleado')->first();
    $this->actingAs($this->vendedor);

    $producto = Producto::create(['nombre_producto' => 'Martillo', 'activo' => true]);
    $this->lote = Lote::create([
        'nombre_lote' => 'L1', 'fk_producto' => $producto->id_producto,
        'precio_compra' => 20, 'precio_venta' => 35.50,
        'cantidad' => 10, 'cantidad_disponible' => 10,
        'fecha_ingreso' => now()->toDateString(), 'activo' => true,
    ]);
    $this->cliente = Cliente::create(['nombre_cliente' => 'Ana', 'apellido_cliente' => 'Lopez']);
});

function venderPayload(array $extra = []): array
{
    return array_merge([
        'items' => [['id_lote' => test()->lote->id_lote, 'cantidad' => 2]],
        'tipo_pago' => 'contado',
    ], $extra);
}

test('venta de contado descuenta stock y crea comprobante', function () {
    $r = $this->postJson('/ventas', venderPayload())->assertCreated();

    expect($this->lote->fresh()->cantidad_disponible)->toBe(8);
    $c = Comprobante::first();
    expect($c->numero_comprobante)->toBe('C-000001')
        ->and((float) $c->total)->toBe(71.0)
        ->and($r->json('id_comprobante'))->toBe($c->id_comprobante)
        ->and(Credito::count())->toBe(0);
});

test('venta a credito crea credito con saldo igual al total', function () {
    $venc = now()->addDays(15)->toDateString();
    $this->postJson('/ventas', venderPayload([
        'tipo_pago' => 'credito', 'fk_cliente' => $this->cliente->id_cliente,
        'fecha_vencimiento' => $venc, 'descripcion' => 'fiado',
    ]))->assertCreated();

    $cr = Credito::first();
    expect((float) $cr->monto_total)->toBe(71.0)
        ->and((float) $cr->saldo_pendiente)->toBe(71.0)
        ->and($cr->fecha_vencimiento->toDateString())->toBe($venc)
        ->and($cr->estado)->toBe('pendiente')
        ->and($cr->fk_cliente)->toBe($this->cliente->id_cliente);
});

test('stock insuficiente se rechaza sin cambios', function () {
    $this->postJson('/ventas', venderPayload(['items' => [['id_lote' => $this->lote->id_lote, 'cantidad' => 11]]]))
        ->assertStatus(422);

    expect($this->lote->fresh()->cantidad_disponible)->toBe(10)
        ->and(Comprobante::count())->toBe(0);
});

test('credito sin cliente se rechaza', function () {
    $this->postJson('/ventas', venderPayload([
        'tipo_pago' => 'credito', 'fecha_vencimiento' => now()->addDay()->toDateString(),
    ]))->assertStatus(422)->assertJsonValidationErrors('fk_cliente');

    expect(Comprobante::count())->toBe(0)->and($this->lote->fresh()->cantidad_disponible)->toBe(10);
});

test('credito exige vencimiento futuro', function () {
    $this->postJson('/ventas', venderPayload([
        'tipo_pago' => 'credito', 'fk_cliente' => $this->cliente->id_cliente,
        'fecha_vencimiento' => now()->toDateString(),
    ]))->assertStatus(422)->assertJsonValidationErrors('fecha_vencimiento');
});

test('lote que llega a cero queda inactivo', function () {
    $this->postJson('/ventas', venderPayload(['items' => [['id_lote' => $this->lote->id_lote, 'cantidad' => 10]]]))
        ->assertCreated();

    $l = $this->lote->fresh();
    expect($l->cantidad_disponible)->toBe(0)->and($l->activo)->toBeFalse();

    $this->postJson('/ventas', venderPayload())->assertStatus(422);
});

test('los precios se toman del lote aunque el cliente envie otros', function () {
    $this->postJson('/ventas', venderPayload([
        'items' => [['id_lote' => $this->lote->id_lote, 'cantidad' => 1, 'precio_unitario' => 1, 'subtotal' => 1]],
        'total' => 1,
    ]))->assertCreated();

    $d = \App\Models\DetalleVenta::first();
    expect((float) $d->precio_unitario)->toBe(35.5)
        ->and((float) $d->costo_unitario)->toBe(20.0)
        ->and((float) $d->subtotal)->toBe(35.5)
        ->and((float) Comprobante::first()->total)->toBe(35.5);
});

test('comprobantes se numeran consecutivamente', function () {
    $this->postJson('/ventas', venderPayload());
    $this->postJson('/ventas', venderPayload());

    expect(Comprobante::orderBy('id_comprobante')->pluck('numero_comprobante')->all())
        ->toBe(['C-000001', 'C-000002']);
});

test('usuario sin permiso es denegado', function () {
    $rol = Rol::create(['nombre_rol' => 'Sin permisos', 'descripcion_rol' => 'x']);
    $u = Usuario::create(['nombre' => 'A', 'apellido' => 'B', 'usuario' => 'sinperm', 'password' => 'secreto123', 'fk_rol' => $rol->id_rol]);
    $this->actingAs($u);

    $this->postJson('/ventas', venderPayload())->assertForbidden();
    $this->get('/comprobantes')->assertRedirect();
    expect(Comprobante::count())->toBe(0);
});

test('busqueda por codigo de barras devuelve el lote', function () {
    CodigoBarra::create(['fk_lote' => $this->lote->id_lote, 'codigo' => 'ABC123', 'activo' => true]);

    $this->getJson('/ventas/codigo/ABC123')->assertOk()->assertJsonPath('lote.id_lote', $this->lote->id_lote);
    $this->getJson('/ventas/codigo/NOEXISTE')->assertNotFound();
});

test('comprobante se puede ver e imprimir', function () {
    $id = $this->postJson('/ventas', venderPayload())->json('id_comprobante');

    $version = app(\App\Http\Middleware\HandleInertiaRequests::class)->version(request());
    $this->get("/comprobantes/{$id}", ['X-Inertia' => 'true', 'X-Inertia-Version' => (string) $version])
        ->assertOk()->assertJsonPath('props.comprobante.numero_comprobante', 'C-000001');
    $this->postJson("/comprobantes/{$id}/impreso")->assertOk()->assertJson(['veces_impreso' => 1]);
});

test('el catalogo se pagina y la imagen se sirve como archivo', function () {
    for ($i = 1; $i <= 14; $i++) {
        $p = Producto::create(['nombre_producto' => "Extra $i", 'activo' => true]);
        Lote::create([
            'nombre_lote' => 'L', 'fk_producto' => $p->id_producto, 'precio_compra' => 1, 'precio_venta' => 2,
            'cantidad' => 5, 'cantidad_disponible' => 5, 'fecha_ingreso' => now()->toDateString(), 'activo' => true,
        ]);
    }
    $r = $this->getJson('/ventas/buscar')->assertOk();
    expect($r->json('data'))->toHaveCount(12)->and($r->json('last_page'))->toBe(2);

    $png = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
    $img = \App\Models\ImagenProducto::create(['nombre_imagen' => 'x.png', 'imagen' => base64_encode($png)]);
    $prod = Producto::first();
    $prod->update(['fk_imagen_producto' => $img->id_imagen_producto]);

    $this->get("/ventas/imagen/{$prod->id_producto}")->assertOk()->assertHeader('Content-Type', 'image/png');
});
