<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('usuario', function (Blueprint $table) {
            $table->boolean('recibir_notificaciones')->default(true);
            $table->json('tipos_notificacion')->nullable(); // Ejemplo: ["servicios","repuestos","reportes"]
        });
    }

    public function down(): void
    {
        Schema::table('usuario', function (Blueprint $table) {
            $table->dropColumn(['recibir_notificaciones', 'tipos_notificacion']);
        });
    }
};
