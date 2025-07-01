<?php

namespace App\Http\Controllers;

use App\Models\Servicio;
use Illuminate\Http\Request;
use App\Models\Notificacion;
use Illuminate\Support\Facades\Mail;

class ServicioController extends Controller
{
    // Listar todos los servicios
    public function index()
    {
        $servicios = Servicio::all();
        return response()->json($servicios);
    }

    // Guardar un nuevo servicio
    public function store(Request $request)
    {
        $request->validate([
            'id_equipo' => 'required|exists:equipos,id_equipo',
            'codigo_rma' => 'required|string|max:20|unique:servicios,codigo_rma',
            'fecha_ingreso' => 'required|date',
            'problema_reportado' => 'required|string',
            'estado' => 'required|in:Pendiente,En proceso,Finalizado',
            'costo_estimado' => 'nullable|numeric',
            'costo_real' => 'nullable|numeric',
            'validado_por_gerente' => 'boolean',
        ]);

        $servicio = Servicio::create($request->all());
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Servicio creado',
            'Se ha creado el servicio con código RMA: ' . $servicio->codigo_rma,
            $email_usuario,
            $servicio->id_servicio
        );
        return response()->json($servicio, 201);
    }

    // Mostrar un servicio específico
    public function show($id)
    {
        $servicio = Servicio::findOrFail($id);
        return response()->json($servicio);
    }

    // Actualizar un servicio
    public function update(Request $request, $id)
    {
        $servicio = Servicio::findOrFail($id);

        $request->validate([
            'id_equipo' => 'required|exists:equipos,id_equipo',
            'codigo_rma' => 'required|string|max:20|unique:servicios,codigo_rma,' . $id . ',id_servicio',
            'fecha_ingreso' => 'required|date',
            'problema_reportado' => 'required|string',
            'estado' => 'required|in:Pendiente,En proceso,Finalizado',
            'costo_estimado' => 'nullable|numeric',
            'costo_real' => 'nullable|numeric',
            'validado_por_gerente' => 'boolean',
        ]);

        $servicio->update($request->all());
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Servicio actualizado',
            'Se ha actualizado el servicio con código RMA: ' . $servicio->codigo_rma,
            $email_usuario,
            $servicio->id_servicio
        );
        return response()->json($servicio);
    }

    // Eliminar un servicio
    public function destroy($id)
    {
        $servicio = Servicio::findOrFail($id);
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Servicio eliminado',
            'Se ha eliminado el servicio con código RMA: ' . $servicio->codigo_rma,
            $email_usuario,
            $servicio->id_servicio
        );
        $servicio->delete();
        return response()->json(['message' => 'Servicio eliminado']);
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
