<?php

return [
    'route' => [
        // Otros middlewares de ruta...
        'acceso.pagina' => \App\Http\Middleware\AccesoPagina::class,
        'validar.rol' => \App\Http\Middleware\ValidarRol::class,
        // Puedes agregar más middlewares aquí
    ],
    // Otros grupos de middlewares si es necesario...
];
