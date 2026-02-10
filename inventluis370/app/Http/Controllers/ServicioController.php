<?php

namespace App\Http\Controllers;

use App\Models\Servicio;
use Illuminate\Http\Request;
use App\Models\Notificacion;
use Illuminate\Support\Facades\Mail;
use App\Traits\NotificacionTrait;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use App\Support\ApiPagination;
use App\Support\Role;
use App\Support\BusinessId;
use App\Models\Equipo;

class ServicioController extends Controller
{
    use NotificacionTrait;
    // Listar todos los servicios
    public function index(Request $request)
    {
        $me = Auth::user();
        $role = Role::normalize($me ? ($me->tipo ?? $me->rol ?? null) : null);
        $query = Servicio::query();
        if ($me && !in_array($role, ['Administrador','Gerente','Técnico'])) {
            // limitar por equipos accesibles del cliente
            $equipoIds = [];
            if ($role === 'Cliente') {
                $eqPorCreador = \App\Models\Equipo::where('id_persona', $me->id_persona)->pluck('id_equipo')->toArray();
                $eqPorAsignado = \App\Models\PropiedadEquipo::where('id_persona', $me->id_persona)->pluck('id_equipo')->toArray();
                $equipoIds = array_values(array_unique(array_merge($eqPorCreador, $eqPorAsignado)));
            }
            if (!empty($equipoIds)) {
                $query->whereIn('id_equipo', $equipoIds);
            } else {
                // Sin equipos accesibles, retorna lista vacía (evita whereRaw no soportado por MongoDB builder)
                return response()->json([]);
            }
        }
        return ApiPagination::respond($request, $query, function ($s) {
            if (empty($s->id_servicio)) {
                $rawId = $s->getAttribute('_id');
                $s->id_servicio = is_object($rawId) ? (string) $rawId : ($rawId ?? null);
            }
            return $s;
        });
    }

