<?php

namespace Database\Seeders;

use App\Models\Categoria;
use Illuminate\Database\Seeder;

class CategoriaSeeder extends Seeder
{
    public function run(): void
    {
        foreach (['Lapices', 'Cuadernos', 'Crayones', 'Lapiceros', 'Borradores'] as $nombre) {
            Categoria::firstOrCreate(['nombre_categoria' => $nombre]);
        }
    }
}
