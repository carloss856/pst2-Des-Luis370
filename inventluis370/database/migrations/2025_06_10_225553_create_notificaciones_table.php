<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notificaciones', function (Blueprint $table) {
            $table->id('id_notificacion');
            $table->unsignedBigInteger('id_servicio');
            $table->string('email_destinatario', 100);
            $table->string('asunto', 150);
            $table->text('mensaje');
            $table->timestamp('fecha_envio')->useCurrent();
            $table->enum('estado_envio', ['Enviado', 'Pendiente', 'Fallido']);
            $table->foreign('id_servicio')->references('id_servicio')->on('servicios')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notificaciones');
    }
};
