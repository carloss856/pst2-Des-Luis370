<?php

namespace App\Http\Controllers;

use App\Models\SolicitudRepuesto;
use App\Models\Repuesto;
use Illuminate\Http\Request;
use App\Models\Notificacion;
use Illuminate\Support\Facades\Mail;
use App\Traits\NotificacionTrait;

class SolicitudRepuestoController extends Controller
{
    use NotificacionTrait;
    // Listar todas las solicitudes de repuestos
    public function index()
    {
        $solicitudes = SolicitudRepuesto::all();
        return response()->json($solicitudes);
    }

    // Guardar una nueva solicitud de repuesto
    public function store(Request $request)
    {
        try {
            $request->validate([
                'id_repuesto' => 'required|exists:repuestos,id_repuesto',
                'id_servicio' => 'required|exists:servicios,id_servicio',
                'cantidad_solicitada' => 'required|integer|min:0',
                'id_usuario' => 'required|exists:usuario,id_persona',
                'estado_solicitud' => 'required|in:Pendiente,Aprobada,Rechazada',
                'comentarios' => 'nullable|string',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 400);
        }

        $repuesto = Repuesto::findOrFail($request->id_repuesto);

        if ($repuesto->cantidad_disponible < $request->cantidad_solicitada) {
            return response()->json(['error' => 'No hay suficiente stock'], 400);
        }

        // Registrar la solicitud
        $solicitud = SolicitudRepuesto::create($request->all());

        // Restar del inventario
        $repuesto->cantidad_disponible -= $request->cantidad_solicitada;
        $repuesto->save();
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Solicitud de repuesto creada',
            'Se ha creado una solicitud de repuesto para el repuesto ID: ' . $solicitud->id_repuesto . ', cantidad: ' . $solicitud->cantidad_solicitada,
            $email_usuario,
            $solicitud->id_servicio
        );
        return response()->json($solicitud, 201);
    }

    // Mostrar una solicitud específica
    public function show($id)
    {
        $solicitud = SolicitudRepuesto::findOrFail($id);
        return response()->json($solicitud);
    }

    // Actualizar una solicitud de repuesto
    public function update(Request $request, $id)
    {
        $solicitud = SolicitudRepuesto::findOrFail($id);

        $request->validate([
            'id_repuesto' => 'required|exists:repuestos,id_repuesto',
            'id_servicio' => 'required|exists:servicios,id_servicio',
            'cantidad_solicitada' => 'required|integer|min:1',
            'id_usuario' => 'required|exists:usuario,id_persona',
            'estado_solicitud' => 'required|in:Pendiente,Aprobada,Rechazada',
            'comentarios' => 'nullable|string',
        ]);

        $solicitud->update($request->all());
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Solicitud de repuesto actualizada',
            'Se ha actualizado la solicitud de repuesto ID: ' . $solicitud->id,
            $email_usuario,
            $solicitud->id_servicio
        );
        return response()->json($solicitud);
    }

    public function destroy($id)
    {
        $solicitud = SolicitudRepuesto::findOrFail($id);
        $info = 'ID: ' . $solicitud->id;
        $solicitud->delete();
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Solicitud de repuesto eliminada',
            'Se ha eliminado la solicitud de repuesto ' . $info,
            $email_usuario,
            $solicitud->id_servicio
        );
        return response()->json(['message' => 'Solicitud eliminada']);
    }
}
