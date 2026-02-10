<?php

namespace App\Http\Controllers;

use App\Models\Empresa;
use App\Models\Equipo;
use App\Models\Garantia;
use App\Models\Inventario;
use App\Models\Notificacion;
use App\Models\PropiedadEquipo;
use App\Models\Reporte;
use App\Models\Repuesto;
use App\Models\Rma;
use App\Models\Servicio;
use App\Models\SolicitudRepuesto;
use App\Models\TarifaServicio;
use App\Models\TarifaServicioHistorial;
use App\Models\Usuario;
use App\Support\Role;
use App\Support\PermissionsStore;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StatsController extends Controller
{
    private const PERIODS = ['day', 'week', 'month', 'year'];

    public function show(Request $request, string $module)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $role = Role::normalize(($user->tipo ?? null) ?: ($user->rol ?? null));
        if (!$role) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $module = trim($module);
        $spec = $this->moduleSpec($module);
        if (!$spec) {
            return response()->json(['message' => 'Módulo inválido'], 404);
        }

        if (!$this->canIndexModule($module, $role)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $period = $request->query('period', 'month');
        if (!in_array($period, self::PERIODS, true)) {
            return response()->json(['message' => 'Periodo inválido', 'allowed' => self::PERIODS], 422);
        }

        [$from, $to] = $this->resolveRange($request, $period);

        $dateField = $spec['dateField'];
        $modelClass = $spec['model'];

        $match = [
            '__date' => [
                '$gte' => $this->toUtcDateTime($from),
                '$lte' => $this->toUtcDateTime($to),
            ],
        ];

        $match = array_merge($match, $this->scopeMatchForRole($module, $role, $user));

        $dateExpr = $dateField ? ['$toDate' => '$' . $dateField] : ['$toDate' => '$_id'];

        $labelExpr = $this->labelExpression($period, '$__date');

        $pipeline = [
            ['$addFields' => ['__date' => $dateExpr]],
            ['$match' => $match],
            ['$group' => ['_id' => $labelExpr, 'count' => ['$sum' => 1]]],
            ['$sort' => ['_id' => 1]],
            ['$project' => ['_id' => 0, 'label' => '$_id', 'count' => 1]],
        ];

        $rows = $this->aggregate($modelClass, $pipeline);
        $total = 0;
        foreach ($rows as $r) {
            $total += (int) ($r['count'] ?? 0);
        }

        return response()->json([
            'module' => $module,
            'period' => $period,
            'from' => $from->toISOString(),
            'to' => $to->toISOString(),
            'total' => $total,
            'buckets' => $rows,
        ]);
    }

    public function batch(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $role = Role::normalize(($user->tipo ?? null) ?: ($user->rol ?? null));
        if (!$role) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $modules = $request->input('modules');
        if (!is_array($modules) || empty($modules)) {
            return response()->json(['message' => 'modules debe ser un array no vacío'], 422);
        }

        $period = $request->input('period', 'day');
        if (!in_array($period, self::PERIODS, true)) {
            return response()->json(['message' => 'Periodo inválido', 'allowed' => self::PERIODS], 422);
        }

        [$from, $to] = $this->resolveRange($request, $period);

        $out = [];
        foreach ($modules as $module) {
            if (!is_string($module)) {
                continue;
            }
            $module = trim($module);
            $spec = $this->moduleSpec($module);
            if (!$spec) {
                continue;
            }
            if (!$this->canIndexModule($module, $role)) {
                continue;
            }

            $dateField = $spec['dateField'];
            $modelClass = $spec['model'];

            $match = [
                '__date' => [
                    '$gte' => $this->toUtcDateTime($from),
                    '$lte' => $this->toUtcDateTime($to),
                ],
            ];
            $match = array_merge($match, $this->scopeMatchForRole($module, $role, $user));

            $dateExpr = $dateField ? ['$toDate' => '$' . $dateField] : ['$toDate' => '$_id'];
            $labelExpr = $this->labelExpression($period, '$__date');

            $pipeline = [
                ['$addFields' => ['__date' => $dateExpr]],
                ['$match' => $match],
                ['$group' => ['_id' => $labelExpr, 'count' => ['$sum' => 1]]],
                ['$sort' => ['_id' => 1]],
                ['$project' => ['_id' => 0, 'label' => '$_id', 'count' => 1]],
            ];

            $rows = $this->aggregate($modelClass, $pipeline);
            $total = 0;
            foreach ($rows as $r) {
                $total += (int) ($r['count'] ?? 0);
            }

            $out[$module] = [
                'module' => $module,
                'period' => $period,
                'from' => $from->toISOString(),
                'to' => $to->toISOString(),
                'total' => $total,
                'buckets' => $rows,
            ];
        }

        return response()->json([
            'period' => $period,
            'from' => $from->toISOString(),
            'to' => $to->toISOString(),
            'data' => $out,
        ]);
    }

    private function moduleSpec(string $module): ?array
    {
        $map = [
            'empresas' => ['model' => Empresa::class, 'dateField' => 'fecha_creacion'],
            'usuarios' => ['model' => Usuario::class, 'dateField' => 'fecha_creacion'],
            'equipos' => ['model' => Equipo::class, 'dateField' => null],
            'propiedad-equipos' => ['model' => PropiedadEquipo::class, 'dateField' => null],
            'servicios' => ['model' => Servicio::class, 'dateField' => 'fecha_ingreso'],
            'garantias' => ['model' => Garantia::class, 'dateField' => 'fecha_inicio'],
            'repuestos' => ['model' => Repuesto::class, 'dateField' => null],
            'inventario' => ['model' => Inventario::class, 'dateField' => 'fecha_entrada'],
            'solicitud-repuestos' => ['model' => SolicitudRepuesto::class, 'dateField' => 'fecha_solicitud'],
            'notificaciones' => ['model' => Notificacion::class, 'dateField' => 'fecha_envio'],
            'reportes' => ['model' => Reporte::class, 'dateField' => 'fecha_generacion'],
            'rma' => ['model' => Rma::class, 'dateField' => 'fecha_creacion'],
            'tarifas-servicio' => ['model' => TarifaServicio::class, 'dateField' => 'vigente_desde'],
            'tarifas-servicio-historial' => ['model' => TarifaServicioHistorial::class, 'dateField' => 'fecha_registro'],
        ];

        return $map[$module] ?? null;
    }

    private function canIndexModule(string $module, string $role): bool
    {
        $effective = PermissionsStore::effective();
        $modules = (array) ($effective['modules'] ?? []);
        $allowed = $modules[$module][$role] ?? null;
        if (!is_array($allowed)) {
            return false;
        }
        return in_array('index', $allowed, true);
    }

    private function resolveRange(Request $request, string $period): array
    {
        $fromQ = $request->query('from') ?? $request->input('from');
        $toQ = $request->query('to') ?? $request->input('to');

        if ($fromQ && $toQ) {
            $from = Carbon::parse($fromQ)->startOfDay();
            $to = Carbon::parse($toQ)->endOfDay();
            return [$from, $to];
        }

        $to = now()->endOfDay();
        $from = match ($period) {
            'day' => now()->subDays(6)->startOfDay(),
            'week' => now()->subWeeks(11)->startOfWeek()->startOfDay(),
            'month' => now()->subMonths(11)->startOfMonth()->startOfDay(),
            'year' => now()->subYears(4)->startOfYear()->startOfDay(),
            default => now()->subMonths(11)->startOfMonth()->startOfDay(),
        };

        return [$from, $to];
    }

    private function toUtcDateTime(Carbon $carbon)
    {
        // MongoDB\BSON\UTCDateTime espera milisegundos.
        $ms = (int) $carbon->valueOf();
        return new \MongoDB\BSON\UTCDateTime($ms);
    }

    private function labelExpression(string $period, string $datePath)
    {
        return match ($period) {
            'day' => ['$dateToString' => ['format' => '%Y-%m-%d', 'date' => $datePath]],
            'month' => ['$dateToString' => ['format' => '%Y-%m', 'date' => $datePath]],
            'year' => ['$dateToString' => ['format' => '%Y', 'date' => $datePath]],
            'week' => $this->isoWeekLabelExpression($datePath),
            default => ['$dateToString' => ['format' => '%Y-%m', 'date' => $datePath]],
        };
    }

    private function isoWeekLabelExpression(string $datePath): array
    {
        // Label tipo: 2026-W05
        return [
            '$let' => [
                'vars' => [
                    'y' => ['$isoWeekYear' => $datePath],
                    'w' => ['$isoWeek' => $datePath],
                ],
                'in' => [
                    '$concat' => [
                        ['$toString' => '$$y'],
                        '-W',
                        [
                            '$cond' => [
                                ['$lt' => ['$$w', 10]],
                                ['$concat' => ['0', ['$toString' => '$$w']]],
                                ['$toString' => '$$w'],
                            ],
                        ],
                    ],
                ],
            ],
        ];
    }

    private function aggregate(string $modelClass, array $pipeline): array
    {
        /** @var \MongoDB\Laravel\Eloquent\Model $model */
        $model = new $modelClass();
        $cursor = $model->raw(function ($collection) use ($pipeline) {
            return $collection->aggregate($pipeline);
        });

        $out = [];
        foreach ($cursor as $doc) {
            // $doc puede ser array u objeto BSON
            $out[] = json_decode(json_encode($doc), true);
        }
        return $out;
    }

    private function scopeMatchForRole(string $module, string $role, $user): array
    {
        if ($role !== 'Cliente') {
            return [];
        }

        // Scope mínimo por seguridad: el cliente solo ve lo suyo.
        return match ($module) {
            'usuarios' => ['id_persona' => $user->id_persona],
            'equipos' => $this->clienteEquiposMatch($user->id_persona),
            'propiedad-equipos' => ['id_persona' => $user->id_persona],
            'servicios' => $this->clienteServiciosMatch($user->id_persona),
            'solicitud-repuestos' => ['id_usuario' => $user->id_persona],
            'notificaciones' => ['email_destinatario' => $user->email],
            'rma' => ['id_persona' => $user->id_persona],
            default => ['_id' => ['$exists' => false]], // fuerza vacío
        };
    }

    private function clienteEquiposMatch(string $idPersona): array
    {
        $eqAsignados = PropiedadEquipo::where('id_persona', $idPersona)->pluck('id_equipo')->toArray();
        return [
            '$or' => [
                ['id_persona' => $idPersona],
                ['id_equipo' => ['$in' => $eqAsignados]],
            ],
        ];
    }

    private function clienteServiciosMatch(string $idPersona): array
    {
        $eqAsignados = PropiedadEquipo::where('id_persona', $idPersona)->pluck('id_equipo')->toArray();
        $eqCreados = Equipo::where('id_persona', $idPersona)->pluck('id_equipo')->toArray();
        $equipoIds = array_values(array_unique(array_merge($eqAsignados, $eqCreados)));
        return [
            'id_equipo' => ['$in' => $equipoIds],
        ];
    }
}
