<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;

class Authenticate extends Middleware
{
    protected function redirectTo($request): ?string
    {
        // Si la request NO espera JSON → devolvemos 401 en lugar de redirigir
        if (! $request->expectsJson()) {
            abort(response()->json(['message' => 'Unauthorized'], 401));
        }
        return null;
    }
}
