<?php

namespace App\Http\Controllers;

use App\Models\Notificacion;
use Illuminate\Http\Request;

class NotificacionController extends Controller
{
    // Listar todas las notificaciones
    public function index()
    {
        $notificaciones = Notificacion::all();
        return response()->json($notificaciones);
    }

    // Guardar una nueva notificación
    public function store(Request $request)
    {
        $request->validate([
            'id_servicio' => 'required|exists:servicios,id_servicio',
            'email_destinatario' => 'required|email|max:100',
            'asunto' => 'required|string|max:150',
            'mensaje' => 'required|string',
            'estado_envio' => 'required|in:Enviado,Pendiente,Fallido',
        ]);

        $notificacion = Notificacion::create($request->all());
        return response()->json($notificacion, 201);
    }

    // Mostrar una notificación específica
    public function show($id)
    {
        $notificacion = Notificacion::findOrFail($id);
        return response()->json($notificacion);
    }

    // Actualizar una notificación
    public function update(Request $request, $id)
    {
        $notificacion = Notificacion::findOrFail($id);

        $request->validate([
            'id_servicio' => 'required|exists:servicios,id_servicio',
            'email_destinatario' => 'required|email|max:100',
            'asunto' => 'required|string|max:150',
            'mensaje' => 'required|string',
            'estado_envio' => 'required|in:Enviado,Pendiente,Fallido',
        ]);

        $notificacion->update($request->all());
        return response()->json($notificacion);
    }

    // Eliminar una notificación
    public function destroy($id)
    {
        $notificacion = Notificacion::findOrFail($id);
        $notificacion->delete();
        return response()->json(['message' => 'Notificación eliminada']);
    }
}
