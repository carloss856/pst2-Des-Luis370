<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // MongoDB: agregar índice sobre el campo y establecer valor por defecto en documentos existentes
        Schema::connection('mongodb')->table('repuestos', function ($collection) {
            $collection->index('nivel_critico');
        });

        // Establecer nivel_critico=0 en todos los documentos actuales
        DB::connection('mongodb')->table('repuestos')->update(['nivel_critico' => 0]);
    }

    public function down(): void
    {
        // Remover el campo en documentos existentes (unset)
        try {
            $conn = DB::connection('mongodb');
            $client = method_exists($conn, 'getMongoClient') ? $conn->getMongoClient() : null;
            if ($client) {
                $db = $client->selectDatabase(env('MONGO_DATABASE', 'luis370Db'));
                $db->selectCollection('repuestos')->updateMany([], ['$unset' => ['nivel_critico' => ""]]);
            } else {
                // Fallback: establecer null si no podemos usar updateMany
                $conn->table('repuestos')->update(['nivel_critico' => null]);
            }
        } catch (\Throwable $e) {
            // noop
        }
    }
};
