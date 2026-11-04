<?php

namespace App\Casts;

use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;

// Cantidades que pueden ser fraccionadas (ej. 0.5 m³): devuelve entero cuando la cantidad es entera
class Cantidad implements CastsAttributes
{
    public static function normalizar(mixed $valor): int|float
    {
        $numero = round((float) $valor, 2);

        return floor($numero) == $numero ? (int) $numero : $numero;
    }

    public function get(Model $model, string $key, mixed $value, array $attributes): int|float|null
    {
        return $value === null ? null : self::normalizar($value);
    }

    public function set(Model $model, string $key, mixed $value, array $attributes): ?float
    {
        return $value === null ? null : round((float) $value, 2);
    }
}
