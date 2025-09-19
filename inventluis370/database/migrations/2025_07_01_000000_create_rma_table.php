<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('rma', function (Blueprint $table) {
            $table->string('rma', 20)->primary();
            $table->unsignedBigInteger('id_persona')->unique();
            $table->timestamp('fecha_creacion')->useCurrent();
            $table->foreign('id_persona')->references('id_persona')->on('usuario')->onDelete('cascade');
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('rmas');
    }
};