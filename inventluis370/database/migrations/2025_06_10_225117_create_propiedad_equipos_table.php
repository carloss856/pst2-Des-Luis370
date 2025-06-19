<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('propiedad_equipos', function (Blueprint $table) {
            $table->id('id_propiedad');
            $table->unsignedBigInteger('id_equipo');
            $table->unsignedBigInteger('id_persona');
            $table->foreign('id_equipo')->references('id_equipo')->on('equipos')->onDelete('cascade');
            $table->foreign('id_persona')->references('id_persona')->on('usuario')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('propiedad_equipos');
    }
};
