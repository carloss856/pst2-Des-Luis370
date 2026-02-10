<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('mongodb')->create('autenticacion_usuarios', function ($collection) {
            $collection->index('id_usuario');
            $collection->unique('codigo_usuario');
            $collection->unique('email');
        });
    }

    public function down(): void
    {
        Schema::connection('mongodb')->drop('autenticacion_usuarios');
    }
};
