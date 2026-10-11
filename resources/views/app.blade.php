<!DOCTYPE html>
<html lang="es" translate="no">
    <head>
        <link rel="icon" href="{{ asset('assets/icon/Icono_Ferrum.png') }}" type="image/png">
        <meta name="google" content="notranslate">
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
