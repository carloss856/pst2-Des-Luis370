<?php

namespace App\Http\Controllers;

use App\Models\Garantia;
use Illuminate\Http\Request;
use App\Traits\NotificacionTrait;

class GarantiaController extends Controller
{
    use NotificacionTrait;
    // Listar todas las garantías
    public function index()
    {
        $garantias = Garantia::all();
        return response()->json($garantias);
    }

    // Guardar una nueva garantía
    public function store(Request $request)
    {
        $request->validate([
            'id_servicio' => 'required|exists:servicios,id_servicio',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
            'observaciones' => 'nullable|string',
            'validado_por_gerente' => 'boolean',
        ]);

        $garantia = Garantia::create($request->all());
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Garantía creada',
            'Se ha creado una garantía para el servicio ID: ' . $garantia->id_servicio,
            $email_usuario,
            $garantia->id_servicio ?? null
        );
        return response()->json($garantia, 201);
    }

    // Mostrar una garantía específica
    public function show($id)
    {
        $garantia = Garantia::find($id);
        if (!$garantia) {
            return response()->json(['message' => 'No encontrada'], 404);
        }
        return response()->json($garantia);
    }

    // Actualizar una garantía
    public function update(Request $request, $id)
    {
        $garantia = Garantia::findOrFail($id);

        $request->validate([
            'id_servicio' => 'required|exists:servicios,id_servicio',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
            'observaciones' => 'nullable|string',
            'validado_por_gerente' => 'boolean',
        ]);

        $garantia->update($request->all());
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Garantía actualizada',
            'Se ha actualizado la garantía para el servicio ID: ' . $garantia->id_servicio,
            $email_usuario,
            $garantia->id_servicio ?? null
        );
        return response()->json($garantia);
    }

    // Eliminar una garantía
    public function destroy($id)
    {
        $garantia = Garantia::findOrFail($id);
        $garantia->delete();
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Garantía eliminada',
            'Se ha eliminado la garantía para el servicio ID: ' . $garantia->id_servicio,
            $email_usuario,
            $garantia->id_servicio ?? null
        );
        return response()->json(['message' => 'Garantía eliminada']);
    }
}
