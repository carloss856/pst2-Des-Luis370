<?php

namespace App\Http\Controllers;

use App\Models\Inventario;
use Illuminate\Http\Request;
use App\Models\Notificacion;
use Illuminate\Support\Facades\Mail;

class InventarioController extends Controller
{
    // Listar todo el inventario
    public function index()
    {
        $inventario = Inventario::all();
        return response()->json($inventario);
    }

    // Guardar un nuevo registro de inventario
    public function store(Request $request)
    {
        $request->validate([
            'id_repuesto' => 'required|exists:repuestos,id_repuesto|unique:inventario,id_repuesto',
            'cantidad_disponible' => 'required|integer|min:0',
            'nivel_critico' => 'required|integer|min:0',
            'ultima_actualizacion' => 'nullable|date',
        ]);

        $registro = Inventario::create($request->all());
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Inventario creado',
            'Se ha creado un registro de inventario para el repuesto ID: ' . $registro->id_repuesto,
            $email_usuario,
        );
        return response()->json($registro, 201);
    }

    // Mostrar un registro específico de inventario
    public function show($id)
    {
        $registro = Inventario::findOrFail($id);
        return response()->json($registro);
    }

    // Actualizar un registro de inventario
    public function update(Request $request, $id)
    {
        $registro = Inventario::findOrFail($id);

        $request->validate([
            'cantidad_disponible' => 'required|integer|min:0',
            'nivel_critico' => 'required|integer|min:0',
            'ultima_actualizacion' => 'nullable|date',
        ]);

        $registro->update($request->all());

        // Verifica nivel crítico y envía notificación si corresponde
        if ($registro->cantidad_disponible < $registro->nivel_critico) {
            $user = auth()->user();
            if ($user) {
                $email_usuario = $user->email;
                $this->registrarYEnviarNotificacion(
                    'Stock crítico',
                    'El repuesto ID: ' . $registro->id_repuesto . ' está por debajo del nivel crítico.',
                    $email_usuario,
                );
            }
        }

        return response()->json($registro);
    }

    // Eliminar un registro de inventario
    public function destroy($id)
    {
        $registro = Inventario::findOrFail($id);
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Inventario eliminado',
            'Se ha eliminado el registro de inventario para el repuesto ID: ' . $registro->id_repuesto,
            $email_usuario,
        );
        $registro->delete();
        return response()->json(['message' => 'Registro de inventario eliminado']);
    }
    private function registrarYEnviarNotificacion($asunto, $mensaje, $email_usuario, $id_servicio = Null)
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
