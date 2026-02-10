<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::connection('mongodb')->create('rma', function ($collection) {
            $collection->unique('rma');
            $collection->unique('id_persona');
        });
    }
    public function down(): void
    {
        Schema::connection('mongodb')->drop('rma');
    }
};