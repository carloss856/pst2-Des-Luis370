<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Support\Role;
use App\Support\PermissionsStore;

class RolePermission
{
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $route = $request->route();
        $routeName = $route?->getName();
        $rbac = PermissionsStore::rbacForUser($user);

        // Rutas sin nombre: permitir (logout, token/extend, me, etc.)
        if (empty($routeName)) {
            return $next($request);
        }

        // Anti-lockout UI: el front depende de /rbac para decidir qué mostrar.
        // Si un override omitió rbac.me, no debe romper la navegación.
        if ($routeName === 'rbac.me') {
            return $next($request);
        }

        // Anti-lockout: el módulo de permisos debe ser accesible siempre para Admin/Gerente
        if (str_starts_with($routeName, 'permissions.')) {
            $role = Role::normalize(($user->tipo ?? null) ?: ($user->rol ?? null));
            if (in_array($role, ['Administrador', 'Gerente'], true)) {
                return $next($request);
            }
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Rutas personalizadas
        if (isset($rbac['routes']) && is_array($rbac['routes']) && in_array($routeName, $rbac['routes'], true)) {
            return $next($request);
        }

        // Rutas apiResource (nombre: modulo.accion)
        if (str_contains($routeName, '.')) {
            [$module, $action] = explode('.', $routeName, 2);
            $modules = (array) ($rbac['modules'] ?? []);
            if (isset($modules[$module]) && is_array($modules[$module])) {
                if (in_array($action, $modules[$module], true)) {
                    return $next($request);
                }
                return response()->json(['message' => 'Forbidden', 'detail' => [
                    'role' => $rbac['role'] ?? null,
                    'module' => $module,
                    'action' => $action,
                    'type' => 'resource-action-denied'
                ]], 403);
            }
        }

        // Ruta con nombre no mapeada: denegar (obliga a declarar permisos)
        return response()->json(['message' => 'Forbidden', 'detail' => [
            'route' => $routeName,
            'type' => 'route-not-mapped'
        ]], 403);
    }

    // Normalización centralizada en App\Support\Role
}
