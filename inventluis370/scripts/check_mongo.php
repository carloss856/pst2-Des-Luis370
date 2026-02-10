<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    /** @var \Illuminate\Database\Connection $conn */
    $conn = app('db')->connection('mongodb');
    echo "conn_class=" . get_class($conn) . "\n";
    $hasCollection = method_exists($conn, 'collection');
    echo "hasCollectionMethod=" . ($hasCollection ? 'yes' : 'no') . "\n";

    if ($hasCollection) {
        $count = $conn->collection('usuario')->count();
        echo "usuario_count=" . $count . "\n";
    }

    // Try via query builder 'table' alias
    try {
        $count2 = $conn->table('usuario')->count();
        echo "usuario_count_table=" . $count2 . "\n";
    } catch (Throwable $e) {
        echo "usuario_count_table_error=" . $e->getMessage() . "\n";
    }

    // Try via Eloquent model
    try {
        $count3 = \App\Models\Usuario::count();
        echo "usuario_count_model=" . $count3 . "\n";
    } catch (Throwable $e) {
        echo "usuario_count_model_error=" . $e->getMessage() . "\n";
    }

    if (method_exists($conn, 'getMongoClient')) {
        $client = $conn->getMongoClient();
        echo "client_ok=yes\n";
    } else {
        echo "client_ok=no\n";
    }

    echo "done\n";
    exit(0);
} catch (Throwable $e) {
    fwrite(STDERR, "error=" . $e->getMessage() . "\n");
    exit(1);
}
