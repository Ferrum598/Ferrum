<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ImagenProducto extends Model
{
    protected $table = 'imagen_producto';
    protected $primaryKey = 'id_imagen_producto';

    protected $fillable = ['nombre_imagen', 'imagen'];

    public function productos()
    {
        return $this->hasMany(Producto::class, 'fk_imagen_producto', 'id_imagen_producto');
    }

    // La imagen se guarda como texto base64 en la columna binaria; devuelve un data URI listo para <img>
    public function dataUri(): string
    {
        $raw = $this->imagen;
        if (is_resource($raw)) {
            $raw = stream_get_contents($raw);
        }
        if (!$raw) {
            return '/assets/productos/no-hay-imagen.jpg';
        }
        return 'data:image/jpeg;base64,' . $raw;
    }

    // Guarda el archivo subido en el formato usado por la aplicación (base64)
    public static function desdeArchivo(\Illuminate\Http\UploadedFile $archivo): self
    {
        return self::create([
            'nombre_imagen' => $archivo->getClientOriginalName(),
            'imagen' => base64_encode(file_get_contents($archivo->getRealPath())),
        ]);
    }
}