    // Guardar un nuevo servicio
    public function store(Request $request)
    {
        $request->validate([
            'id_equipo' => 'required|string',
            'codigo_rma' => 'required|string|max:20',
            'fecha_ingreso' => 'required|date',
            'problema_reportado' => 'required|string',
            'estado' => 'required|in:Pendiente,En proceso,Finalizado',
            'costo_estimado' => 'nullable|numeric',
            'costo_real' => 'nullable|numeric',
            'validado_por_gerente' => 'boolean',
        ]);

        $resolvedEquipo = BusinessId::resolve(Equipo::class, 'id_equipo', $request->input('id_equipo'));
        if (!$resolvedEquipo) {
            return response()->json(['errors' => ['id_equipo' => ['Equipo inválido. Envíe id_equipo o _id válido.']]], 400);
        }
        $request->merge(['id_equipo' => $resolvedEquipo]);

        $payload = $request->only(['id_equipo','codigo_rma','fecha_ingreso','problema_reportado','estado','costo_estimado','costo_real','validado_por_gerente']);
        if (empty($payload['id_servicio'])) {
            $payload['id_servicio'] = 'SRV-' . \Illuminate\Support\Str::upper(\Illuminate\Support\Str::random(6));
        }
        $payload['partes_trabajo'] = [];
        $payload['costo_mano_obra'] = 0.0;
        $payload['tiempo_total_minutos'] = 0;
        $servicio = Servicio::create($payload);

        //$fechaInicio = Carbon::parse($servicio->fecha_ingreso);
        //$fechaFin = $fechaInicio->copy()->addDays(90);

        // $garantia = \App\Models\Garantia::create([
        //     'id_servicio' => $servicio->id_servicio,
        //     'fecha_inicio' => $fechaInicio,
        //     'fecha_fin' => $fechaFin,
        //     'observaciones' => null,
        //     'validado_por_gerente' => false,
        // ]);

        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Servicio creado',
            'Se ha creado el servicio con código RMA: ' . $servicio->codigo_rma,
            $email_usuario,
            $servicio->id_servicio ?? null,
            'servicios'
        );
        return response()->json([
            'servicio' => $servicio,
            //'garantia' => $garantia,
            'id_servicio' => $servicio->id_servicio,
            'fecha_creacion' => $servicio->fecha_ingreso,
        ], 201);
    }

    // Mostrar un servicio específico
    public function show($id)
    {
        $servicio = Servicio::where('id_servicio', $id)->first();
        if (!$servicio) {
            $servicio = Servicio::where('_id', $id)->firstOrFail();
        }
        $me = Auth::user();
        $role = Role::normalize($me ? ($me->tipo ?? $me->rol ?? null) : null);
        if ($me && !in_array($role, ['Administrador','Gerente','Técnico'])) {
            $equipo = \App\Models\Equipo::where('id_equipo', $servicio->id_equipo)->first();
            if ($role === 'Cliente') {
                $asignado = \App\Models\PropiedadEquipo::where('id_equipo', $servicio->id_equipo)
                    ->where('id_persona', $me->id_persona)->exists();
                if (!$equipo || ($equipo->id_persona !== $me->id_persona && !$asignado)) {
                    return response()->json(['message' => 'Forbidden'], 403);
                }
            } else {
                return response()->json(['message' => 'Forbidden'], 403);
            }
        }
        return response()->json($servicio);
    }

    // Actualizar un servicio
    public function update(Request $request, $id)
    {
        $servicio = Servicio::where('id_servicio', $id)->first();
        if (!$servicio) {
            $servicio = Servicio::where('_id', $id)->firstOrFail();
        }
        $validated = $request->all();
        $estadoAnterior = $servicio->validado_por_gerente;
        $servicio->update($validated);

        $request->validate([
            'id_equipo' => 'required|string',
            'codigo_rma' => 'required|string|max:20',
            'fecha_ingreso' => 'required|date',
            'problema_reportado' => 'required|string',
            'estado' => 'required|in:Pendiente,En proceso,Finalizado',
            'costo_estimado' => 'nullable|numeric',
            'costo_real' => 'nullable|numeric',
            'validado_por_gerente' => 'boolean',
        ]);

        $resolvedEquipo = BusinessId::resolve(Equipo::class, 'id_equipo', $request->input('id_equipo'));
        if (!$resolvedEquipo) {
            return response()->json(['errors' => ['id_equipo' => ['Equipo inválido. Envíe id_equipo o _id válido.']]], 400);
        }
        $request->merge(['id_equipo' => $resolvedEquipo]);

        if (!$estadoAnterior && $servicio->validado_por_gerente) {
            \App\Models\Garantia::create([
                'id_servicio' => $servicio->id_servicio,
                'fecha_inicio' => now(),
                'fecha_fin' => now()->addMonths(6),
                'estado' => 'Activa',
            ]);
        }

        $servicio->update($request->only(['id_equipo','codigo_rma','fecha_ingreso','problema_reportado','estado','costo_estimado','costo_real','validado_por_gerente']));
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Servicio actualizado',
            'Se ha actualizado el servicio con código RMA: ' . $servicio->codigo_rma,
            $email_usuario,
            $servicio->id_servicio ?? null,
            'servicios'
        );
        return response()->json($servicio);
    }

    // Eliminar un servicio
    public function destroy($id)
    {
        $servicio = Servicio::where('id_servicio', $id)->first();
        if (!$servicio) {
            $servicio = Servicio::where('_id', $id)->firstOrFail();
        }
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Servicio eliminado',
            'Se ha eliminado el servicio con código RMA: ' . $servicio->codigo_rma,
            $email_usuario,
            $servicio->id_servicio,
            'servicios'
        );
        $servicio->delete();
        return response()->json(['message' => 'Servicio eliminado']);
    }

    // ====== Partes de trabajo (horas de técnico) ======
    public function listPartes($id)
    {
        $servicio = Servicio::where('id_servicio', $id)->first();
        if (!$servicio) {
            $servicio = Servicio::where('_id', $id)->firstOrFail();
        }
        return response()->json([
            'id_servicio' => $servicio->id_servicio ?? (string) $servicio->getAttribute('_id'),
            'partes_trabajo' => $servicio->partes_trabajo ?? [],
            'costo_mano_obra' => $servicio->costo_mano_obra ?? 0,
            'tiempo_total_minutos' => $servicio->tiempo_total_minutos ?? 0,
        ]);
    }

    public function addParte(Request $request, $id)
    {
        $servicio = Servicio::where('id_servicio', $id)->first();
        if (!$servicio) {
            $servicio = Servicio::where('_id', $id)->firstOrFail();
        }
        $data = $request->validate([
            'tipo_tarea' => 'required|string|max:100', // p.ej. fisico, software
            'minutos' => 'required|integer|min:1',
            'notas' => 'nullable|string',
        ]);

        $tarifa = \App\Models\TarifaServicio::where('tipo_tarea', $data['tipo_tarea'])
            ->where(function($q){ $q->where('activo', true)->orWhereNull('activo'); })
            ->orderBy('vigente_desde', 'desc')
            ->first();

        $tarifaHora = $tarifa?->tarifa_hora ?? 0.0;
        $moneda = $tarifa?->moneda ?? 'USD';

        $parte = [
            'id_parte' => 'PAR-' . \Illuminate\Support\Str::upper(\Illuminate\Support\Str::random(6)),
            'id_tecnico' => optional(\Illuminate\Support\Facades\Auth::user())->id_persona ?? null,
            'tipo_tarea' => $data['tipo_tarea'],
            'minutos' => (int) $data['minutos'],
            'notas' => $data['notas'] ?? null,
            'tarifa_hora' => (float) $tarifaHora,
            'moneda' => $moneda,
            'costo_linea' => round(($tarifaHora * ($data['minutos'] / 60)), 2),
            'fecha' => now(),
        ];

        $partes = $servicio->partes_trabajo ?? [];
        $partes[] = $parte;
        [$tiempoTotal, $costoTotal] = $this->recalcularManoObra($partes);
        $servicio->update([
            'partes_trabajo' => $partes,
            'tiempo_total_minutos' => $tiempoTotal,
            'costo_mano_obra' => $costoTotal,
        ]);

        return response()->json([
            'message' => 'Parte agregada',
            'partes_trabajo' => $servicio->partes_trabajo,
            'costo_mano_obra' => $servicio->costo_mano_obra,
            'tiempo_total_minutos' => $servicio->tiempo_total_minutos,
        ], 201);
    }

    public function updateParte(Request $request, $id, $id_parte)
    {
        $servicio = Servicio::where('id_servicio', $id)->first();
        if (!$servicio) {
            $servicio = Servicio::where('_id', $id)->firstOrFail();
        }
        $me = Auth::user();
        $data = $request->validate([
            'tipo_tarea' => 'sometimes|required|string|max:100',
            'minutos' => 'sometimes|required|integer|min:1',
            'notas' => 'nullable|string',
        ]);
        $partes = $servicio->partes_trabajo ?? [];
        $found = false;
        foreach ($partes as &$p) {
            if (($p['id_parte'] ?? null) === $id_parte) {
                // Solo el técnico creador o un Administrador puede editar
                if ($me && $me->tipo === 'Técnico' && !empty($p['id_tecnico']) && $p['id_tecnico'] !== ($me->id_persona ?? null)) {
                    return response()->json(['message' => 'Forbidden'], 403);
                }
                $found = true;
                $tipo = $data['tipo_tarea'] ?? $p['tipo_tarea'];
                $min = isset($data['minutos']) ? (int)$data['minutos'] : (int)($p['minutos'] ?? 0);

                // Revalúa tarifa si cambia el tipo
                if (isset($data['tipo_tarea'])) {
                    $tarifa = \App\Models\TarifaServicio::where('tipo_tarea', $tipo)
                        ->where(function($q){ $q->where('activo', true)->orWhereNull('activo'); })
                        ->orderBy('vigente_desde', 'desc')
                        ->first();
                    $p['tarifa_hora'] = (float)($tarifa?->tarifa_hora ?? $p['tarifa_hora'] ?? 0);
                    $p['moneda'] = $tarifa?->moneda ?? ($p['moneda'] ?? 'USD');
                }

                if (isset($data['tipo_tarea'])) $p['tipo_tarea'] = $tipo;
                if (isset($data['minutos'])) $p['minutos'] = $min;
                if (array_key_exists('notas', $data)) $p['notas'] = $data['notas'];
                $p['costo_linea'] = round((($p['tarifa_hora'] ?? 0) * ($p['minutos'] / 60)), 2);
                break;
            }
        }
        if (!$found) {
            return response()->json(['message' => 'Parte no encontrada'], 404);
        }
        [$tiempoTotal, $costoTotal] = $this->recalcularManoObra($partes);
        $servicio->update([
            'partes_trabajo' => $partes,
            'tiempo_total_minutos' => $tiempoTotal,
            'costo_mano_obra' => $costoTotal,
        ]);
        return response()->json([
            'message' => 'Parte actualizada',
            'partes_trabajo' => $servicio->partes_trabajo,
            'costo_mano_obra' => $servicio->costo_mano_obra,
            'tiempo_total_minutos' => $servicio->tiempo_total_minutos,
        ]);
    }

    public function deleteParte($id, $id_parte)
    {
        $servicio = Servicio::where('id_servicio', $id)->first();
        if (!$servicio) {
            $servicio = Servicio::where('_id', $id)->firstOrFail();
        }
        $me = Auth::user();
        $partes = $servicio->partes_trabajo ?? [];
        $new = [];
        $removed = false;
        foreach ($partes as $p) {
            if (($p['id_parte'] ?? null) === $id_parte) { $removed = true; continue; }
            $new[] = $p;
        }
        if ($removed) {
            // Verifica permiso de eliminación (técnico solo sus partes)
            foreach ($partes as $p) {
                if (($p['id_parte'] ?? null) === $id_parte) {
                    if ($me && $me->tipo === 'Técnico' && !empty($p['id_tecnico']) && $p['id_tecnico'] !== ($me->id_persona ?? null)) {
                        return response()->json(['message' => 'Forbidden'], 403);
                    }
                }
            }
        }
        if (!$removed) {
            return response()->json(['message' => 'Parte no encontrada'], 404);
        }
        [$tiempoTotal, $costoTotal] = $this->recalcularManoObra($new);
        $servicio->update([
            'partes_trabajo' => $new,
            'tiempo_total_minutos' => $tiempoTotal,
            'costo_mano_obra' => $costoTotal,
        ]);
        return response()->json([
            'message' => 'Parte eliminada',
            'partes_trabajo' => $servicio->partes_trabajo,
            'costo_mano_obra' => $servicio->costo_mano_obra,
            'tiempo_total_minutos' => $servicio->tiempo_total_minutos,
        ]);
    }

    private function recalcularManoObra(array $partes): array
    {
        $min = 0; $total = 0.0;
        foreach ($partes as $p) {
            $m = (int)($p['minutos'] ?? 0);
            $min += $m;
            $tarifa = (float)($p['tarifa_hora'] ?? 0);
            $total += ($tarifa * ($m / 60));
        }
        return [$min, round($total, 2)];
    }
}
