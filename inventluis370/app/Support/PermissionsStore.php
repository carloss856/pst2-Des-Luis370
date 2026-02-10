<?php

namespace App\Support;

use App\Models\PermissionSetting;
use Illuminate\Support\Facades\Auth;

class PermissionsStore
{
    public const SCHEMA_VERSION = 1;
    private const GLOBAL_KEY = 'rbac';
    private const USER_KEY_PREFIX = 'rbac_user:';

    public static function schemaVersion(): int
    {
        return self::SCHEMA_VERSION;
    }

    public static function override(): ?array
    {
        $row = PermissionSetting::where('key', self::GLOBAL_KEY)->first();
        if (!$row) {
            return null;
        }
        return [
            'modules' => (array) ($row->modules ?? []),
            'routes' => (array) ($row->routes ?? []),
            'updated_at' => $row->updated_at ?? null,
            'updated_by' => $row->updated_by ?? null,
        ];
    }

    public static function userOverride(string $idPersona): ?array
    {
        $idPersona = trim((string) $idPersona);
        if ($idPersona === '') {
            return null;
        }

        $row = PermissionSetting::where('key', self::USER_KEY_PREFIX . $idPersona)->first();
        if (!$row) {
            return null;
        }

        return [
            'modules' => (array) ($row->modules ?? []),
            'routes' => array_values(array_unique((array) ($row->routes ?? []))),
            'updated_at' => $row->updated_at ?? null,
            'updated_by' => $row->updated_by ?? null,
        ];
    }

    public static function effective(): array
    {
        $base = (array) config('permissions');
        $ovr = self::override();
        if (!$ovr) {
            return $base;
        }

        // Reemplazo total (fuente de verdad pasa a ser BD cuando hay override).
        $effective = [
            'modules' => (array) ($ovr['modules'] ?? []),
            'routes' => (array) ($ovr['routes'] ?? []),
        ];

        // Anti-lockout mínimo (coherente con el middleware):
        // si el override omitió estas rutas, no debe romper la UI ni bloquear permisos.
        $rolesAll = ['Administrador','Técnico','Gerente','Cliente','Empresa'];
        $rolesAdminGerente = ['Administrador','Gerente'];

        $routes = (array) ($effective['routes'] ?? []);
        $routes['rbac.me'] = $rolesAll;
        $routes['permissions.index'] = $rolesAdminGerente;
        $routes['permissions.update'] = $rolesAdminGerente;
        $routes['permissions.reset'] = $rolesAdminGerente;
        $effective['routes'] = $routes;

        return $effective;
    }

    /**
     * RBAC efectivo para un usuario (lo que consume el Front):
     * - Base/override global por rol (matriz config/permissions.php o DB override).
     * - Opcional: override por usuario (lista directa de módulos/acciones y rutas).
     */
    public static function rbacForUser($user): array
    {
        $role = Role::normalize(($user->tipo ?? null) ?: ($user->rol ?? null));
        $effective = self::effective();

        $modules = [];
        foreach (($effective['modules'] ?? []) as $moduleKey => $roleMap) {
            $allowed = $role ? ($roleMap[$role] ?? []) : [];
            if (is_array($allowed)) {
                $modules[$moduleKey] = array_values(array_unique($allowed));
                sort($modules[$moduleKey]);
            }
        }

        $routes = [];
        foreach (($effective['routes'] ?? []) as $routeName => $allowedRoles) {
            if ($role && is_array($allowedRoles) && in_array($role, $allowedRoles, true)) {
                $routes[] = $routeName;
            }
        }

        // rbac.me debe existir siempre (UI anti-lockout)
        $routes[] = 'rbac.me';
        $routes = array_values(array_unique($routes));
        sort($routes);

        $rbac = [
            'role' => $role,
            'modules' => $modules,
            'routes' => $routes,
        ];

        $idPersona = $user->id_persona ?? null;
        if (!$idPersona) {
            return $rbac;
        }

        $uovr = self::userOverride((string) $idPersona);
        if (!$uovr) {
            return $rbac;
        }

        // Override por usuario (parche):
        // - Solo reemplaza módulos presentes en el override.
        // - Rutas: solo se reemplazan si override trae rutas no vacías.
        $ovrModules = (array) ($uovr['modules'] ?? []);
        if (!empty($ovrModules)) {
            foreach ($ovrModules as $moduleKey => $allowed) {
                $rbac['modules'][(string) $moduleKey] = array_values(array_unique((array) $allowed));
                sort($rbac['modules'][(string) $moduleKey]);
            }
        }

        $ovrRoutes = (array) ($uovr['routes'] ?? []);
        if (!empty($ovrRoutes)) {
            $rbac['routes'] = array_values(array_unique($ovrRoutes));
        }
        $rbac['routes'][] = 'rbac.me';
        $rbac['routes'] = array_values(array_unique($rbac['routes']));
        sort($rbac['routes']);

        return $rbac;
    }

