<?php

namespace App\Http\Controllers;

use App\Models\SolicitudRepuesto;
use App\Models\Repuesto;
use Illuminate\Http\Request;
use App\Models\Notificacion;
use Illuminate\Support\Facades\Mail;
use App\Traits\NotificacionTrait;
use Illuminate\Support\Facades\Auth;
use App\Support\ApiPagination;
use App\Support\Role;
use App\Support\BusinessId;
use App\Models\Usuario;
use App\Models\Servicio;

class SolicitudRepuestoController extends Controller
{
    use NotificacionTrait;
    // Listar todas las solicitudes de repuestos
    public function index(Request $request)
    {
        $me = Auth::user();
        $role = Role::normalize($me ? ($me->tipo ?? $me->rol ?? null) : null);
        $query = SolicitudRepuesto::query();
        if ($me && !in_array($role, ['Administrador','Gerente','Técnico'])) {
            if ($role === 'Cliente') {
                $query->where('id_usuario', $me->id_persona);
            } else {
                return response()->json([]);
            }
        }
        return ApiPagination::respond($request, $query, function ($s) {
            if (empty($s->id_solicitud)) {
                $rawId = $s->getAttribute('_id');
                $s->id_solicitud = is_object($rawId) ? (string) $rawId : ($rawId ?? null);
            }
            return $s;
        });
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'id_repuesto' => 'required|string',
                'id_servicio' => 'required|string',
                'cantidad_solicitada' => 'required|integer|min:1',
                'id_usuario' => 'required|string',
                'estado_solicitud' => 'required|in:Pendiente,Aprobada,Rechazada',
                'comentarios' => 'nullable|string',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 400);
        }

        $resolvedRepuesto = BusinessId::resolve(Repuesto::class, 'id_repuesto', $request->input('id_repuesto'));
        if (!$resolvedRepuesto) {
            return response()->json(['errors' => ['id_repuesto' => ['Repuesto inválido. Envíe id_repuesto o _id válido.']]], 400);
        }
        $resolvedServicio = BusinessId::resolve(Servicio::class, 'id_servicio', $request->input('id_servicio'));
        if (!$resolvedServicio) {
            return response()->json(['errors' => ['id_servicio' => ['Servicio inválido. Envíe id_servicio o _id válido.']]], 400);
        }

        $resolvedIdUsuario = BusinessId::resolve(Usuario::class, 'id_persona', $request->input('id_usuario'));
        if (!$resolvedIdUsuario) {
            return response()->json(['errors' => ['id_usuario' => ['Usuario inválido. Envíe id_persona o _id válido.']]], 400);
        }
        $request->merge([
            'id_repuesto' => $resolvedRepuesto,
            'id_servicio' => $resolvedServicio,
            'id_usuario' => $resolvedIdUsuario,
        ]);

        $repuesto = Repuesto::where('id_repuesto', $resolvedRepuesto)->firstOrFail();

        // Validamos que haya stock solo si está Aprobada
        if ($request->estado_solicitud === 'Aprobada' && $repuesto->cantidad_disponible < $request->cantidad_solicitada) {
            return response()->json(['error' => 'No hay suficiente stock'], 400);
        }

        // Crear la solicitud
        $payload = $request->only(['id_repuesto','id_servicio','cantidad_solicitada','id_usuario','fecha_solicitud','estado_solicitud','comentarios']);
        if (empty($payload['fecha_solicitud'])) {
            $payload['fecha_solicitud'] = now();
        }
        if (empty($payload['id_solicitud'])) {
            $payload['id_solicitud'] = 'SOL-' . \Illuminate\Support\Str::upper(\Illuminate\Support\Str::random(6));
        }
        $solicitud = SolicitudRepuesto::create($payload);

        // Solo restamos del inventario si la solicitud fue aprobada
        if ($request->estado_solicitud === 'Aprobada') {
            $repuesto->cantidad_disponible -= $request->cantidad_solicitada;
            $repuesto->save();
        }

        // Notificación
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }

        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Solicitud de repuesto creada',
            'Se ha creado una solicitud de repuesto para el repuesto ID: ' . $solicitud->id_repuesto .
                ', cantidad: ' . $solicitud->cantidad_solicitada . ' (' . $solicitud->estado_solicitud . ')',
            $email_usuario,
            $solicitud->id_servicio ?? null,
            'solicitudes_repuesto'
        );

        return response()->json($solicitud, 201);
    }

    // Mostrar una solicitud específica
    public function show($id)
    {
        $solicitud = SolicitudRepuesto::where('id_solicitud', $id)->first();
        if (!$solicitud) {
            $solicitud = SolicitudRepuesto::where('_id', $id)->firstOrFail();
        }
        $me = Auth::user();
        $role = Role::normalize($me ? ($me->tipo ?? $me->rol ?? null) : null);
        if ($me && !in_array($role, ['Administrador','Gerente','Técnico'])) {
            if ($role === 'Cliente') {
                if ($solicitud->id_usuario !== $me->id_persona) {
                    return response()->json(['message' => 'Forbidden'], 403);
                }
            } else {
                return response()->json(['message' => 'Forbidden'], 403);
            }
        }
        return response()->json($solicitud);
    }

