<?php

namespace Database\Seeders;

use App\Models\Permiso;
use App\Models\Rol;
use Illuminate\Database\Seeder;

class RolSeeder extends Seeder
{
    public const PERMISOS = [
        'dashboard',
        'ventas',
        'comprobantes',
        'inventario',
        'categorias',
        'codigos_barras',
        'clientes',
        'creditos',
        'reportes',
        'gastos',
    ];

    public function run(): void
    {
        $permisos = [];
        foreach (self::PERMISOS as $tipo) {
            $permisos[$tipo] = Permiso::firstOrCreate(['tipo_permiso' => $tipo]);
        }

        $admin = Rol::firstOrCreate(
            ['nombre_rol' => 'Administrador'],
            ['descripcion_rol' => 'Acceso total al sistema, reportes y gastos']
        );

        $admin->permisos()->syncWithoutDetaching(collect($permisos)->pluck('id_permisos')->all());
        // $empleado->permisos()->syncWithoutDetaching(
        //     collect($permisos)->only(['ventas', 'comprobantes', 'inventario', 'codigos_barras', 'clientes', 'creditos'])->pluck('id_permisos')->all()
        // );
    }
}
