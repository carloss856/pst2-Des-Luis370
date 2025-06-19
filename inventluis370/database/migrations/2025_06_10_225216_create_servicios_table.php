<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('servicios', function (Blueprint $table) {
            $table->id('id_servicio');
            $table->unsignedBigInteger('id_equipo');
            $table->string('codigo_rma', 20)->unique();
            $table->date('fecha_ingreso');
            $table->text('problema_reportado');
            $table->enum('estado', ['Pendiente', 'En proceso', 'Finalizado']);
            $table->decimal('costo_estimado', 10, 2)->nullable();
            $table->decimal('costo_real', 10, 2)->nullable();
            $table->boolean('validado_por_gerente')->default(false);
            $table->foreign('id_equipo')->references('id_equipo')->on('equipos')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('servicios');
    }
};