public function update(Request $request, $id)
{
    $solicitud = SolicitudRepuesto::where('id_solicitud', $id)->first();
    if (!$solicitud) {
        $solicitud = SolicitudRepuesto::where('_id', $id)->firstOrFail();
    }

    $request->validate([
        'id_repuesto' => 'required|string',
        'id_servicio' => 'required|string',
        'cantidad_solicitada' => 'required|integer|min:1',
        'id_usuario' => 'required|string',
        'estado_solicitud' => 'required|in:Pendiente,Aprobada,Rechazada',
        'comentarios' => 'nullable|string',
    ]);

    $resolvedRepuesto = BusinessId::resolve(Repuesto::class, 'id_repuesto', $request->input('id_repuesto'));
    if (!$resolvedRepuesto) {
        return response()->json(['errors' => ['id_repuesto' => ['Repuesto inválido. Envíe id_repuesto o _id válido.']]], 400);
    }
    $resolvedServicio = BusinessId::resolve(Servicio::class, 'id_servicio', $request->input('id_servicio'));
    if (!$resolvedServicio) {
        return response()->json(['errors' => ['id_servicio' => ['Servicio inválido. Envíe id_servicio o _id válido.']]], 400);
    }

    $resolvedIdUsuario = BusinessId::resolve(Usuario::class, 'id_persona', $request->input('id_usuario'));
    if (!$resolvedIdUsuario) {
        return response()->json(['errors' => ['id_usuario' => ['Usuario inválido. Envíe id_persona o _id válido.']]], 400);
    }
    $request->merge([
        'id_repuesto' => $resolvedRepuesto,
        'id_servicio' => $resolvedServicio,
        'id_usuario' => $resolvedIdUsuario,
    ]);

    $repuesto = Repuesto::where('id_repuesto', $resolvedRepuesto)->firstOrFail();

    $cantidadAnterior = $solicitud->cantidad_solicitada;
    $cantidadNueva = (int) $request->cantidad_solicitada;

    if ($request->estado_solicitud === 'Aprobada') {

        if ($solicitud->estado_solicitud !== 'Aprobada') {
            if ($repuesto->cantidad_disponible < $cantidadNueva) {
                return response()->json(['error' => 'No hay suficiente stock disponible'], 400);
            }
            $repuesto->cantidad_disponible -= $cantidadNueva;
        } else {
            if ($cantidadNueva > $cantidadAnterior) {
                $diferencia = $cantidadNueva - $cantidadAnterior;
                if ($repuesto->cantidad_disponible < $diferencia) {
                    return response()->json(['error' => 'No hay suficiente stock disponible'], 400);
                }
                $repuesto->cantidad_disponible -= $diferencia;
            } elseif ($cantidadNueva < $cantidadAnterior) {
                $diferencia = $cantidadAnterior - $cantidadNueva;
                $repuesto->cantidad_disponible += $diferencia;
            }
        }

    } elseif ($request->estado_solicitud === 'Rechazada' && $solicitud->estado_solicitud === 'Aprobada') {
        $repuesto->cantidad_disponible += $cantidadAnterior;
    }

    $repuesto->save();

    $solicitud->update($request->only(['id_repuesto','id_servicio','cantidad_solicitada','id_usuario','fecha_solicitud','estado_solicitud','comentarios']));

    $user = Auth::user();
    if (!$user) {
        return response()->json(['error' => 'No autenticado'], 401);
    }

    $email_usuario = $user->email;
    $this->registrarYEnviarNotificacion(
        'Solicitud de repuesto actualizada',
        'Se ha actualizado la solicitud de repuesto ID: ' . ($solicitud->id_solicitud ?? (string) $solicitud->getAttribute('_id')) .
        ' con estado: ' . $solicitud->estado_solicitud,
        $email_usuario,
        $solicitud->id_servicio ?? null,
        'solicitudes_repuesto'
    );

    return response()->json($solicitud);
}

    public function destroy($id)
    {
        $solicitud = SolicitudRepuesto::where('id_solicitud', $id)->first();
        if (!$solicitud) {
            $solicitud = SolicitudRepuesto::where('_id', $id)->firstOrFail();
        }
        $info = 'ID: ' . ($solicitud->id_solicitud ?? (string) $solicitud->getAttribute('_id'));
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $repuesto = \App\Models\Repuesto::where('id_repuesto', $solicitud->id_repuesto)->first();
        if ($repuesto) {
            $repuesto->cantidad_disponible += $solicitud->cantidad_solicitada;
            $repuesto->save();
        }

        $solicitud->delete();
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Solicitud de repuesto eliminada',
            'Se ha eliminado la solicitud de repuesto ' . $info,
            $email_usuario,
            $solicitud->id_servicio ?? null,
            'solicitudes_repuesto'
        );
        return response()->json(['message' => 'Solicitud eliminada correctamente']);
    }
}
