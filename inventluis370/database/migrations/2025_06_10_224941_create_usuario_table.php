<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('mongodb')->create('usuario', function ($collection) {
            $collection->index('id_persona');
            $collection->unique('email');
            $collection->index('id_empresa');
        });

        // Crear usuario administrador inicial
        DB::connection('mongodb')->table('usuario')->insert([
            'id_persona' => 'USR-ADMIN',
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
        Schema::connection('mongodb')->drop('usuario');
    }
};
