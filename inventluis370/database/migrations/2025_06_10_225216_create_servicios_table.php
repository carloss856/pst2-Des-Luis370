<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('mongodb')->create('servicios', function ($collection) {
            $collection->index('id_servicio');
            $collection->unique('codigo_rma');
            $collection->index('id_equipo');
            $collection->index('estado');
        });
    }

    public function down(): void
    {
        Schema::connection('mongodb')->drop('servicios');
    }
};
