<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\Producto;
use App\Models\ImagenProducto;

Route::get('/producto/barcode/{codigo}', function ($codigo) {

    $producto = Producto::where('codigo_barra', $codigo)->first();

    if (!$producto) {
        return response()->json(['found' => false], 404);
    }

    $imagen = ImagenProducto::find($producto->fk_id_imagen);

    $imagenBase64 = null;

    if ($imagen && $imagen->imagen_producto) {
        $raw = $imagen->imagen_producto;

        // Si viene como stream
        if (is_resource($raw)) {
            $raw = stream_get_contents($raw);
        }

        // PostgreSQL bytea en formato hexadecimal
        if (is_string($raw) && str_starts_with($raw, '\\x')) {
            $raw = hex2bin(substr($raw, 2));
        }

        if ($raw) {
            $imagenBase64 = 'data:image/jpeg;base64,' . base64_encode($raw);
        }
    }

    return response()->json([
        'found' => true,
        'producto' => $producto->toArray(),
        'imagen' => $imagenBase64
    ]);
});
