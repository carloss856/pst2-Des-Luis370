<?php

namespace App\Http\Controllers;

use App\Models\TarifaServicio;
use App\Models\TarifaServicioHistorial;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use App\Support\ApiPagination;

class TarifaServicioController extends Controller
{
    public function index(Request $request)
    {
        $query = TarifaServicio::query();
        return ApiPagination::respond($request, $query, function ($t) {
            if (empty($t->id_tarifa)) {
                $rawId = $t->getAttribute('_id');
                $t->id_tarifa = is_object($rawId) ? (string) $rawId : ($rawId ?? null);
            }
            return $t;
        });
    }

    public function store(Request $request)
    {
        // Sólo Administrador o Gerente pueden crear tarifas
        $me = Auth::user();
        if (!$me || !in_array($me->tipo, ['Administrador','Gerente'], true)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        $data = $request->validate([
            'tipo_tarea' => 'required|string|max:100',
            'nivel_tecnico' => 'nullable|string|max:50',
            'tarifa_hora' => 'required|numeric|min:0',
            'moneda' => 'nullable|string|max:10',
            'activo' => 'boolean',
            'vigente_desde' => 'nullable|date',
            'vigente_hasta' => 'nullable|date|after_or_equal:vigente_desde',
        ]);
        if (empty($data['id_tarifa'])) {
            $data['id_tarifa'] = 'TRF-' . Str::upper(Str::random(6));
        }
        if (!isset($data['moneda'])) {
            $data['moneda'] = 'USD';
        }
        $item = TarifaServicio::create($data);
        return response()->json($item, 201);
    }

    public function show($id)
    {
        $item = TarifaServicio::where('id_tarifa', $id)->first();
        if (!$item) {
            $item = TarifaServicio::where('_id', $id)->firstOrFail();
        }
        return response()->json($item);
    }

    public function update(Request $request, $id)
    {
        $item = TarifaServicio::where('id_tarifa', $id)->first();
        if (!$item) {
            $item = TarifaServicio::where('_id', $id)->firstOrFail();
        }
        // Sólo Administrador o Gerente pueden modificar tarifas
        $me = Auth::user();
        if (!$me || !in_array($me->tipo, ['Administrador','Gerente'], true)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        $data = $request->validate([
            'tipo_tarea' => 'sometimes|required|string|max:100',
            'nivel_tecnico' => 'nullable|string|max:50',
            'tarifa_hora' => 'sometimes|required|numeric|min:0',
            'moneda' => 'nullable|string|max:10',
            'activo' => 'boolean',
            'vigente_desde' => 'nullable|date',
            'vigente_hasta' => 'nullable|date|after_or_equal:vigente_desde',
        ]);
        $oldRate = $item->tarifa_hora;
        $oldMoneda = $item->moneda;
        $oldTipo = $item->tipo_tarea;
        $oldNivel = $item->nivel_tecnico;
        $item->update($data);

        // Si cambió el monto por hora, registra historial con el valor anterior
        if (array_key_exists('tarifa_hora', $data) && (float)$data['tarifa_hora'] !== (float)$oldRate) {
            $user = Auth::user();
            TarifaServicioHistorial::create([
                'id_historial' => 'HIS-' . Str::upper(Str::random(8)),
                'id_tarifa' => $item->id_tarifa ?? (string) $item->getAttribute('_id'),
                'tipo_tarea' => $oldTipo,
                'nivel_tecnico' => $oldNivel,
                'tarifa_hora' => (float)$oldRate,
                'moneda' => $oldMoneda,
                'fecha_registro' => now(),
                'id_usuario' => $user?->id_persona ?? null,
                'nombre_usuario' => $user?->nombre ?? $user?->email ?? null,
            ]);
        }
        return response()->json($item);
    }

    public function destroy($id)
    {
        $item = TarifaServicio::where('id_tarifa', $id)->first();
        if (!$item) {
            $item = TarifaServicio::where('_id', $id)->firstOrFail();
        }
        // Sólo Administrador o Gerente pueden eliminar tarifas
        $me = Auth::user();
        if (!$me || !in_array($me->tipo, ['Administrador','Gerente'], true)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        $item->delete();
        return response()->json(['message' => 'Tarifa eliminada']);
    }

    public function history($id)
    {
        $item = TarifaServicio::where('id_tarifa', $id)->first();
        if (!$item) {
            $item = TarifaServicio::where('_id', $id)->firstOrFail();
        }
        $idTarifa = $item->id_tarifa ?? (string) $item->getAttribute('_id');
        $hist = TarifaServicioHistorial::where('id_tarifa', $idTarifa)
            ->orderBy('fecha_registro', 'desc')
            ->get();
        return response()->json([
            'actual' => [
                'tipo_tarea' => $item->tipo_tarea,
                'nivel_tecnico' => $item->nivel_tecnico,
                'tarifa_hora' => $item->tarifa_hora,
                'moneda' => $item->moneda,
            ],
            'anteriores' => $hist,
        ]);
    }
}
