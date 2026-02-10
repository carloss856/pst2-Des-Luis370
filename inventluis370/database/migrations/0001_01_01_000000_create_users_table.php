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
        Schema::connection('mongodb')->create('users', function ($collection) {
            $collection->index(['email' => 1], ['unique' => true]);
            $collection->index(['name' => 1]);
            $collection->index(['created_at' => 1]);
        });

        Schema::connection('mongodb')->create('password_reset_tokens', function ($collection) {
            $collection->index(['email' => 1], ['unique' => true]);
            $collection->index(['created_at' => 1]);
        });

        Schema::connection('mongodb')->create('sessions', function ($collection) {
            $collection->index(['id' => 1], ['unique' => true]);
            $collection->index(['user_id' => 1]);
            $collection->index(['last_activity' => 1]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('mongodb')->drop('users');
        Schema::connection('mongodb')->drop('password_reset_tokens');
        Schema::connection('mongodb')->drop('sessions');
    }
};
