<?php

namespace App\Http\Controllers;

use App\Models\Notificacion;
use Illuminate\Support\Facades\Mail;
use App\Models\Equipo;
use App\Models\PropiedadEquipo;
use App\Models\Usuario;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Support\ApiPagination;
use App\Support\Role;
use App\Support\BusinessId;
use App\Traits\NotificacionTrait;

class EquipoController extends Controller
{
    use NotificacionTrait;
    // Listar todos los equipos
    public function index(Request $request)
    {
        $me = Auth::user();
        $role = Role::normalize($me ? ($me->tipo ?? $me->rol ?? null) : null);
        $query = Equipo::query();
        if ($me && !in_array($role, ['Administrador','Gerente','Técnico'])) {
            if ($role === 'Cliente') {
                $eqAsignados = PropiedadEquipo::where('id_persona', $me->id_persona)->pluck('id_equipo')->toArray();
                $query->where(function($q) use ($me, $eqAsignados) {
                    $q->where('id_persona', $me->id_persona)
                      ->orWhereIn('id_equipo', $eqAsignados);
                });
            } else {
                // Sin permiso de acceso, retorna lista vacía evitando whereRaw con MongoDB builder
                return response()->json([]);
            }
        }
        $query->with(['propiedad.usuario']);
        return ApiPagination::respond($request, $query, function ($e) {
            if (empty($e->id_equipo)) {
                $rawId = $e->getAttribute('_id');
                $e->id_equipo = is_object($rawId) ? (string) $rawId : ($rawId ?? null);
            }
            // expone id_asignado para facilitar render en front
            $e->id_asignado = optional($e->propiedad)->id_persona ?? null;
            return $e;
        });
    }

    // Guardar un nuevo equipo
    public function store(Request $request)
    {
        $request->validate([
            'tipo_equipo' => 'required|string|max:50',
            'marca' => 'nullable|string|max:50',
            'modelo' => 'nullable|string|max:50',
            // usamos el usuario autenticado como creador
            // el formulario DEBE enviar el usuario asignado
            'id_asignado' => 'required|string',
        ]);

        // 1. Crear equipo con el usuario que lo crea
        $creator = Auth::user();
        $creatorId = $creator?->id_persona;
        $assignedId = $request->id_asignado;
        // Validación manual de existencia del asignado en Mongo (acepta id_persona o _id)
        $assignedIdFinal = BusinessId::resolve(Usuario::class, 'id_persona', $assignedId);
        if (!$assignedIdFinal) {
            return response()->json(['errors' => ['id_asignado' => ['El usuario asignado no existe']]], 422);
        }
        $payload = [
            'tipo_equipo' => $request->tipo_equipo,
            'marca' => $request->marca,
            'modelo' => $request->modelo,
            'id_persona' => $creatorId,
        ];
        if (empty($payload['id_equipo'])) {
            $payload['id_equipo'] = 'EQP-' . \Illuminate\Support\Str::upper(\Illuminate\Support\Str::random(6));
        }
        $equipo = Equipo::create($payload);

        \App\Models\PropiedadEquipo::create([
            'id_equipo' => $equipo->id_equipo,
            'id_persona' => $assignedIdFinal,
            'id_propiedad' => 'PRP-' . \Illuminate\Support\Str::upper(\Illuminate\Support\Str::random(6)),
        ]);

        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Equipo creado',
            'Se ha creado el equipo: ' . $equipo->tipo_equipo . ' ' . $equipo->marca . ' ' . $equipo->modelo,
            $email_usuario,
            $equipo->id_servicio ?? null,
            'equipos'
        );
        return response()->json($equipo, 201);
    }

    // Mostrar un equipo específico
    public function show($id)
    {
        $equipo = Equipo::where('id_equipo', $id)->first();
        if (!$equipo) {
            $equipo = Equipo::where('_id', $id)->firstOrFail();
        }
        $me = Auth::user();
        $role = Role::normalize($me ? ($me->tipo ?? $me->rol ?? null) : null);
        if ($me && !in_array($role, ['Administrador','Gerente','Técnico'])) {
            if ($role === 'Cliente') {
                $asignado = PropiedadEquipo::where('id_equipo', $equipo->id_equipo)
                    ->where('id_persona', $me->id_persona)->exists();
                if ($equipo->id_persona !== $me->id_persona && !$asignado) {
                    return response()->json(['message' => 'Forbidden'], 403);
                }
            } else {
                return response()->json(['message' => 'Forbidden'], 403);
            }
        }
        return response()->json($equipo);
    }

    // Actualizar un equipo
    public function update(Request $request, $id)
    {
        $equipo = Equipo::where('id_equipo', $id)->first();
        if (!$equipo) {
            $equipo = Equipo::where('_id', $id)->firstOrFail();
        }

        $request->validate([
            'tipo_equipo' => 'required|string|max:50',
            'marca' => 'nullable|string|max:50',
            'modelo' => 'nullable|string|max:50',
            'id_asignado' => 'nullable|string',
        ]);
        
        $propiedad = PropiedadEquipo::where('id_equipo', $equipo->id_equipo)->first();

        if ($request->filled('id_asignado')) {
            $assignedIdUpd = $request->id_asignado;
            $assignedUpdFinal = BusinessId::resolve(Usuario::class, 'id_persona', $assignedIdUpd);
            if (!$assignedUpdFinal) {
                return response()->json(['errors' => ['id_asignado' => ['El usuario asignado no existe']]], 422);
            }
            if ($propiedad) {
                $propiedad->update(['id_persona' => $assignedUpdFinal]);
            } else {
                PropiedadEquipo::create([
                    'id_equipo' => $equipo->id_equipo,
                    'id_persona' => $assignedUpdFinal,
                ]);
            }
        }
        
        $equipo->update($request->only(['tipo_equipo', 'marca', 'modelo']));
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Equipo actualizado',
            'Se ha actualizado el equipo: ' . $equipo->tipo_equipo . ' ' . $equipo->marca . ' ' . $equipo->modelo,
            $email_usuario,
            $equipo->id_servicio ?? null,
            'equipos'
        );
        return response()->json($equipo);
    }

    // Eliminar un equipo
    public function destroy($id)
    {
        $equipo = Equipo::where('id_equipo', $id)->first();
        if (!$equipo) {
            $equipo = Equipo::where('_id', $id)->firstOrFail();
        }
        $equipo->delete();
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Equipo eliminado',
            'Se ha eliminado el equipo: ' . $equipo->tipo_equipo . ' ' . $equipo->marca . ' ' . $equipo->modelo,
            $email_usuario,
            $equipo->id_servicio ?? null,
            'equipos'
        );
        return response()->json(['message' => 'Equipo eliminado']);
    }
}
