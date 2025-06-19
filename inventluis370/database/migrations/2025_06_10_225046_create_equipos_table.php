<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('equipos', function (Blueprint $table) {
            $table->id('id_equipo');
            $table->string('tipo_equipo', 50);
            $table->string('marca', 50)->nullable();
            $table->string('modelo', 50)->nullable();
            $table->unsignedBigInteger('id_persona')->nullable();
            $table->foreign('id_persona')->references('id_persona')->on('usuario')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('equipos');
    }
};
