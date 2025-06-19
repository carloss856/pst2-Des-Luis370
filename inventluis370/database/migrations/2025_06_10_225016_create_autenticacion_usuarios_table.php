<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('autenticacion_usuarios', function (Blueprint $table) {
            $table->id('id_usuario');
            $table->string('codigo_usuario', 50)->unique();
            $table->string('email', 100)->unique();
            $table->string('contrasena', 255);
            $table->timestamp('fecha_creacion')->useCurrent();
            $table->integer('intentos_fallidos')->default(0);
            $table->enum('estado', ['Activo', 'Bloqueado'])->nullable();
            $table->string('token_recuperacion', 255)->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('autenticacion_usuarios');
    }
};
