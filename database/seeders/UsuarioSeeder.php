<?php

namespace Database\Seeders;

use App\Models\Rol;
use App\Models\Usuario;
use Illuminate\Database\Seeder;

class UsuarioSeeder extends Seeder
{
    public function run(): void
    {
        $admin = Rol::where('nombre_rol', 'Administrador')->value('id_rol');

        Usuario::create([
            'nombre' => 'Saul',
            'apellido' => 'Lix',
            'usuario' => 'SaulLix123',
            'password' => 'SaulLix123',
            'fk_rol' => $admin,
        ]);
    
    }
}
