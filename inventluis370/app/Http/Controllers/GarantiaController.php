<?php

namespace App\Http\Controllers;

use App\Models\Garantia;
use Illuminate\Http\Request;
use App\Traits\NotificacionTrait;
use App\Support\ApiPagination;
use App\Support\BusinessId;
use App\Models\Servicio;
use Illuminate\Support\Facades\Auth;

class GarantiaController extends Controller
{
    use NotificacionTrait;
    // Listar todas las garantías
    public function index(Request $request)
    {
        $query = Garantia::query();
        return ApiPagination::respond($request, $query, function ($g) {
            if (empty($g->id_garantia)) {
                $rawId = $g->getAttribute('_id');
                $g->id_garantia = is_object($rawId) ? (string) $rawId : ($rawId ?? null);
            }
            return $g;
        });
    }

    // Guardar una nueva garantía
    public function store(Request $request)
    {
        $request->validate([
            'id_servicio' => 'required|string',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
            'observaciones' => 'nullable|string',
            'validado_por_gerente' => 'boolean',
        ]);

        $resolvedServicio = BusinessId::resolve(Servicio::class, 'id_servicio', $request->input('id_servicio'));
        if (!$resolvedServicio) {
            return response()->json(['errors' => ['id_servicio' => ['Servicio inválido. Envíe id_servicio o _id válido.']]], 400);
        }
        $request->merge(['id_servicio' => $resolvedServicio]);

        $payload = $request->only(['id_servicio','fecha_inicio','fecha_fin','observaciones','validado_por_gerente']);
        if (empty($payload['id_garantia'])) {
            $payload['id_garantia'] = 'GAR-' . \Illuminate\Support\Str::upper(\Illuminate\Support\Str::random(6));
        }
        $garantia = Garantia::create($payload);
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Garantía creada',
            'Se ha creado una garantía para el servicio ID: ' . $garantia->id_servicio,
            $email_usuario,
            $garantia->id_servicio ?? null,
            'garantias'
        );
        return response()->json($garantia, 201);
    }

    // Mostrar una garantía específica
    public function show($id)
    {
        $garantia = Garantia::where('id_garantia', $id)->first();
        if (!$garantia) {
            $garantia = Garantia::where('_id', $id)->firstOrFail();
        }
        return response()->json($garantia);
    }

    // Actualizar una garantía
    public function update(Request $request, $id)
    {
        $garantia = Garantia::where('id_garantia', $id)->first();
        if (!$garantia) {
            $garantia = Garantia::where('_id', $id)->firstOrFail();
        }

        $request->validate([
            'id_servicio' => 'required|string',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
            'observaciones' => 'nullable|string',
            'validado_por_gerente' => 'boolean',
        ]);

        $resolvedServicio = BusinessId::resolve(Servicio::class, 'id_servicio', $request->input('id_servicio'));
        if (!$resolvedServicio) {
            return response()->json(['errors' => ['id_servicio' => ['Servicio inválido. Envíe id_servicio o _id válido.']]], 400);
        }
        $request->merge(['id_servicio' => $resolvedServicio]);

        $garantia->update($request->only(['id_servicio','fecha_inicio','fecha_fin','observaciones','validado_por_gerente']));
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Garantía actualizada',
            'Se ha actualizado la garantía para el servicio ID: ' . $garantia->id_servicio,
            $email_usuario,
            $garantia->id_servicio ?? null,
            'garantias'
        );
        return response()->json($garantia);
    }

    // Eliminar una garantía
    public function destroy($id)
    {
        $garantia = Garantia::where('id_garantia', $id)->first();
        if (!$garantia) {
            $garantia = Garantia::where('_id', $id)->firstOrFail();
        }
        $garantia->delete();
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Garantía eliminada',
            'Se ha eliminado la garantía para el servicio ID: ' . $garantia->id_servicio,
            $email_usuario,
            $garantia->id_servicio ?? null,
            'garantias'
        );
        return response()->json(['message' => 'Garantía eliminada']);
    }
}
