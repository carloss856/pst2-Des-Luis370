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
            $collection->unique('email');
            $collection->index('name');
            $collection->index('created_at');
        });

        Schema::connection('mongodb')->create('password_reset_tokens', function ($collection) {
            $collection->unique('email');
            $collection->index('created_at');
        });

        Schema::connection('mongodb')->create('sessions', function ($collection) {
            $collection->unique('id');
            $collection->index('user_id');
            $collection->index('last_activity');
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
