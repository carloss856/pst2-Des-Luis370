<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('mongodb')->create('empresas', function ($collection) {
            $collection->index('id_empresa');
            $collection->index('nombre_empresa');
            $collection->unique('email');
        });
    }

    public function down(): void
    {
        Schema::connection('mongodb')->drop('empresas');
    }
};
