<?php

namespace App\Http\Controllers;

use App\Support\PermissionsStore;
use App\Support\Role;
use Illuminate\Support\Facades\Auth;

class RbacController extends Controller
{
    public function me()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $rbac = PermissionsStore::rbacForUser($user);
        if (empty($rbac['role'])) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json(array_merge([
            'schemaVersion' => PermissionsStore::schemaVersion(),
        ], $rbac));
    }
}
