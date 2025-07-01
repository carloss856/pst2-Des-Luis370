<?php

namespace App\Http\Controllers;

use App\Models\Notificacion;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;

use App\Models\Equipo;
use Illuminate\Http\Request;

class EquipoController extends Controller
{
    // Listar todos los equipos
    public function index()
    {
        $equipos = Equipo::all();
        return response()->json($equipos);
    }

    // Guardar un nuevo equipo
    public function store(Request $request)
    {
        $request->validate([
            'tipo_equipo' => 'required|string|max:50',
            'marca' => 'nullable|string|max:50',
            'modelo' => 'nullable|string|max:50',
            'id_persona' => 'nullable|exists:usuario,id_persona',
        ]);

        $equipo = Equipo::create($request->all());
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Equipo creado',
            'Se ha creado el equipo: ' . $equipo->tipo_equipo . ' ' . $equipo->marca . ' ' . $equipo->modelo,
            $email_usuario,
            $equipo->id_servicio
        );
        return response()->json($equipo, 201);
    }

    // Mostrar un equipo específico
    public function show($id)
    {
        $equipo = Equipo::findOrFail($id);
        return response()->json($equipo);
    }

    // Actualizar un equipo
    public function update(Request $request, $id)
    {
        $equipo = Equipo::findOrFail($id);

        $request->validate([
            'tipo_equipo' => 'required|string|max:50',
            'marca' => 'nullable|string|max:50',
            'modelo' => 'nullable|string|max:50',
            'id_persona' => 'nullable|exists:usuario,id_persona',
        ]);

        $equipo->update($request->all());
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Equipo actualizado',
            'Se ha actualizado el equipo: ' . $equipo->tipo_equipo . ' ' . $equipo->marca . ' ' . $equipo->modelo,
            $email_usuario,
            $equipo->id_servicio
        );
        return response()->json($equipo);
    }

    // Eliminar un equipo
    public function destroy($id)
    {
        $equipo = Equipo::findOrFail($id);
        $equipo->delete();
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Equipo eliminado',
            'Se ha eliminado el equipo: ' . $equipo->tipo_equipo . ' ' . $equipo->marca . ' ' . $equipo->modelo,
            $email_usuario,
            $equipo->id_servicio
        );
        return response()->json(['message' => 'Equipo eliminado']);
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
