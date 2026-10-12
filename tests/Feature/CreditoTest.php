<?php

namespace Tests\Feature;

use App\Models\Cliente;
use App\Models\Credito;
use App\Models\Permiso;
use App\Models\Rol;
use App\Models\Usuario;
use App\Models\Venta;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CreditoTest extends TestCase
{
    use RefreshDatabase;

    private Usuario $usuario;

    protected function setUp(): void
    {
        parent::setUp();
        $rol = Rol::create(['nombre_rol' => 'Operador', 'descripcion_rol' => 'Pruebas']);
        $permisos = collect(['clientes', 'creditos', 'ventas'])->map(fn ($tipo) => Permiso::create(['tipo_permiso' => $tipo]));
        $rol->permisos()->sync($permisos->pluck('id_permisos'));
        $this->usuario = Usuario::create([
            'nombre' => 'Prueba', 'apellido' => 'Usuario', 'usuario' => 'test-user',
            'password' => 'password', 'fk_rol' => $rol->id_rol,
        ]);
        $this->actingAs($this->usuario);
    }

    private function crearCredito(Cliente $cliente, string $saldo, string $inicio = '2026-01-01', string $vencimiento = '2026-12-31'): Credito
    {
        $venta = Venta::create([
            'fecha_venta' => $inicio . ' 10:00:00', 'total' => $saldo,
            'fk_cliente' => $cliente->id_cliente, 'fk_usuario' => $this->usuario->id_usuario,
        ]);
        return Credito::create([
            'fk_cliente' => $cliente->id_cliente, 'fk_venta' => $venta->id_venta,
            'fk_usuario' => $this->usuario->id_usuario, 'monto_total' => $saldo,
            'saldo_pendiente' => $saldo, 'fecha_inicio' => $inicio,
            'fecha_vencimiento' => $vencimiento, 'estado' => 'pendiente',
        ]);
    }

    public function test_partial_payment_reduces_credit_balance(): void
    {
        $credito = $this->crearCredito(Cliente::create(['nombre_cliente' => 'Ana', 'apellido_cliente' => 'Lopez']), '100.00');

        $this->post("/creditos/{$credito->id_credito}/abonos", ['monto' => '35.25'])->assertRedirect();

        $this->assertSame('64.75', $credito->fresh()->saldo_pendiente);
        $this->assertSame('pendiente', $credito->fresh()->estado);
        $this->assertDatabaseHas('abonos_creditos', ['fk_credito' => $credito->id_credito, 'monto' => '35.25', 'fk_usuario' => $this->usuario->id_usuario]);
    }

    public function test_full_payment_marks_credit_as_paid(): void
    {
        $credito = $this->crearCredito(Cliente::create(['nombre_cliente' => 'Ana', 'apellido_cliente' => 'Lopez']), '40.00');

        $this->post("/creditos/{$credito->id_credito}/abonos", ['monto' => '40.00'])->assertRedirect();

        $this->assertSame('0.00', $credito->fresh()->saldo_pendiente);
        $this->assertSame('pagado', $credito->fresh()->estado);
        $this->post("/creditos/{$credito->id_credito}/abonos", ['monto' => '1'])->assertSessionHasErrors('monto');
    }

    public function test_payment_greater_than_balance_is_rejected_without_mutation(): void
    {
        $credito = $this->crearCredito(Cliente::create(['nombre_cliente' => 'Ana', 'apellido_cliente' => 'Lopez']), '10.00');

        $this->post("/creditos/{$credito->id_credito}/abonos", ['monto' => '10.01'])->assertSessionHasErrors('monto');

        $this->assertSame('10.00', $credito->fresh()->saldo_pendiente);
        $this->assertDatabaseCount('abonos_creditos', 0);
    }

    public function test_customer_payment_is_distributed_oldest_credit_first(): void
    {
        $cliente = Cliente::create(['nombre_cliente' => 'Ana', 'apellido_cliente' => 'Lopez']);
        $old = $this->crearCredito($cliente, '30.00', '2026-01-01');
        $new = $this->crearCredito($cliente, '50.00', '2026-02-01');

        $this->post("/clientes/{$cliente->id_cliente}/abonar", ['monto' => '45.00'])->assertRedirect();

        $this->assertSame('pagado', $old->fresh()->estado);
        $this->assertSame('0.00', $old->fresh()->saldo_pendiente);
        $this->assertSame('35.00', $new->fresh()->saldo_pendiente);
        $this->assertDatabaseHas('abonos_creditos', ['fk_credito' => $old->id_credito, 'monto' => '30.00']);
        $this->assertDatabaseHas('abonos_creditos', ['fk_credito' => $new->id_credito, 'monto' => '15.00']);
    }

    public function test_credit_listing_marks_overdue_pending_credits(): void
    {
        $cliente = Cliente::create(['nombre_cliente' => 'Ana', 'apellido_cliente' => 'Lopez']);
        $credito = $this->crearCredito($cliente, '12.00', '2026-01-01', now()->subDay()->toDateString());

        $this->get('/creditos')->assertOk();

        $this->assertSame('vencido', $credito->fresh()->estado);
    }

    public function test_customer_json_search_and_quick_creation_follow_contract(): void
    {
        Cliente::create(['nombre_cliente' => 'Ana', 'apellido_cliente' => 'Lopez', 'numero_cliente' => '555100']);
        $response = $this->getJson('/clientes/buscar?q=5551')->assertOk();
        $response->assertJsonCount(1)->assertJsonStructure([['id_cliente', 'nombre_cliente', 'apellido_cliente', 'numero_cliente', 'deuda_total']]);
        $this->assertIsNumeric($response->json('0.deuda_total'));

        $this->postJson('/clientes/rapido', [
            'nombre_cliente' => 'Juan', 'apellido_cliente' => 'Perez', 'numero_cliente' => '555200',
        ])->assertCreated()->assertExactJson([
            'id_cliente' => 2, 'nombre_cliente' => 'Juan', 'apellido_cliente' => 'Perez', 'numero_cliente' => '555200',
        ]);
        $this->postJson('/clientes/rapido', ['nombre_cliente' => 'Juan'])->assertUnprocessable()->assertJsonValidationErrors(['apellido_cliente']);
    }

    public function test_customer_with_sales_cannot_be_deleted(): void
    {
        $cliente = Cliente::create(['nombre_cliente' => 'Ana', 'apellido_cliente' => 'Lopez']);
        Venta::create(['fecha_venta' => now(), 'total' => '12.00', 'fk_cliente' => $cliente->id_cliente, 'fk_usuario' => $this->usuario->id_usuario]);

        $this->delete("/clientes/{$cliente->id_cliente}")->assertSessionHas('flash.message', 'Este cliente tiene ventas asociadas y no puede eliminarse.');

        $this->assertDatabaseHas('clientes', ['id_cliente' => $cliente->id_cliente]);
    }

    public function test_client_and_credit_permissions_are_enforced(): void
    {
        $rol = Rol::create(['nombre_rol' => 'Sin permisos']);
        $sinPermisos = Usuario::create([
            'nombre' => 'Otro', 'apellido' => 'Usuario', 'usuario' => 'no-permissions',
            'password' => 'password', 'fk_rol' => $rol->id_rol,
        ]);
        $this->actingAs($sinPermisos);

        $this->getJson('/clientes/buscar?q=ana')->assertForbidden();
        $this->postJson('/clientes/rapido', ['nombre_cliente' => 'N', 'apellido_cliente' => 'N'])->assertForbidden();
        $this->get('/clientes')->assertRedirect();
        $this->get('/creditos')->assertRedirect();
    }
}
