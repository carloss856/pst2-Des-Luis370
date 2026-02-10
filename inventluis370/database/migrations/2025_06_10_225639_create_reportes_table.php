<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('mongodb')->create('reportes', function ($collection) {
            $collection->index('id_reporte');
            $collection->index('tipo_reporte');
            $collection->index('id_usuario');
        });
    }

    public function down(): void
    {
        Schema::connection('mongodb')->drop('reportes');
    }
};
