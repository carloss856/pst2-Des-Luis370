<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventario', function (Blueprint $table) {
            $table->unsignedBigInteger('id_repuesto');
            $table->integer('cantidad_disponible')->default(0);
            $table->integer('nivel_critico')->default(0);
            $table->timestamp('ultima_actualizacion')->useCurrent();
            $table->primary('id_repuesto');
            $table->foreign('id_repuesto')->references('id_repuesto')->on('repuestos')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventario');
    }
};
