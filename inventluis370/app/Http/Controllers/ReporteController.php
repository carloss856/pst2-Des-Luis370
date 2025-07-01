<?php

namespace App\Http\Controllers;

use App\Models\Reporte;
use Illuminate\Http\Request;
use App\Models\Notificacion;
use Illuminate\Support\Facades\Mail;

class ReporteController extends Controller
{
    // Listar todos los reportes
    public function index()
    {
        $reportes = Reporte::all();
        return response()->json($reportes);
    }

    // Guardar un nuevo reporte
    public function store(Request $request)
    {
        $request->validate([
            'tipo_reporte' => 'required|string|max:100',
            'fecha_generacion' => 'nullable|date',
            'parametros_utilizados' => 'nullable|string',
            'id_usuario' => 'nullable|exists:usuario,id_persona',
        ]);

        $reporte = Reporte::create($request->all());
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Reporte generado',
            'Se ha generado un nuevo reporte de tipo: ' . $reporte->tipo_reporte,
            $email_usuario,
            $reporte->id_reporte
        );
        return response()->json($reporte, 201);
    }

    // Mostrar un reporte específico
    public function show($id)
    {
        $reporte = Reporte::findOrFail($id);
        return response()->json($reporte);
    }

    // Actualizar un reporte
    public function update(Request $request, $id)
    {
        $reporte = Reporte::findOrFail($id);

        $request->validate([
            'tipo_reporte' => 'required|string|max:100',
            'fecha_generacion' => 'nullable|date',
            'parametros_utilizados' => 'nullable|string',
            'id_usuario' => 'nullable|exists:usuario,id_persona',
        ]);

        $reporte->update($request->all());
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Reporte actualizado',
            'Se ha actualizado el reporte de tipo: ' . $reporte->tipo_reporte,
            $email_usuario,
            $reporte->id_reporte
        );
        return response()->json($reporte);
    }

    // Eliminar un reporte
    public function destroy($id)
    {
        $reporte = Reporte::findOrFail($id);
        $reporte->delete();
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Reporte eliminado',
            'Se ha eliminado el reporte de tipo: ' . $reporte->tipo_reporte ,
            $email_usuario,
            $reporte->id_servicio
        );
        return response()->json(['message' => 'Reporte eliminado']);
    }
    private function registrarYEnviarNotificacion($asunto, $mensaje, $email_usuario, $id_servicio)
    {
        // Registrar solo para el usuario que hizo la acción
        Notificacion::create([
            'id_servicio' => $id_servicio,
            'email_destinatario' => $email_usuario,
            'asunto' => $asunto,
            'mensaje' => $mensaje,
            'fecha_envio' => now(),
            'estado_envio' => 'Enviado',
        ]);

        // Enviar correo tanto al usuario como a info@midominio.com
        $destinatarios = [$email_usuario, 'info@midominio.com'];
        Mail::raw($mensaje, function ($mail) use ($destinatarios, $asunto) {
            $mail->to($destinatarios)
                ->subject($asunto);
        });
    }
}
