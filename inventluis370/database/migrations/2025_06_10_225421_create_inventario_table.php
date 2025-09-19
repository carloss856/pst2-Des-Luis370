<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventario', function (Blueprint $table) {
            $table->bigIncrements('id_entrada');
            $table->unsignedBigInteger('id_repuesto');
            $table->integer('cantidad_entrada')->default(0);
            $table->timestamp('fecha_entrada')->useCurrent();
            $table->primary('id_entrada');
            $table->foreign('id_repuesto')->references('id_repuesto')->on('repuestos')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventario');
    }
};
