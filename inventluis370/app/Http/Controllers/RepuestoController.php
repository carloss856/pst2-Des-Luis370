<?php

namespace App\Http\Controllers;

use App\Models\Notificacion;
use Illuminate\Support\Facades\Mail;
use App\Models\Inventario;
use App\Models\Repuesto;
use Illuminate\Http\Request;

class RepuestoController extends Controller
{
    // Listar todos los repuestos
    public function index()
    {
        $repuestos = Repuesto::all();
        return response()->json($repuestos);
    }

    // Guardar un nuevo repuesto
    public function store(Request $request)
    {
        $request->validate([
            'nombre_repuesto' => 'required|string|max:100',
            'cantidad_disponible' => 'required|integer|min:0',
            'costo_unitario' => 'nullable|numeric',
        ]);

        $repuesto = Repuesto::create($request->all());

        // Crear inventario asociado
        Inventario::create([
            'id_repuesto' => $repuesto->id_repuesto,
            'cantidad_disponible' => $repuesto->cantidad_disponible,
            'ultima_actualizacion' => now(),
        ]);
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Repuesto creado',
            'Se ha creado el repuesto: ' . $repuesto->nombre_repuesto,
            $email_usuario,
            $repuesto->id_repuesto
        );
        return response()->json($repuesto, 201);
    }

    // Mostrar un repuesto específico
    public function show($id)
    {
        $repuesto = Repuesto::findOrFail($id);
        return response()->json($repuesto);
    }

    // Actualizar un repuesto
    public function update(Request $request, $id)
    {
        $repuesto = Repuesto::findOrFail($id);

        $request->validate([
            'nombre_repuesto' => 'required|string|max:100',
            'cantidad_disponible' => 'required|integer|min:0',
            'costo_unitario' => 'nullable|numeric',
        ]);

        $repuesto->update($request->all());
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Repuesto actualizado',
            'Se ha actualizado el repuesto: ' . $repuesto->nombre_repuesto,
            $email_usuario,
            $repuesto->id_repuesto
        );
        return response()->json($repuesto);
    }

    // Eliminar un repuesto
    public function destroy($id)
    {
        $repuesto = Repuesto::findOrFail($id);
        $repuesto->delete();
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Repuesto eliminado',
            'Se ha eliminado el repuesto: ' . $repuesto->nombre_repuesto,
            $email_usuario,
            $repuesto->id_repuesto
        );
        return response()->json(['message' => 'Repuesto eliminado']);
    }
    private function registrarYEnviarNotificacion($asunto, $mensaje, $email_usuario, $id_repuesto)
    {
        // Registrar solo para el usuario que hizo la acción
        Notificacion::create([
            'id_repuesto' => $id_repuesto,
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
