<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('mongodb')->table('usuario', function ($collection) {
            // Eliminar índice previo no único si existe y crear índice único en id_persona
            try { $collection->dropIndex('id_persona_1'); } catch (\Throwable $e) { /* ignorar si no existe */ }
            $collection->unique('id_persona');
        });
    }

    public function down(): void
    {
        Schema::connection('mongodb')->table('usuario', function ($collection) {
            // No hay soporte directo para dropIndex por nombre aquí; opcionalmente dejarlo
        });
    }
};
