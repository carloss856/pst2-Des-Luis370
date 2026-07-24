# Backend Laravel + MongoDB (jenssegers/mongodb) para Render (plan free)
FROM php:8.3-cli

# Dependencias del sistema + extensión MongoDB de PHP
RUN apt-get update && apt-get install -y \
    git unzip libzip-dev libssl-dev \
 && docker-php-ext-install zip \
 && pecl install mongodb \
 && docker-php-ext-enable mongodb \
 && rm -rf /var/lib/apt/lists/*

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY . .

# Instalar dependencias de producción
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Permisos de storage/cache
RUN chmod -R 775 storage bootstrap/cache

# Render inyecta $PORT
EXPOSE 8000
CMD php artisan serve --host 0.0.0.0 --port ${PORT:-8000}
