<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Laravel\Sanctum\Sanctum;
use App\Models\PersonalAccessToken;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Usar el modelo de tokens en MongoDB para Sanctum
        Sanctum::usePersonalAccessTokenModel(PersonalAccessToken::class);

        // Auto-migración y siembra automática para hosting compartido (protegido con caché)
        if (config('app.auto_migrate', false)) {
            \Illuminate\Support\Facades\Cache::rememberForever('db_migrated', function () {
                try {
                    \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
                    // Siembra la base de datos si no hay ningún usuario registrado
                    if (\App\Models\Usuario::count() === 0) {
                        \Illuminate\Support\Facades\Artisan::call('db:seed', ['--force' => true]);
                    }
                    return true;
                } catch (\Throwable $e) {
                    \Log::error('Auto-migration/seeding failed: ' . $e->getMessage());
                    return false; // Reintentar en la próxima solicitud si falló
                }
            });
        }
    }
}
