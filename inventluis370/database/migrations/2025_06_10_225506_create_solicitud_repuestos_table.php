<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('mongodb')->create('solicitud_repuestos', function ($collection) {
            $collection->index('id_solicitud');
            $collection->index('id_repuesto');
            $collection->index('id_servicio');
            $collection->index('id_usuario');
            $collection->index('estado_solicitud');
        });
    }

    public function down(): void
    {
        Schema::connection('mongodb')->drop('solicitud_repuestos');
    }
};
