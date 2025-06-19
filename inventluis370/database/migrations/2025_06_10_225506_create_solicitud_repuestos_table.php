<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('solicitud_repuestos', function (Blueprint $table) {
            $table->id('id_solicitud');
            $table->unsignedBigInteger('id_repuesto');
            $table->unsignedBigInteger('id_servicio');
            $table->integer('cantidad_solicitada')->default(0);
            $table->unsignedBigInteger('id_usuario');
            $table->timestamp('fecha_solicitud')->useCurrent();
            $table->enum('estado_solicitud', ['Pendiente', 'Aprobada', 'Rechazada']);
            $table->text('comentarios')->nullable();

            $table->foreign('id_repuesto')->references('id_repuesto')->on('repuestos')->onDelete('cascade');
            $table->foreign('id_servicio')->references('id_servicio')->on('servicios')->onDelete('cascade');
            $table->foreign('id_usuario')->references('id_persona')->on('usuario')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('solicitud_repuestos');
    }
};
