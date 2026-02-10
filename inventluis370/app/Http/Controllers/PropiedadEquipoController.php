<?php

namespace App\Http\Controllers;

use App\Models\Notificacion;
use Illuminate\Support\Facades\Mail;
use App\Models\PropiedadEquipo;
use Illuminate\Http\Request;
use App\Traits\NotificacionTrait;
use Illuminate\Support\Facades\Auth;
use App\Support\ApiPagination;
use App\Support\Role;
use App\Support\BusinessId;
use App\Models\Equipo;
use App\Models\Usuario;

class PropiedadEquipoController extends Controller
{
    use NotificacionTrait;
    // Listar todas las relaciones de propiedad
    public function index(Request $request)
    {
        $me = Auth::user();
        $role = Role::normalize($me ? ($me->tipo ?? $me->rol ?? null) : null);
        $query = PropiedadEquipo::query();
        if ($me && !in_array($role, ['Administrador','Gerente','Técnico'])) {
            if ($role === 'Cliente') {
                $query->where('id_persona', $me->id_persona);
            } else {
                return response()->json([]);
            }
        }
        return ApiPagination::respond($request, $query, function ($p) {
            if (empty($p->id_propiedad)) {
                $rawId = $p->getAttribute('_id');
                $p->id_propiedad = is_object($rawId) ? (string) $rawId : ($rawId ?? null);
            }
            return $p;
        });
    }

    // Guardar una nueva relación de propiedad
    public function store(Request $request)
    {
        $request->validate([
            'id_equipo' => 'required|string',
            'id_persona' => 'required|string',
        ]);

        $resolvedEquipo = BusinessId::resolve(Equipo::class, 'id_equipo', $request->input('id_equipo'));
        if (!$resolvedEquipo) {
            return response()->json(['errors' => ['id_equipo' => ['Equipo inválido. Envíe id_equipo o _id válido.']]], 400);
        }
        $resolvedPersona = BusinessId::resolve(Usuario::class, 'id_persona', $request->input('id_persona'));
        if (!$resolvedPersona) {
            return response()->json(['errors' => ['id_persona' => ['Usuario inválido. Envíe id_persona o _id válido.']]], 400);
        }
        $request->merge(['id_equipo' => $resolvedEquipo, 'id_persona' => $resolvedPersona]);

        $payload = $request->only(['id_equipo','id_persona']);
        if (empty($payload['id_propiedad'])) {
            $payload['id_propiedad'] = 'PRP-' . \Illuminate\Support\Str::upper(\Illuminate\Support\Str::random(6));
        }
        $propiedad = PropiedadEquipo::create($payload);
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Propiedad de equipo asignada',
            'Se ha asignado el equipo ID: ' . $propiedad->id_equipo . ' a la persona ID: ' . $propiedad->id_persona,
            $email_usuario,
            $propiedad->id_servicio ?? null,
            'equipos'
        );
        return response()->json($propiedad, 201);
    }

    // Mostrar una relación específica
    public function show($id)
    {
        $propiedad = PropiedadEquipo::where('id_propiedad', $id)->first();
        if (!$propiedad) {
            $propiedad = PropiedadEquipo::where('_id', $id)->firstOrFail();
        }
        $me = Auth::user();
        $role = Role::normalize($me ? ($me->tipo ?? $me->rol ?? null) : null);
        if ($me && !in_array($role, ['Administrador','Gerente','Técnico'])) {
            if ($role === 'Cliente') {
                if ($propiedad->id_persona !== $me->id_persona) {
                    return response()->json(['message' => 'Forbidden'], 403);
                }
            } else {
                return response()->json(['message' => 'Forbidden'], 403);
            }
        }
        return response()->json($propiedad);
    }

    // Actualizar una relación de propiedad
    public function update(Request $request, $id)
    {
        $propiedad = PropiedadEquipo::where('id_propiedad', $id)->first();
        if (!$propiedad) {
            $propiedad = PropiedadEquipo::where('_id', $id)->firstOrFail();
        }

        $request->validate([
            'id_equipo' => 'required|string',
            'id_persona' => 'required|string',
        ]);

        $resolvedEquipo = BusinessId::resolve(Equipo::class, 'id_equipo', $request->input('id_equipo'));
        if (!$resolvedEquipo) {
            return response()->json(['errors' => ['id_equipo' => ['Equipo inválido. Envíe id_equipo o _id válido.']]], 400);
        }
        $resolvedPersona = BusinessId::resolve(Usuario::class, 'id_persona', $request->input('id_persona'));
        if (!$resolvedPersona) {
            return response()->json(['errors' => ['id_persona' => ['Usuario inválido. Envíe id_persona o _id válido.']]], 400);
        }
        $request->merge(['id_equipo' => $resolvedEquipo, 'id_persona' => $resolvedPersona]);

        $propiedad->update($request->only(['id_equipo','id_persona']));
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Propiedad de equipo actualizada',
            'Se ha actualizado la propiedad del equipo ID: ' . $propiedad->id_equipo . ' para la persona ID: ' . $propiedad->id_persona,
            $email_usuario,
            $propiedad->id_servicio ?? null,
            'equipos'
        );
        return response()->json($propiedad);
    }

    // Eliminar una relación de propiedad
    public function destroy($id)
    {
        $propiedad = PropiedadEquipo::where('id_propiedad', $id)->first();
        if (!$propiedad) {
            $propiedad = PropiedadEquipo::where('_id', $id)->firstOrFail();
        }
        $propiedad->delete();
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Propiedad de equipo eliminada',
            'Se ha eliminado la relación de propiedad del equipo ID: ' . $propiedad->id_equipo . ' para la persona ID: ' . $propiedad->id_persona,
            $email_usuario,
            $propiedad->id_servicio ?? null,
            'equipos'
        );
        return response()->json(['message' => 'Propiedad eliminada']);
    }
    public function showByEquipo($id_equipo)
    {
        $resolvedEquipo = BusinessId::resolve(Equipo::class, 'id_equipo', $id_equipo);
        if (!$resolvedEquipo) {
            return null;
        }
        return PropiedadEquipo::where('id_equipo', $resolvedEquipo)->first();
    }
}
