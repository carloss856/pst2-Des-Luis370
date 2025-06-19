<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('repuestos', function (Blueprint $table) {
            $table->id('id_repuesto');
            $table->string('nombre_repuesto', 100);
            $table->integer('cantidad_disponible')->default(0);
            $table->decimal('costo_unitario', 10, 2)->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('repuestos');
    }
};
