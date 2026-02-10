<?php

namespace App\Http\Controllers;

use App\Models\Notificacion;
use Illuminate\Http\Request;
use App\Support\ApiPagination;
use App\Support\BusinessId;
use App\Models\Servicio;
use Illuminate\Support\Facades\Auth;

class NotificacionController extends Controller
{
    private function findOwnedNotificacionOrFail(string $id): Notificacion
    {
        $user = Auth::user();
        if (!$user) {
            abort(401, 'No autenticado');
        }

        $email = $user->email;

        $notificacion = Notificacion::where('email_destinatario', $email)
            ->where('id_notificacion', $id)
            ->first();

        if (!$notificacion) {
            $notificacion = Notificacion::where('email_destinatario', $email)
                ->where('_id', $id)
                ->firstOrFail();
        }

        return $notificacion;
    }

    // Listar todas las notificaciones
    public function index(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email = $user->email;
        $query = Notificacion::where('email_destinatario', $email);

        if ($request->query('leida') !== null) {
            $raw = $request->query('leida');
            $leida = filter_var($raw, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            if ($leida !== null) {
                $query = $query->where('leida', $leida);
            }
        }

        if ($request->query('solo_no_leidas') !== null) {
            $raw = $request->query('solo_no_leidas');
            $solo = filter_var($raw, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            if ($solo) {
                $query = $query->where(function ($q) {
                    $q->where('leida', false)->orWhereNull('leida');
                });
            }
        }

        $query = $query->orderBy('fecha_envio', 'desc');

        return ApiPagination::respond($request, $query, function ($n) {
            if (empty($n->id_notificacion)) {
                $rawId = $n->getAttribute('_id');
                $n->id_notificacion = is_object($rawId) ? (string) $rawId : ($rawId ?? null);
            }

            // Compatibilidad: si el campo no existía en docs viejos
            if (!isset($n->leida)) {
                $n->leida = false;
            }

            return $n;
        });
    }

    // Guardar una nueva notificación
    public function store(Request $request)
    {
        $request->validate([
            'id_servicio' => 'required|string',
            'email_destinatario' => 'required|email|max:100',
            'asunto' => 'required|string|max:150',
            'mensaje' => 'required|string',
            'estado_envio' => 'required|in:Enviado,Pendiente,Fallido',
        ]);

        $resolvedServicio = BusinessId::resolve(Servicio::class, 'id_servicio', $request->input('id_servicio'));
        if (!$resolvedServicio) {
            return response()->json(['errors' => ['id_servicio' => ['Servicio inválido. Envíe id_servicio o _id válido.']]], 400);
        }
        $request->merge(['id_servicio' => $resolvedServicio]);

        $notificacion = Notificacion::create($request->all());
        return response()->json($notificacion, 201);
    }

    // Mostrar una notificación específica
    public function show($id)
    {
        $notificacion = $this->findOwnedNotificacionOrFail((string) $id);
        return response()->json($notificacion);
    }

    // Actualizar una notificación
    public function update(Request $request, $id)
    {
        $notificacion = $this->findOwnedNotificacionOrFail((string) $id);

        $request->validate([
            'id_servicio' => 'required|string',
            'email_destinatario' => 'required|email|max:100',
            'asunto' => 'required|string|max:150',
            'mensaje' => 'required|string',
            'estado_envio' => 'required|in:Enviado,Pendiente,Fallido',
        ]);

        $resolvedServicio = BusinessId::resolve(Servicio::class, 'id_servicio', $request->input('id_servicio'));
        if (!$resolvedServicio) {
            return response()->json(['errors' => ['id_servicio' => ['Servicio inválido. Envíe id_servicio o _id válido.']]], 400);
        }
        $request->merge(['id_servicio' => $resolvedServicio]);

        $notificacion->update($request->only(['id_servicio','email_destinatario','asunto','mensaje','estado_envio']));
        return response()->json($notificacion);
    }

    // Marcar una notificación como leída/no leída
    public function setLeida(Request $request, $id)
    {
        $notificacion = $this->findOwnedNotificacionOrFail((string) $id);

        $data = $request->validate([
            'leida' => 'sometimes|boolean',
        ]);

        $leida = array_key_exists('leida', $data) ? (bool) $data['leida'] : true;

        $notificacion->leida = $leida;
        $notificacion->leida_en = $leida ? now() : null;
        $notificacion->save();

        return response()->json($notificacion);
    }

    // Marcar todas las notificaciones del usuario como leídas
    public function markAllAsRead(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }

        $email = $user->email;

        $query = Notificacion::where('email_destinatario', $email)
            ->where(function ($q) {
                $q->where('leida', false)->orWhereNull('leida');
            });

        $updated = (int) $query->update([
            'leida' => true,
            'leida_en' => now(),
        ]);

        return response()->json([
            'updated' => $updated,
        ]);
    }

    // Eliminar una notificación
    public function destroy($id)
    {
        $notificacion = $this->findOwnedNotificacionOrFail((string) $id);
        $notificacion->delete();
        return response()->json(['message' => 'Notificación eliminada']);
    }
}
