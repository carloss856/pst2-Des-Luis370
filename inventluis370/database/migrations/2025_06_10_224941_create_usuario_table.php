<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('usuario', function (Blueprint $table) {
            $table->id('id_persona');
            $table->string('nombre', 100);
            $table->string('email', 100)->unique();
            $table->string('telefono', 15)->nullable();
            $table->enum('tipo', ['Administrador', 'Técnico', 'Gerente', 'Cliente', 'Empresa']);
            $table->string('contrasena', 255)->nullable();
            $table->unsignedBigInteger('id_empresa')->nullable();
            $table->boolean('validado_por_gerente')->default(false);
            $table->foreign('id_empresa')->references('id_empresa')->on('empresas')->onDelete('set null');
        });

        // Crear usuario administrador inicial
        DB::table('usuario')->insert([
            'nombre' => 'Administrador',
            'email' => 'administrador@correo.com',
            'telefono' => null,
            'tipo' => 'Administrador',
            'contrasena' => Hash::make('administrador'),
            'id_empresa' => null,
            'validado_por_gerente' => true,
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('usuario');
    }
};
