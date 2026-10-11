#!/bin/bash
# filepath: e:\Proyecto_PG\start.sh

# Esperar a que la base de datos esté lista
until php -r "new PDO('pgsql:host=' . getenv('DB_HOST') . ';dbname=' . getenv('DB_DATABASE'), getenv('DB_USERNAME'), getenv('DB_PASSWORD'));" 2>/dev/null; do
    echo "⏳ Esperando a que la DB esté lista..."
    sleep 3
done

echo "✅ Base de datos conectada"

# Generar APP_KEY si no existe
if [ -z "$APP_KEY" ]; then
    echo "🔑 Generando APP_KEY..."
    php artisan key:generate --force
fi

# Ejecutar migraciones
echo "🚀 Ejecutando migraciones..."
php artisan migrate --force

# Ejecutar seeders
echo "🌱 Ejecutando seeders..."
php artisan db:seed --force

# Configurar caches para producción
echo "⚡ Configurando caches..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Crear enlace simbólico para storage
echo "🔗 Creando enlace de storage..."
php artisan storage:link

echo "🎉 Aplicación lista para usar"

# Iniciar servidor Laravel
php artisan serve --host=0.0.0.0 --port=8000