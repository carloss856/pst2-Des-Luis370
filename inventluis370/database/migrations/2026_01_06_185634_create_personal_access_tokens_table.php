<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // El proyecto usa MongoDB y ya tiene una migración Mongo para `personal_access_tokens`
        // (ver 2025_06_11_000418_create_personal_access_tokens_table.php).
        // Esta migración (SQL) se deja como noop para evitar fallos al migrar con DB_CONNECTION=mongodb.
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // noop
    }
};
