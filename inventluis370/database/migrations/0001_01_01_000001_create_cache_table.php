<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::connection('mongodb')->create('cache', function ($collection) {
            $collection->index(['key' => 1], ['unique' => true]);
            $collection->index(['expiration' => 1]);
        });

        Schema::connection('mongodb')->create('cache_locks', function ($collection) {
            $collection->index(['key' => 1], ['unique' => true]);
            $collection->index(['expiration' => 1]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('mongodb')->drop('cache');
        Schema::connection('mongodb')->drop('cache_locks');
    }
};
