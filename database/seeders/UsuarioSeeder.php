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
            'nombre' => 'Jostyn',
            'apellido' => 'Perez',
            'usuario' => 'JostynPerez123',
            'password' => 'JostynPerez123',
            'fk_rol' => $admin,
        ]);
    
    }
}
