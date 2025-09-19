<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('autenticacion_usuarios', function (Blueprint $table) {
            if (!Schema::hasColumn('autenticacion_usuarios','token_recuperacion')) {
                $table->string('token_recuperacion',255)->nullable();
            }
            $table->timestamp('token_recuperacion_expires_at')->nullable();
        });
    }
    public function down(): void {
        Schema::table('autenticacion_usuarios', function (Blueprint $table) {
            $table->dropColumn(['token_recuperacion_expires_at']);
        });
    }
};
