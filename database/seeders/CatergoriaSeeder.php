<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Categoria;

class CatergoriaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Categoria::create(['categoria' => 'Lapices']);
        Categoria::create(['categoria' => 'Cuadernos']);
        Categoria::create(['categoria' => 'Crayones']);
        Categoria::create(['categoria' => 'Lapiceros']);
        Categoria::create(['categoria' => 'Borradores']);
    }
}
