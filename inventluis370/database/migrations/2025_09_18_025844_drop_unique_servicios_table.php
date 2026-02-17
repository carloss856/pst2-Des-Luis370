<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // MongoDB: eliminar el índice unique sobre codigo_rma si existe.
        Schema::connection('mongodb')->table('servicios', function ($collection) {
            try { $collection->dropIndex('codigo_rma_1'); } catch (\Throwable $e) { /* ignorar */ }
        });
    }

    public function down(): void
    {
        // MongoDB: re-crear el índice unique (best-effort).
        Schema::connection('mongodb')->table('servicios', function ($collection) {
            try { $collection->unique('codigo_rma'); } catch (\Throwable $e) { /* ignorar */ }
        });
    }
};
