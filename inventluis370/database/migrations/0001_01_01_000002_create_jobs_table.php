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
            $collection->index('queue');
            $collection->index('available_at');
            $collection->index('created_at');
        });

        Schema::connection('mongodb')->create('job_batches', function ($collection) {
            $collection->unique('id');
            $collection->index('name');
            $collection->index('created_at');
            $collection->index('finished_at');
        });

        Schema::connection('mongodb')->create('failed_jobs', function ($collection) {
            $collection->unique('uuid');
            $collection->index('failed_at');
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
