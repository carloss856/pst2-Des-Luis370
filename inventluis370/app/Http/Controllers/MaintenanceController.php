<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Models\Usuario;
use App\Models\Equipo;
use App\Models\PropiedadEquipo;
use Illuminate\Support\Str;
use App\Support\Role;

class MaintenanceController extends Controller
{
    public function backfillAssignments(Request $request)
    {
        $me = Auth::user();
        $role = Role::normalize($me ? ($me->tipo ?? $me->rol ?? null) : null);

        if (!$me || !in_array($role, ['Administrador','Gerente'])) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $usersUpdated = 0;
        $equiposProcessed = 0;
        $propiedadesCreated = 0;
            $propiedadesUpdated = 0;
        $propiedadesReasignadas = 0;

        // Normaliza id_persona faltante y asegura unicidad en usuarios
        $usuarios = Usuario::all();
        $seen = [];
        foreach ($usuarios as $u) {
            $idp = $u->id_persona;
            $needsNew = empty($idp) || isset($seen[$idp]);
            if ($needsNew) {
                do {
                    $candidate = 'USR-' . Str::upper(Str::random(8));
                } while (Usuario::where('id_persona', $candidate)->exists());
                $u->id_persona = $candidate;
                $u->save();
                $usersUpdated++;
                $seen[$u->id_persona] = true;
            } else {
                $seen[$idp] = true;
            }
        }

        // Crea PropiedadEquipo si falta, asignando por defecto al creador del equipo
        $equipos = Equipo::all();
        foreach ($equipos as $e) {
            $equiposProcessed++;
            $exists = PropiedadEquipo::where('id_equipo', $e->id_equipo)->exists();
            if ($exists) { continue; }
            $assigned = $e->id_persona; // creador por defecto
            if (empty($assigned)) { continue; }
            // asegura que el usuario tenga id_persona
            $u = Usuario::where('id_persona', $assigned)->first();
            if (!$u) { $u = Usuario::where('_id', $assigned)->first(); }
            if (!$u) { continue; }
            if (empty($u->id_persona)) {
                $u->id_persona = 'USR-' . Str::upper(Str::random(8));
                $u->save();
                $usersUpdated++;
            }
            PropiedadEquipo::create([
                'id_propiedad' => 'PRP-' . Str::upper(Str::random(6)),
                'id_equipo' => $e->id_equipo,
                'id_persona' => $u->id_persona,
            ]);
            $propiedadesCreated++;
        }

            // Normaliza PropiedadEquipo.id_persona que apunte a id_persona real (no _id)
            $props = PropiedadEquipo::all();
            foreach ($props as $p) {
                $u = Usuario::where('id_persona', $p->id_persona)->first();
                if ($u) { continue; }
                // probar por _id
                $u = Usuario::where('_id', $p->id_persona)->first();
                if (!$u) { continue; }
                if (empty($u->id_persona)) {
                    $u->id_persona = 'USR-' . Str::upper(Str::random(8));
                    $u->save();
                    $usersUpdated++;
                }
                $p->id_persona = $u->id_persona;
                $p->save();
                $propiedadesUpdated++;
            }

        // Reasignar PropiedadEquipo con id_persona huérfano a un usuario válido (creador o Admin)
        $admin = Usuario::whereIn('tipo', ['Administrador','Gerente'])->first();
        $adminId = $admin?->id_persona;
        $propsAll = PropiedadEquipo::all();
        foreach ($propsAll as $p) {
            $u = Usuario::where('id_persona', $p->id_persona)->first();
            if ($u) { continue; }
            // intentar con creador del equipo
            $eq = Equipo::where('id_equipo', $p->id_equipo)->first();
            $fallbackId = null;
            if ($eq && !empty($eq->id_persona)) {
                $creator = Usuario::where('id_persona', $eq->id_persona)->first();
                if ($creator) { $fallbackId = $creator->id_persona; }
            }
            if (!$fallbackId && $adminId) { $fallbackId = $adminId; }
            if ($fallbackId) {
                $p->id_persona = $fallbackId;
                $p->save();
                $propiedadesReasignadas++;
            }
        }

        return response()->json([
            'usuarios_actualizados' => $usersUpdated,
            'equipos_procesados' => $equiposProcessed,
            'propiedades_creadas' => $propiedadesCreated,
                'propiedades_actualizadas' => $propiedadesUpdated,
            'propiedades_reasignadas' => $propiedadesReasignadas,
        ]);
    }
}
