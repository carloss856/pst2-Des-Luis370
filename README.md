# Inventario Luis370

Sistema de gestión de inventario, repuestos, servicios y notificaciones.

Este proyecto está dividido en dos partes:
- Backend: Laravel (carpeta `inventluis370`)
- Frontend: React + Vite (carpeta `inventluis370front`)

# Requisitos

- PHP >= 8.1
- Composer
- Node.js >= 16.x y npm >= 8.x
- PostgreSQL
- Git

# Clonación del repositorio

git clone https://github.com/carloss856/inventluis370.git
cd inventluis370

# Instalación y configuración del backend (Laravel)

1. Entra a la carpeta del backend:
   cd inventluis370

2. Instala las dependencias de PHP:
   composer install

3. Copia el archivo de entorno y configura tus variables:
   cp .env.example .env

4. Edita el archivo `.env` y configura la conexión a tu base de datos PostgreSQL:

   DB_CONNECTION=pgsql
   DB_HOST=127.0.0.1DB_PORT=5432
   DB_DATABASE=nombre_de_tu_base
   DB_USERNAM=tu_usuario
   DB_PASSWORD=tu_contraseña

5. Genera la clave de la aplicación:
   php artisan key:generate

6. Ejecuta las migraciones y seeders:
   php artisan migrate --seed

7. Inicia el servidor de desarrollo:
   php artisan serve

El backend estará disponible en http://localhost:8000 por defecto. Este no sera visible desde la web.

# Instalación y configuración del frontend (React + Vite)

1. Entra a la carpeta del frontend:
   cd ../inventluis370front

2. Instala las dependencias de Node.js:
   npm install

3. Ya la ip de la api esta configurada, si necesitas cambiarla ingresa a "src/services/api" y alli puedes cambiar la configuracion de la conexion hacia el backend

4. Inicia el servidor de desarrollo:
   npm run dev

El frontend estará disponible en la URL, normalmente https://localhost:5173
