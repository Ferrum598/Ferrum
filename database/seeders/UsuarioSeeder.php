<?php

namespace Database\Seeders;


use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\Usuario;

class UsuarioSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Usuario::create([
            'usuario' => 'JostynPerez123',
            'password' => Hash::make('JostynPerez123'),
            'nit' => '123456789',
            'nit2' => '987654321',
            'telefono' => '1234567890',
            'direccion' => 'Calle Falsa 123',
            'fk_id_rol' => 1,
        ]);
        Usuario::create([
            'usuario' => 'Alexander Francisco Cutzal Aju',
            'password' => Hash::make('40946558'),
            'nit' => '85395102',
            'telefono' => '40946558',
            'direccion' => 'segunda Av. 1-70 Zona 4, Santa Apolonia, Chimaltenango',
            'fk_id_rol' => 1,
        ]);
        Usuario::create([
            'usuario' => 'CONSEJO EDUCATIVO DE LA ESCUELA OFICIAL RURAL MIXTA JORNADA MATUTINA CASERIO SALAMIT ALDEA PATZAJ',
            'password' => Hash::make('escuela123'),
            'nit' => '80255868',
            'direccion' => 'Caserio Salamit Aldea Patzaj, Santa Apolonia, Chimaltenango',
            'fk_id_rol' => 2,
        ]);
         Usuario::create([
            'usuario' => 'CONSEJO EDUCATIVO DE LA ESCUELA OFICIAL RURAL MIXTA',
            'password' => Hash::make('escuela123'),
            'nit' => '71968024',
            'direccion' => 'Aldea Chuaparal 2, Santa Apolonia, Chimaltenango',
            'fk_id_rol' => 2,
        ]);
         Usuario::create([
            'usuario' => 'CONSEJO EDUCATIVO DE LA ESCUELA OFICIAL RURAL MIXTA',
            'password' => Hash::make('escuela123'),
            'nit' => '75978563',
            'direccion' => 'Aldea Panatzan, Santa Apolonia, Chimaltenango',
            'fk_id_rol' => 2,
        ]);
        Usuario::create([
            'usuario' => 'Consejo Educativo de la Escuela Oficial Rural Mixta Aldea Xecohil',
            'password' => Hash::make('escuela123'),
            'nit' => '83452737',
            'direccion' => 'Aldea Xecohil, Santa Apolonia, Chimaltenango',
            'fk_id_rol' => 2,
        ]);
         Usuario::create([
            'usuario' => 'CONSEJO EDUCATIVO DE LA "ESCUELA OFICIAL RURAL MIXTA ALDEA CHUAPARRAL"',
            'password' => Hash::make('escuela123'),
            'nit' => '71985891',
            'direccion' => 'Aldea Chuaparal I, Santa Apolonia Chimaltenango',
            'fk_id_rol' => 2,
        ]);
        Usuario::create([
            'usuario' => 'CONSEJO EDUCATIVO DE LA "ESCUELA OFICIAL RURAL"',
            'password' => Hash::make('escuela123'),
            'nit' => '72075546',
            'direccion' => 'Aldea Xesajcap sector No. 2, Santa Apolonia, Chimaltenango',
            'fk_id_rol' => 2,
        ]);
         Usuario::create([
            'usuario' => 'CONSEJO EDUCATIVO DE ESCUELA OFICIAL RURAL MIXTA CASERÍO XESAJBIN',
            'password' => Hash::make('escuela123'),
            'nit' => '90900138',
            'direccion' => 'Caserío Xesajbin Aldea Xecohil, Santa Apolonia, Chimaltenango',
            'fk_id_rol' => 2,
        ]);
        Usuario::create([
            'usuario' => 'Consejo Educativo de la Escuela Oficial Rural Mixta ',
            'password' => Hash::make('escuela123'),
            'nit' => '78078601',
            'direccion' => 'Aldea Xepanil, Santa Apolonia, Chimaltenango ',
            'fk_id_rol' => 2,
        ]);
          Usuario::create([
            'usuario' => '"CONSEJO EDUCATIVO DE LA ESCUELA OFICIAL RURAL MIXTA CASERÍO COJULYÁ"',
            'password' => Hash::make('escuela123'),
            'nit' => '87414805',
            'direccion' => 'Caserío Cojulyá, Aldea chuaparal I Santa Apolonia Chimaltenango',
            'fk_id_rol' => 2,
        ]);
        Usuario::create([
            'usuario' => '"CONSEJO EDUCATIVO DE LA ESCUELA OFICIAL RURAL MIXTA CASERÍO LA VEGA"',
            'password' => Hash::make('escuela123'),
            'nit' => '83359311',
            'direccion' => 'Caserío la Vega, Aldea Chiquex, Santa Apolonia, Chimaltenango.',
            'fk_id_rol' => 2,
        ]);
        Usuario::create([
            'usuario' => 'Consejo Educativo de la Escuela Oficial de Párvulos Anexa a EOUM "Mario Méndez Montenegro"',
            'password' => Hash::make('escuela123'),
            'nit' => '71987231',
            'nit2' => '71972617',
            'direccion' => '2da Avenida 4-26 Zona 4 del Municipio de Santa Apolonia , Departamento de Chimaltenango',
            'fk_id_rol' => 2,
        ]);
        Usuario::create([
            'usuario' => 'CONSEJO EDUCATIVO DE LA ESCUELA OFICIAL RURAL MIXTA',
            'password' => Hash::make('escuela123'),
            'nit' => '76525376',
            'direccion' => 'Aldea Chiquex, Santa Apolonia, Chimaltenango.',
            'fk_id_rol' => 2,
        ]);


    }
}
