<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Auth;
use App\Support\Role;
use App\Support\PermissionsStore;
use App\Models\Usuario;

class PermissionsController extends Controller
{
    private function assertCanManage(): array
    {
        $user = Auth::user();
        if (!$user) {
            throw new HttpResponseException(response()->json(['message' => 'Unauthorized'], 401));
        }

        $role = Role::normalize(($user->tipo ?? null) ?: ($user->rol ?? null));
        if (!in_array($role, ['Administrador', 'Gerente'], true)) {
            throw new HttpResponseException(response()->json(['message' => 'Forbidden'], 403));
        }

        return [$user, $role];
    }

    public function show()
    {
        $this->assertCanManage();

        return response()->json([
            'schemaVersion' => PermissionsStore::schemaVersion(),
            'effective' => PermissionsStore::effective(),
            'override' => PermissionsStore::override(),
        ]);
    }

    public function update(Request $request)
    {
        $this->assertCanManage();

        $payload = $request->validate([
            'modules' => 'required|array',
            'routes' => 'nullable|array',
        ]);

        $saved = PermissionsStore::saveOverride([
            'modules' => $payload['modules'],
            'routes' => $payload['routes'] ?? [],
        ]);

        return response()->json([
            'schemaVersion' => PermissionsStore::schemaVersion(),
            'saved' => $saved,
            'effective' => PermissionsStore::effective(),
        ]);
    }

    public function reset()
    {
        $this->assertCanManage();

        PermissionsStore::deleteOverride();
        return response()->json([
            'schemaVersion' => PermissionsStore::schemaVersion(),
            'message' => 'OK',
            'effective' => PermissionsStore::effective(),
        ]);
    }

    public function showUser(string $id)
    {
        $this->assertCanManage();

        $target = Usuario::where('id_persona', $id)->first();
        if (!$target) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $rbac = PermissionsStore::rbacForUser($target);

        return response()->json([
            'schemaVersion' => PermissionsStore::schemaVersion(),
            'user' => [
                'id_persona' => $target->id_persona,
                'nombre' => $target->nombre,
                'tipo' => $target->tipo,
            ],
            'effective' => $rbac,
            'override' => PermissionsStore::userOverride($target->id_persona),
        ]);
    }

    public function updateUser(string $id, Request $request)
    {
        $this->assertCanManage();

        $target = Usuario::where('id_persona', $id)->first();
        if (!$target) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $payload = $request->validate([
            'modules' => 'required|array',
            'routes' => 'nullable|array',
        ]);

        $targetRole = Role::normalize(($target->tipo ?? null) ?: ($target->rol ?? null));

        // Guardamos override directo por usuario (RBAC final: módulos/acciones + rutas)
        $saved = PermissionsStore::saveUserOverride($target->id_persona, [
            'role' => $targetRole,
            'modules' => $payload['modules'],
            'routes' => $payload['routes'] ?? [],
        ]);

        return response()->json([
            'schemaVersion' => PermissionsStore::schemaVersion(),
            'saved' => $saved,
            'effective' => PermissionsStore::rbacForUser($target),
        ]);
    }

    public function resetUser(string $id)
    {
        $this->assertCanManage();

        $target = Usuario::where('id_persona', $id)->first();
        if (!$target) {
            return response()->json(['message' => 'Not found'], 404);
        }

        PermissionsStore::deleteUserOverride($target->id_persona);
        return response()->json([
            'schemaVersion' => PermissionsStore::schemaVersion(),
            'message' => 'OK',
            'effective' => PermissionsStore::rbacForUser($target),
        ]);
    }
}
