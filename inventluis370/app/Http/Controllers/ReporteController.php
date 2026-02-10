<?php

namespace App\Http\Controllers;

use App\Models\Reporte;
use Illuminate\Http\Request;
use App\Models\Notificacion;
use Illuminate\Support\Facades\Mail;
use App\Traits\NotificacionTrait;
use App\Support\ApiPagination;
use App\Support\BusinessId;
use App\Models\Usuario;
use Illuminate\Support\Facades\Auth;

class ReporteController extends Controller
{
    use NotificacionTrait;

    private function normalizeParametrosUtilizados($value): ?string
    {
        if ($value === null) {
            return null;
        }

        if (is_string($value)) {
            $trimmed = trim($value);
            if ($trimmed === '') {
                return null;
            }

            $decoded = json_decode($trimmed, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                return $this->canonicalJson($decoded);
            }

            // Compatibilidad: si venía como string libre, lo envolvemos en un JSON estable.
            return $this->canonicalJson([
                'raw' => $value,
                'source' => 'web',
            ]);
        }

        if (is_array($value)) {
            if (!array_key_exists('source', $value)) {
                $value['source'] = 'web';
            }
            return $this->canonicalJson($value);
        }

        // Fallback defensivo
        return $this->canonicalJson([
            'raw' => (string) $value,
            'source' => 'web',
        ]);
    }

    private function canonicalJson($value): string
    {
        $normalized = $this->sortKeysRecursive($value);

        // Reglas “de contrato” para sincronización web/móvil
        if (is_array($normalized)) {
            if (isset($normalized['modules']) && is_array($normalized['modules'])) {
                $mods = array_values(array_unique(array_map('strval', $normalized['modules'])));
                sort($mods);
                $normalized['modules'] = $mods;
            }
            if (!isset($normalized['source']) || (string) $normalized['source'] === '') {
                $normalized['source'] = 'web';
            }
        }

        return (string) json_encode($normalized, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    private function sortKeysRecursive($value)
    {
        if (!is_array($value)) {
            return $value;
        }

        $isAssoc = array_keys($value) !== range(0, count($value) - 1);
        if ($isAssoc) {
            ksort($value);
        }

        foreach ($value as $k => $v) {
            $value[$k] = $this->sortKeysRecursive($v);
        }

        return $value;
    }

    // Listar todos los reportes
    public function index(Request $request)
    {
        $query = Reporte::query();
        return ApiPagination::respond($request, $query, function ($r) {
            if (empty($r->id_reporte)) {
                $rawId = $r->getAttribute('_id');
                $r->id_reporte = is_object($rawId) ? (string) $rawId : ($rawId ?? null);
            }
            return $r;
        });
    }

    // Guardar un nuevo reporte
    public function store(Request $request)
    {
        $request->validate([
            'tipo_reporte' => 'required|string|max:100',
            'fecha_generacion' => 'nullable|date',
            'parametros_utilizados' => 'nullable',
            'id_usuario' => 'nullable|string',
        ]);

        if ($request->filled('id_usuario')) {
            $resolvedUsuario = BusinessId::resolve(Usuario::class, 'id_persona', $request->input('id_usuario'));
            if (!$resolvedUsuario) {
                return response()->json(['errors' => ['id_usuario' => ['Usuario inválido. Envíe id_persona o _id válido.']]], 400);
            }
            $request->merge(['id_usuario' => $resolvedUsuario]);
        }

        $payload = $request->only(['tipo_reporte','fecha_generacion','id_usuario']);
        $payload['parametros_utilizados'] = $this->normalizeParametrosUtilizados($request->input('parametros_utilizados'));
        if (empty($payload['fecha_generacion'])) {
            $payload['fecha_generacion'] = now();
        }
        if (empty($payload['id_reporte'])) {
            $payload['id_reporte'] = 'REP-' . \Illuminate\Support\Str::upper(\Illuminate\Support\Str::random(6));
        }
        $reporte = Reporte::create($payload);
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Reporte generado',
            'Se ha generado un nuevo reporte de tipo: ' . $reporte->tipo_reporte,
            $email_usuario,
            $reporte->id_reporte ?? null,
            'reportes'
        );
        return response()->json($reporte, 201);
    }

    // Mostrar un reporte específico
    public function show($id)
    {
        $reporte = Reporte::where('id_reporte', $id)->first();
        if (!$reporte) {
            $reporte = Reporte::where('_id', $id)->firstOrFail();
        }
        return response()->json($reporte);
    }

    // Actualizar un reporte
    public function update(Request $request, $id)
    {
        $reporte = Reporte::where('id_reporte', $id)->first();
        if (!$reporte) {
            $reporte = Reporte::where('_id', $id)->firstOrFail();
        }

        $request->validate([
            'tipo_reporte' => 'required|string|max:100',
            'fecha_generacion' => 'nullable|date',
            'parametros_utilizados' => 'nullable',
            'id_usuario' => 'nullable|string',
        ]);

        if ($request->filled('id_usuario')) {
            $resolvedUsuario = BusinessId::resolve(Usuario::class, 'id_persona', $request->input('id_usuario'));
            if (!$resolvedUsuario) {
                return response()->json(['errors' => ['id_usuario' => ['Usuario inválido. Envíe id_persona o _id válido.']]], 400);
            }
            $request->merge(['id_usuario' => $resolvedUsuario]);
        }

        $updatePayload = $request->only(['tipo_reporte','fecha_generacion','id_usuario']);
        $updatePayload['parametros_utilizados'] = $this->normalizeParametrosUtilizados($request->input('parametros_utilizados'));
        $reporte->update($updatePayload);
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Reporte actualizado',
            'Se ha actualizado el reporte de tipo: ' . $reporte->tipo_reporte,
            $email_usuario,
            $reporte->id_reporte ?? null,
            'reportes'
        );
        return response()->json($reporte);
    }

    // Eliminar un reporte
    public function destroy($id)
    {
        $reporte = Reporte::where('id_reporte', $id)->first();
        if (!$reporte) {
            $reporte = Reporte::where('_id', $id)->firstOrFail();
        }
        $reporte->delete();
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Reporte eliminado',
            'Se ha eliminado el reporte de tipo: ' . $reporte->tipo_reporte ,
            $email_usuario,
            null,
            'reportes'
        );
        return response()->json(['message' => 'Reporte eliminado']);
    }
}
