<?php
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $conn = DB::connection('mongodb');
    $db = $conn->getMongoDB();
    $collections = $db->listCollections();
    $exists = false;
    foreach ($collections as $col) {
        if ($col->getName() === 'usuarios') { $exists = true; break; }
    }
    if ($exists) {
        Schema::connection('mongodb')->drop('usuarios');
        echo json_encode(['dropped' => true, 'collection' => 'usuarios']) . PHP_EOL;
    } else {
        echo json_encode(['dropped' => false, 'collection' => 'usuarios', 'reason' => 'not found']) . PHP_EOL;
    }
} catch (Throwable $e) {
    echo json_encode(['error' => $e->getMessage()]) . PHP_EOL;
    exit(1);
}
