<?php

use App\Models\Categoria;
use App\Models\CodigoBarra;
use App\Models\Lote;
use App\Models\Producto;
use App\Models\Rol;
use App\Models\Usuario;
use Database\Seeders\RolSeeder;
use Database\Seeders\UsuarioSeeder;

beforeEach(function () {
    $this->withoutVite();
    $this->seed(RolSeeder::class);
    $this->seed(UsuarioSeeder::class);
    $this->admin = Usuario::where('usuario', 'JostynPerez123')->first();
});

$datosProducto = fn (array $extra = []) => array_merge([
    'nombre_producto' => 'Martillo',
    'descripcion' => 'Martillo de acero',
    'fk_categoria' => null,
    'nombre_lote' => 'Lote enero',
    'precio_compra' => 20.5,
    'precio_venta' => 35,
    'cantidad' => 10,
    'fecha_ingreso' => '2025-11-01',
], $extra);

test('crea producto con primer lote y codigo de barras', function () use ($datosProducto) {
    $this->actingAs($this->admin)
        ->post('/inventario/guardar', $datosProducto())
        ->assertRedirect(route('inventario.index'));

    $producto = Producto::where('nombre_producto', 'Martillo')->firstOrFail();
    $lote = $producto->lotes()->firstOrFail();

    expect($lote->cantidad)->toBe(10)
        ->and($lote->cantidad_disponible)->toBe(10)
        ->and($producto->existencias())->toBe(10);

    $codigo = CodigoBarra::where('fk_lote', $lote->id_lote)->firstOrFail();
    expect($codigo->codigo)->toBe('FER-' . str_pad((string) $lote->id_lote, 6, '0', STR_PAD_LEFT));

    $this->actingAs($this->admin)->get('/inventario')->assertOk();
});

test('rechaza precios negativos y cantidades no enteras', function () use ($datosProducto) {
    $this->actingAs($this->admin)
        ->post('/inventario/guardar', $datosProducto(['precio_venta' => -1, 'cantidad' => 2.5]))
        ->assertSessionHasErrors(['precio_venta', 'cantidad']);

    expect(Producto::count())->toBe(0);
});

test('agrega un segundo lote con otro precio', function () use ($datosProducto) {
    $this->actingAs($this->admin)->post('/inventario/guardar', $datosProducto());
    $producto = Producto::firstOrFail();

    $this->actingAs($this->admin)
        ->post("/inventario/{$producto->id_producto}/lotes", $datosProducto(['nombre_lote' => 'Lote febrero', 'precio_venta' => 40, 'cantidad' => 5]))
        ->assertRedirect(route('inventario.index'));

    expect($producto->lotes()->count())->toBe(2)
        ->and($producto->existencias())->toBe(15)
        ->and(CodigoBarra::count())->toBe(2);
});

test('reponer un lote agotado lo reactiva y ajusta la cantidad total', function () use ($datosProducto) {
    $this->actingAs($this->admin)->post('/inventario/guardar', $datosProducto());
    $lote = Lote::firstOrFail();
    $lote->update(['cantidad_disponible' => 0, 'activo' => false]);

    $this->actingAs($this->admin)
        ->post("/inventario/lotes/{$lote->id_lote}/actualizar", [
            'nombre_lote' => 'Lote enero',
            'precio_compra' => 20.5,
            'precio_venta' => 36,
            'fecha_ingreso' => '2025-11-01',
            'cantidad_disponible' => 15,
            'activo' => false,
        ])->assertRedirect(route('inventario.index'));

    $lote->refresh();
    expect($lote->activo)->toBeTrue()
        ->and($lote->cantidad_disponible)->toBe(15)
        ->and($lote->cantidad)->toBe(15);
});

test('eliminar un producto es una baja logica', function () use ($datosProducto) {
    $this->actingAs($this->admin)->post('/inventario/guardar', $datosProducto());
    $producto = Producto::firstOrFail();

    $this->actingAs($this->admin)->post("/inventario/{$producto->id_producto}/eliminar")->assertRedirect();

    $producto->refresh();
    expect($producto->activo)->toBeFalse()
        ->and($producto->lotes()->where('activo', true)->count())->toBe(0)
        ->and(Producto::count())->toBe(1);
});

test('no permite eliminar una categoria con productos', function () use ($datosProducto) {
    $categoria = Categoria::create(['nombre_categoria' => 'Herramientas']);
    $this->actingAs($this->admin)->post('/inventario/guardar', $datosProducto(['fk_categoria' => $categoria->id_categoria]));

    $this->actingAs($this->admin)
        ->post("/categorias/{$categoria->id_categoria}/eliminar")
        ->assertSessionHas('flash', fn ($f) => $f['icon'] === 'error');

    expect(Categoria::count())->toBe(1);

    $vacia = Categoria::create(['nombre_categoria' => 'Vacia']);
    $this->actingAs($this->admin)->post("/categorias/{$vacia->id_categoria}/eliminar");
    expect(Categoria::where('id_categoria', $vacia->id_categoria)->exists())->toBeFalse();
});

test('genera codigos personalizados validando el formato', function () use ($datosProducto) {
    $this->actingAs($this->admin)->post('/inventario/guardar', $datosProducto());
    $lote = Lote::firstOrFail();

    $this->actingAs($this->admin)
        ->post('/codigos-barras/generar', ['fk_lote' => $lote->id_lote, 'tipo_codigo' => 'ean13', 'codigo' => 'ABC'])
        ->assertSessionHasErrors('codigo');

    $this->actingAs($this->admin)
        ->post('/codigos-barras/generar', ['fk_lote' => $lote->id_lote, 'tipo_codigo' => 'ean13', 'codigo' => '780123456789'])
        ->assertSessionHasNoErrors();

    expect(CodigoBarra::where('codigo', '7801234567894')->exists())->toBeTrue();
});

test('registrar impresion incrementa veces_impreso', function () use ($datosProducto) {
    $this->actingAs($this->admin)->post('/inventario/guardar', $datosProducto());
    $codigo = CodigoBarra::firstOrFail();

    $this->actingAs($this->admin)->get("/codigos-barras/imprimir?codigos={$codigo->id_codigo}&copias=3")->assertOk();
    $this->actingAs($this->admin)->postJson('/codigos-barras/imprimir/registrar', ['ids' => [$codigo->id_codigo]])->assertOk();

    expect($codigo->fresh()->veces_impreso)->toBe(1);
});

test('un usuario sin permisos no accede al modulo', function () {
    $rol = Rol::create(['nombre_rol' => 'Sin permisos', 'descripcion_rol' => 'Prueba']);
    $usuario = Usuario::create([
        'nombre' => 'Sin', 'apellido' => 'Permiso', 'usuario' => 'sinpermiso', 'password' => 'secreto123', 'fk_rol' => $rol->id_rol,
    ]);

    foreach (['/inventario', '/categorias', '/codigos-barras'] as $url) {
        $this->actingAs($usuario)->get($url)->assertRedirect();
    }
    $this->actingAs($usuario)->post('/inventario/guardar', [])->assertRedirect();
    expect(Producto::count())->toBe(0);
});
