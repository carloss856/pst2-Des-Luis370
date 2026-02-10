<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('mongodb')->create('repuestos', function ($collection) {
            $collection->index('id_repuesto');
            $collection->index('nombre_repuesto');
        });
    }

    public function down(): void
    {
        Schema::connection('mongodb')->drop('repuestos');
    }
};
