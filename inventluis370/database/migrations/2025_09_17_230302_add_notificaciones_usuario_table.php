<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // MongoDB es schemaless: no se agregan columnas.
        // Los campos se incorporan cuando se escriben documentos desde la app.
    }

    public function down(): void
    {
        // noop
    }
};
