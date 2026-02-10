<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Si existe una tabla SQL llamada 'usuarios', se elimina.
        // No afecta Mongo; es seguro en conexiones SQL (mysql/pgsql/sqlite).
        if (Schema::hasTable('usuarios')) {
            Schema::drop('usuarios');
        }
    }

    public function down(): void
    {
        // No recreamos la tabla 'usuarios' ya que no debe existir.
    }
};
