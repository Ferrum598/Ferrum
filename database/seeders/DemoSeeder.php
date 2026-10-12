<?php

namespace Database\Seeders;

use App\Models\Categoria;
use App\Models\Cliente;
use App\Models\CodigoBarra;
use App\Models\Lote;
use App\Models\Producto;
use Illuminate\Database\Seeder;

// Datos de ejemplo para desarrollo: productos con varios lotes a distinto precio y un cliente
class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $lapices = Categoria::where('nombre_categoria', 'Lapices')->value('id_categoria');
        $cuadernos = Categoria::where('nombre_categoria', 'Cuadernos')->value('id_categoria');

        $catalogo = [
            ['Lápiz #2', $lapices, [['Lote octubre', 1.00, 2.00, 100], ['Lote noviembre', 1.25, 2.50, 50]]],
            ['Cuaderno 100 hojas', $cuadernos, [['Lote 1', 8.00, 12.00, 30]]],
        ];

        foreach ($catalogo as [$nombre, $categoria, $lotes]) {
            $producto = Producto::create(['nombre_producto' => $nombre, 'fk_categoria' => $categoria]);
            foreach ($lotes as [$nombreLote, $compra, $venta, $cantidad]) {
                $lote = Lote::create([
                    'nombre_lote' => $nombreLote,
                    'fk_producto' => $producto->id_producto,
                    'precio_compra' => $compra,
                    'precio_venta' => $venta,
                    'cantidad' => $cantidad,
                    'cantidad_disponible' => $cantidad,
                    'fecha_ingreso' => now()->toDateString(),
                ]);
                CodigoBarra::generarParaLote($lote);
            }
        }

        Cliente::create(['nombre_cliente' => 'Cliente', 'apellido_cliente' => 'Demo', 'numero_cliente' => '55551234']);
    }
}
