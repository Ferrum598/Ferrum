# Imagen base con PHP y Composer
FROM php:8.2-fpm

# Instalar dependencias necesarias
RUN apt-get update && apt-get install -y \
    git curl libpq-dev unzip zip \
    && docker-php-ext-install pdo pdo_pgsql

# Instalar Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Instalar Node.js (para compilar React/TypeScript)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Configurar directorio de trabajo
WORKDIR /var/www/html

# Copiar archivos del proyecto
COPY . .

# Instalar dependencias PHP
RUN composer install --optimize-autoloader --no-dev

# Instalar dependencias Node y compilar React/TypeScript
RUN npm install && npm run build

# Configurar permisos
RUN chmod -R 775 storage bootstrap/cache

# Copiar script de inicio y darle permisos
COPY start.sh .
RUN chmod +x start.sh

# Exponer puerto
EXPOSE 8000

# Comando para arrancar Laravel
CMD ["./start.sh"]