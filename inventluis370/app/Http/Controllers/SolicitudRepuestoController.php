<?php

namespace App\Http\Controllers;

use App\Models\SolicitudRepuesto;
use Illuminate\Http\Request;

class SolicitudRepuestoController extends Controller
{
    // Listar todas las solicitudes de repuestos
    public function index()
    {
        $solicitudes = SolicitudRepuesto::all();
        return response()->json($solicitudes);
    }

    // Guardar una nueva solicitud de repuesto
    public function store(Request $request)
    {
        $request->validate([
            'id_repuesto' => 'required|exists:repuestos,id_repuesto',
            'id_servicio' => 'required|exists:servicios,id_servicio',
            'cantidad_solicitada' => 'required|integer|min:0',
            'id_usuario' => 'required|exists:usuario,id_persona',
            'estado_solicitud' => 'required|in:Pendiente,Aprobada,Rechazada',
            'comentarios' => 'nullable|string',
        ]);

        $solicitud = SolicitudRepuesto::create($request->all());
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
            'cantidad_solicitada' => 'required|integer|min:0',
            'id_usuario' => 'required|exists:usuario,id_persona',
            'estado_solicitud' => 'required|in:Pendiente,Aprobada,Rechazada',
            'comentarios' => 'nullable|string',
        ]);

        $solicitud->update($request->all());
        return response()->json($solicitud);
    }

    // Eliminar una solicitud de repuesto
    public function destroy($id)
    {
        $solicitud = SolicitudRepuesto::findOrFail($id);
        $solicitud->delete();
        return response()->json(['message' => 'Solicitud eliminada']);
    }
}
