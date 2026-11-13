<?php

use App\Models\Cliente;
use App\Models\Comprobante;
use App\Models\Usuario;
use App\Models\Venta;
use Database\Seeders\RolSeeder;
use Database\Seeders\UsuarioSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RolSeeder::class);
    $this->seed(UsuarioSeeder::class);
    $this->usuario = Usuario::where('usuario', 'SaulLix123')->firstOrFail();
    $this->actingAs($this->usuario);
    $this->cliente = Cliente::create([
        'nombre_cliente' => 'Ana',
        'apellido_cliente' => 'López',
        'numero_cliente' => '12345678',
    ]);
    $this->inertiaHeaders = [
        'X-Inertia' => 'true',
        'X-Inertia-Version' => (string) app(\App\Http\Middleware\HandleInertiaRequests::class)->version(request()),
    ];
});

function crearComprobantePrueba(Usuario $usuario, ?Cliente $cliente, int $numero): Comprobante
{
    $venta = Venta::create([
        'fk_usuario' => $usuario->id_usuario,
        'fk_cliente' => $cliente?->id_cliente,
        'fecha_venta' => '2026-11-12 10:00:00',
        'total' => 10,
    ]);

    return Comprobante::create([
        'fk_venta' => $venta->id_venta,
        'fk_usuario' => $usuario->id_usuario,
        'numero_comprobante' => sprintf('C-%06d', $numero),
        'fecha_emision' => '2026-11-12 10:00:00',
        'total' => 10,
        'veces_impreso' => 0,
    ]);
}

test('comprobantes carga paginas distintas y conserva filtros de fecha y cliente', function () {
    for ($i = 1; $i <= 17; $i++) {
        crearComprobantePrueba($this->usuario, $this->cliente, $i);
    }
    crearComprobantePrueba($this->usuario, null, 18);

    $this->get('/comprobantes?q=ana&fecha=2026-11-12&page=1', $this->inertiaHeaders)
        ->assertOk()
        ->assertJsonPath('props.comprobantes.current_page', 1)
        ->assertJsonPath('props.comprobantes.last_page', 2)
        ->assertJsonPath('props.comprobantes.total', 17)
        ->assertJsonCount(15, 'props.comprobantes.data')
        ->assertJsonPath('props.comprobantes.data.0.numero_comprobante', 'C-000017');

    $this->get('/comprobantes?q=ana&fecha=2026-11-12&page=2', $this->inertiaHeaders)
        ->assertOk()
        ->assertJsonPath('props.comprobantes.current_page', 2)
        ->assertJsonCount(2, 'props.comprobantes.data')
        ->assertJsonPath('props.comprobantes.data.0.numero_comprobante', 'C-000002')
        ->assertJsonPath('props.comprobantes.data.1.numero_comprobante', 'C-000001')
        ->assertJsonPath('props.filtros.q', 'ana')
        ->assertJsonPath('props.filtros.fecha', '2026-11-12');
});

test('el comprobante entrega el telefono cuando hay cliente y admite ventas sin cliente', function () {
    $conCliente = crearComprobantePrueba($this->usuario, $this->cliente, 1);
    $sinCliente = crearComprobantePrueba($this->usuario, null, 2);

    $this->get("/comprobantes/{$conCliente->id_comprobante}", $this->inertiaHeaders)
        ->assertOk()->assertJsonPath('props.comprobante.cliente.numero', '12345678');
    $this->get("/comprobantes/{$sinCliente->id_comprobante}", $this->inertiaHeaders)
        ->assertOk()->assertJsonPath('props.comprobante.cliente', null);
});
