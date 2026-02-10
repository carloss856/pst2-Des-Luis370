<?php

namespace App\Http\Controllers;

use App\Models\Equipo;
use App\Models\Notificacion;
use App\Models\Repuesto;
use App\Models\Servicio;
use App\Models\SolicitudRepuesto;
use App\Models\PropiedadEquipo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Support\Role;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $role = Role::normalize(($user->tipo ?? null) ?: ($user->rol ?? null));
        $widgets = $this->allowedWidgets($role);

        $data = [
            'role' => $role,
            'widgets' => $widgets,
            'cards' => [],
            'lists' => [],
        ];

        $isCliente = $role === 'Cliente';
        $equipoIdsCliente = $isCliente ? $this->equipoIdsForCliente($user->id_persona) : [];

        if (in_array('equipos.total', $widgets, true)) {
            $totalEquipos = $isCliente
                ? count($equipoIdsCliente)
                : (int) Equipo::count();
            $data['cards'][] = [
                'key' => 'equipos.total',
                'title' => 'Equipos',
                'value' => $totalEquipos,
            ];
        }

        if (in_array('servicios.por_estado', $widgets, true)) {
            $estados = $isCliente
                ? Servicio::whereIn('id_equipo', $equipoIdsCliente)->pluck('estado')->toArray()
                : Servicio::pluck('estado')->toArray();

            $counts = ['Pendiente' => 0, 'En proceso' => 0, 'Finalizado' => 0];
            foreach ($estados as $estado) {
                if (!is_string($estado)) {
                    continue;
                }
                if (!isset($counts[$estado])) {
                    $counts[$estado] = 0;
                }
                $counts[$estado]++;
            }

            $data['cards'][] = [
                'key' => 'servicios.por_estado',
                'title' => 'Servicios por estado',
                'value' => $counts,
            ];
        }

        if (in_array('solicitudes.pendientes', $widgets, true)) {
            $query = SolicitudRepuesto::where('estado_solicitud', 'Pendiente');
            if ($isCliente) {
                $query->where('id_usuario', $user->id_persona);
            }

            $data['cards'][] = [
                'key' => 'solicitudes.pendientes',
                'title' => 'Solicitudes pendientes',
                'value' => (int) $query->count(),
            ];
        }

        if (in_array('repuestos.criticos', $widgets, true)) {
            $repuestos = Repuesto::get(['id_repuesto', 'nombre_repuesto', 'cantidad_disponible', 'nivel_critico']);
            $criticos = $repuestos
                ->filter(function ($r) {
                    $disp = (int) ($r->cantidad_disponible ?? 0);
                    $crit = (int) ($r->nivel_critico ?? 0);
                    return $crit > 0 && $disp <= $crit;
                })
                ->values();

            $data['cards'][] = [
                'key' => 'repuestos.criticos',
                'title' => 'Repuestos en nivel crítico',
                'value' => (int) $criticos->count(),
            ];

            $data['lists']['repuestos_criticos'] = $criticos
                ->take(10)
                ->map(function ($r) {
                    return [
                        'id_repuesto' => $r->id_repuesto,
                        'nombre_repuesto' => $r->nombre_repuesto,
                        'cantidad_disponible' => (int) ($r->cantidad_disponible ?? 0),
                        'nivel_critico' => (int) ($r->nivel_critico ?? 0),
                    ];
                })
                ->toArray();
        }

        if (in_array('notificaciones.recientes', $widgets, true)) {
            $email = $user->email;
            $notifs = Notificacion::where('email_destinatario', $email)
                ->orderBy('fecha_envio', 'desc')
                ->limit(5)
                ->get(['id_notificacion', 'asunto', 'fecha_envio', 'estado_envio', 'id_servicio']);

            $data['lists']['notificaciones_recientes'] = $notifs
                ->map(function ($n) {
                    $rawId = $n->getAttribute('_id');
                    $idNotif = $n->id_notificacion;
                    if (empty($idNotif)) {
                        $idNotif = is_object($rawId) ? (string) $rawId : ($rawId ?? null);
                    }
                    return [
                        'id_notificacion' => $idNotif,
                        'asunto' => $n->asunto,
                        'fecha_envio' => $n->fecha_envio,
                        'estado_envio' => $n->estado_envio,
                        'id_servicio' => $n->id_servicio ?? null,
                    ];
                })
                ->toArray();
        }

        return response()->json($data);
    }

    private function allowedWidgets(?string $role): array
    {
        // Permisos de widgets por rol (servidor manda la lista; el front no decide).
        // Nota: usuarios tipo Empresa no deberían loguearse, pero si lo hacen, se deja mínimo.
        return match ($role) {
            'Administrador', 'Gerente', 'Técnico' => [
                'equipos.total',
                'servicios.por_estado',
                'solicitudes.pendientes',
                'repuestos.criticos',
                'notificaciones.recientes',
            ],
            'Cliente' => [
                'equipos.total',
                'servicios.por_estado',
                'solicitudes.pendientes',
                'notificaciones.recientes',
            ],
            default => [
                'notificaciones.recientes',
            ],
        };
    }

    private function equipoIdsForCliente(string $idPersona): array
    {
        $eqPorCreador = Equipo::where('id_persona', $idPersona)->pluck('id_equipo')->toArray();
        $eqPorAsignado = PropiedadEquipo::where('id_persona', $idPersona)->pluck('id_equipo')->toArray();
        return array_values(array_unique(array_merge($eqPorCreador, $eqPorAsignado)));
    }
}
