<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('mongodb')->create('inventario', function ($collection) {
            $collection->index('id_entrada');
            $collection->index('id_repuesto');
            $collection->index('fecha_entrada');
        });
    }

    public function down(): void
    {
        Schema::connection('mongodb')->drop('inventario');
    }
};
