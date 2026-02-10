<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('mongodb')->create('propiedad_equipos', function ($collection) {
            $collection->index('id_propiedad');
            $collection->index('id_equipo');
            $collection->index('id_persona');
        });
    }

    public function down(): void
    {
        Schema::connection('mongodb')->drop('propiedad_equipos');
    }
};
