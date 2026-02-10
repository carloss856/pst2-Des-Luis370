<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('mongodb')->create('garantias', function ($collection) {
            $collection->index('id_garantia');
            $collection->index('id_servicio');
            $collection->index('validado_por_gerente');
        });
    }

    public function down(): void
    {
        Schema::connection('mongodb')->drop('garantias');
    }
};
