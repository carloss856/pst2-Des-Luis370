<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Token;
use App\Models\Usuario;
use Symfony\Component\HttpFoundation\Response;

class TokenAuth
{
    public function handle(Request $request, Closure $next)
    {
        $authHeader = $request->header('Authorization');
        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $plain = substr($authHeader, 7);

        $token = Token::where('token', hash('sha256', $plain))->first();
        if (!$token) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        if ($token->expires_at && now()->greaterThan($token->expires_at)) {
            return response()->json(['message' => 'Token expired'], 401);
        }

        $user = Usuario::where('id_persona', $token->tokenable_id)->first();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Actualiza último uso (opcional) y pasa el usuario autenticado
        $token->last_used_at = now();
        $token->save();

        Auth::setUser($user);
        $response = $next($request);
        // Expone la expiración para que el cliente pueda avisar 1 min antes
        if ($token->expires_at && $response instanceof Response) {
            $response->headers->set('X-Token-Expires-At', $token->expires_at->toIso8601String());
        }
        return $response;
    }
}
