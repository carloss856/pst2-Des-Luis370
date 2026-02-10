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
        Schema::connection('mongodb')->create('jobs', function ($collection) {
            $collection->index(['queue' => 1]);
            $collection->index(['available_at' => 1]);
            $collection->index(['created_at' => 1]);
        });

        Schema::connection('mongodb')->create('job_batches', function ($collection) {
            $collection->index(['id' => 1], ['unique' => true]);
            $collection->index(['name' => 1]);
            $collection->index(['created_at' => 1]);
            $collection->index(['finished_at' => 1]);
        });

        Schema::connection('mongodb')->create('failed_jobs', function ($collection) {
            $collection->index(['uuid' => 1], ['unique' => true]);
            $collection->index(['failed_at' => 1]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('mongodb')->drop('jobs');
        Schema::connection('mongodb')->drop('job_batches');
        Schema::connection('mongodb')->drop('failed_jobs');
    }
};
