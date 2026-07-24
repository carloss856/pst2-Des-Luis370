<?php
/**
 * Script de diagnóstico de base de datos para Laravel + MongoDB.
 * Eliminar este archivo después de realizar la verificación por motivos de seguridad.
 */

require __DIR__ . '/../../inventluis370/vendor/autoload.php';
$app = require __DIR__ . '/../../inventluis370/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

header('Content-Type: text/html; charset=utf-8');

echo "<h2>Diagnóstico de Conexión - Inventario Luis370</h2>";

try {
    // Verificar que la clase DB existe
    if (!class_exists('Illuminate\Support\Facades\DB')) {
        throw new Exception("Laravel no se inicializó correctamente.");
    }

    $connection = \Illuminate\Support\Facades\DB::connection('mongodb');
    $dbName = config('database.connections.mongodb.database');
    $dsnConfigured = config('database.connections.mongodb.dsn') ? 'Sí (DSN Atlas)' : 'No (Local/Host)';

    echo "<p><strong>Configuración detectada:</strong></p>";
    echo "<ul>";
    echo "<li>Usa DSN de Atlas: <code>" . htmlspecialchars($dsnConfigured) . "</code></li>";
    echo "<li>Nombre de la Base de Datos: <code>" . htmlspecialchars($dbName) . "</code></li>";
    echo "</ul>";

    echo "<p>Intentando conectar a MongoDB...</p>";
    
    // Obtener la instancia nativa del cliente de Mongo para listar colecciones
    $mongoDbInstance = $connection->getMongoDB();
    $collections = $mongoDbInstance->listCollections();

    echo "<p style='color: green; font-weight: bold;'>¡CONEXIÓN EXITOSA A MONGO ATLAS!</p>";
    echo "<p>Colecciones encontradas en <strong>" . htmlspecialchars($dbName) . "</strong>:</p>";
    echo "<ul>";
    
    $count = 0;
    foreach ($collections as $col) {
        echo "<li>Colección: <code>" . htmlspecialchars($col->getName()) . "</code></li>";
        $count++;
    }
    
    if ($count === 0) {
        echo "<li><em>No se encontraron colecciones creadas. (La base de datos está vacía).</em></li>";
    }
    echo "</ul>";

} catch (\Throwable $e) {
    echo "<p style='color: red; font-weight: bold;'>ERROR DE CONEXIÓN:</p>";
    echo "<pre style='background: #f8f8f8; padding: 15px; border: 1px solid #ccc; overflow-x: auto;'>" . htmlspecialchars($e->getMessage()) . "</pre>";
    echo "<p><strong>Sugerencias:</strong> Comprueba que la dirección IP de tu servidor de hosting esté autorizada (Whitelist) en la consola de MongoDB Atlas (Network Access).</p>";
}