    private static function normalizeActionsList($value): array
    {
        $arr = array_values(array_unique(array_filter((array) $value, fn ($v) => $v !== null && $v !== '')));
        sort($arr);
        return $arr;
    }

    public static function saveOverride(array $data): array
    {
        $rolesAll = ['Administrador','Técnico','Gerente','Cliente','Empresa'];
        $rolesAdminGerente = ['Administrador','Gerente'];

        $row = PermissionSetting::firstOrNew(['key' => self::GLOBAL_KEY]);
        $row->modules = (array) ($data['modules'] ?? []);

        // Override reemplaza por completo, pero forzamos rutas mínimas para evitar lockout.
        $routes = (array) ($data['routes'] ?? []);
        $routes['rbac.me'] = $rolesAll;
        $routes['permissions.index'] = $rolesAdminGerente;
        $routes['permissions.update'] = $rolesAdminGerente;
        $routes['permissions.reset'] = $rolesAdminGerente;
        $row->routes = $routes;
        $row->updated_at = now();
        $row->updated_by = Auth::user()?->id_persona ?? null;
        $row->save();

        return [
            'key' => $row->key,
            'updated_at' => $row->updated_at,
            'updated_by' => $row->updated_by,
        ];
    }

    public static function saveUserOverride(string $idPersona, array $rbac): array
    {
        $idPersona = trim((string) $idPersona);
        if ($idPersona === '') {
            throw new \InvalidArgumentException('Missing idPersona');
        }

        // Guardar solo diferencias vs permisos base por rol (override tipo parche).
        // Nota: el rol del usuario que edita no importa; el parche se calcula contra lo que se envía.
        // Para calcular la base del usuario objetivo, el controlador ya valida al target,
        // pero aquí no tenemos el usuario objetivo. Por seguridad, calculamos diff contra
        // la matriz global para el rol incluido en payload si existe.

        $effective = self::effective();
        $payloadModules = (array) ($rbac['modules'] ?? []);

        // Si el payload viene como {moduleKey: [actions]} (modo usuario del front)
        // calculamos diff contra el rol que venga en el payload si existe, de lo contrario no diffeamos.
        $payloadRole = Role::normalize((string) ($rbac['role'] ?? ''));
        $baseModulesForRole = [];
        if ($payloadRole !== '') {
            foreach (($effective['modules'] ?? []) as $moduleKey => $roleMap) {
                $allowed = is_array($roleMap) ? ($roleMap[$payloadRole] ?? []) : [];
                $baseModulesForRole[(string) $moduleKey] = self::normalizeActionsList($allowed);
            }
        }

        $diffModules = [];
        foreach ($payloadModules as $moduleKey => $allowed) {
            $moduleKey = (string) $moduleKey;
            $desired = self::normalizeActionsList($allowed);
            $base = $payloadRole !== '' ? ($baseModulesForRole[$moduleKey] ?? []) : null;

            // Si no podemos calcular base (sin role), guardamos completo.
            if ($base === null) {
                $diffModules[$moduleKey] = $desired;
                continue;
            }

            if ($desired !== $base) {
                // Importante: si desired es [], se guarda para denegar aunque la base tenga permisos.
                $diffModules[$moduleKey] = $desired;
            }
        }

        $row = PermissionSetting::firstOrNew(['key' => self::USER_KEY_PREFIX . $idPersona]);
        $row->modules = $diffModules;

        $routes = array_values(array_unique((array) ($rbac['routes'] ?? [])));
        $routes[] = 'rbac.me';
        $routes = array_values(array_unique($routes));
        sort($routes);

        $row->routes = $routes;
        $row->updated_at = now();
        $row->updated_by = Auth::user()?->id_persona ?? null;
        $row->save();

        return [
            'key' => $row->key,
            'updated_at' => $row->updated_at,
            'updated_by' => $row->updated_by,
        ];
    }

    public static function deleteUserOverride(string $idPersona): void
    {
        $idPersona = trim((string) $idPersona);
        if ($idPersona === '') {
            return;
        }
        PermissionSetting::where('key', self::USER_KEY_PREFIX . $idPersona)->delete();
    }

    public static function deleteOverride(): void
    {
        PermissionSetting::where('key', self::GLOBAL_KEY)->delete();
    }
}
