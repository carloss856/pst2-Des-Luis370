<?php

namespace App\Http\Controllers;

use App\Models\Servicio;
use Illuminate\Http\Request;
use App\Models\Notificacion;
use Illuminate\Support\Facades\Mail;
use App\Traits\NotificacionTrait;
use Carbon\Carbon;

class ServicioController extends Controller
{
    use NotificacionTrait;
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
            'codigo_rma' => 'required|string|max:20',
            'fecha_ingreso' => 'required|date',
            'problema_reportado' => 'required|string',
            'estado' => 'required|in:Pendiente,En proceso,Finalizado',
            'costo_estimado' => 'nullable|numeric',
            'costo_real' => 'nullable|numeric',
            'validado_por_gerente' => 'boolean',
        ]);

        $servicio = Servicio::create($request->all());

        $fechaInicio = Carbon::parse($servicio->fecha_ingreso);
        $fechaFin = $fechaInicio->copy()->addDays(90);

        $garantia = \App\Models\Garantia::create([
            'id_servicio' => $servicio->id_servicio,
            'fecha_inicio' => $fechaInicio,
            'fecha_fin' => $fechaFin,
            'observaciones' => null,
            'validado_por_gerente' => false,
        ]);
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Servicio creado',
            'Se ha creado el servicio con código RMA: ' . $servicio->codigo_rma,
            $email_usuario,
            $servicio->id_servicio ?? null
        );
        return response()->json([
            'servicio' => $servicio,
            'garantia' => $garantia,
            'id_servicio' => $servicio->id_servicio,
            'fecha_creacion' => $servicio->fecha_ingreso,
        ], 201);
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
            'codigo_rma' => 'required|string|max:20',
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
            $servicio->id_servicio ?? null
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
}
