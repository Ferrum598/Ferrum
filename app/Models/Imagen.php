<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Imagen extends Model
{
    protected $table = 'imagenes';

    protected $primaryKey = 'id_imagen';

    public $timestamps = true;

    protected $fillable = [
        'imagen'
    ];

    public function usuarios()
    {
        return $this->belongsTo(Usuario::class, 'fk_id_imagen', 'id_imagen');
    }
}
