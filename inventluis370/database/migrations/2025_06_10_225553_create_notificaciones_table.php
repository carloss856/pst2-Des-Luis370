<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('mongodb')->create('notificaciones', function ($collection) {
            $collection->index('id_notificacion');
            $collection->index('id_servicio');
            $collection->index('email_destinatario');
            $collection->index('estado_envio');
        });
    }

    public function down(): void
    {
        Schema::connection('mongodb')->drop('notificaciones');
    }
};
