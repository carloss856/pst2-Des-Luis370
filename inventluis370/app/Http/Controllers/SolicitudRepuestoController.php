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

    public function store(Request $request)
    {
        try {
            $request->validate([
                'id_repuesto' => 'required|exists:repuestos,id_repuesto',
                'id_servicio' => 'required|exists:servicios,id_servicio',
                'cantidad_solicitada' => 'required|integer|min:1',
                'id_usuario' => 'required|exists:usuario,id_persona',
                'estado_solicitud' => 'required|in:Pendiente,Aprobada,Rechazada',
                'comentarios' => 'nullable|string',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 400);
        }

        $repuesto = Repuesto::findOrFail($request->id_repuesto);

        // Validamos que haya stock solo si está Aprobada
        if ($request->estado_solicitud === 'Aprobada' && $repuesto->cantidad_disponible < $request->cantidad_solicitada) {
            return response()->json(['error' => 'No hay suficiente stock'], 400);
        }

        // Crear la solicitud
        $solicitud = SolicitudRepuesto::create($request->all());

        // Solo restamos del inventario si la solicitud fue aprobada
        if ($request->estado_solicitud === 'Aprobada') {
            $repuesto->cantidad_disponible -= $request->cantidad_solicitada;
            $repuesto->save();
        }

        // Notificación
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }

        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Solicitud de repuesto creada',
            'Se ha creado una solicitud de repuesto para el repuesto ID: ' . $solicitud->id_repuesto .
                ', cantidad: ' . $solicitud->cantidad_solicitada . ' (' . $solicitud->estado_solicitud . ')',
            $email_usuario,
            $solicitud->id_servicio ?? null
        );

        return response()->json($solicitud, 201);
    }

    // Mostrar una solicitud específica
    public function show($id)
    {
        $solicitud = SolicitudRepuesto::findOrFail($id);
        return response()->json($solicitud);
    }

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

    $repuesto = Repuesto::findOrFail($request->id_repuesto);

    $cantidadAnterior = $solicitud->cantidad_solicitada;
    $cantidadNueva = (int) $request->cantidad_solicitada;

    if ($request->estado_solicitud === 'Aprobada') {

        if ($solicitud->estado_solicitud !== 'Aprobada') {
            if ($repuesto->cantidad_disponible < $cantidadNueva) {
                return response()->json(['error' => 'No hay suficiente stock disponible'], 400);
            }
            $repuesto->cantidad_disponible -= $cantidadNueva;
        } else {
            if ($cantidadNueva > $cantidadAnterior) {
                $diferencia = $cantidadNueva - $cantidadAnterior;
                if ($repuesto->cantidad_disponible < $diferencia) {
                    return response()->json(['error' => 'No hay suficiente stock disponible'], 400);
                }
                $repuesto->cantidad_disponible -= $diferencia;
            } elseif ($cantidadNueva < $cantidadAnterior) {
                $diferencia = $cantidadAnterior - $cantidadNueva;
                $repuesto->cantidad_disponible += $diferencia;
            }
        }

    } elseif ($request->estado_solicitud === 'Rechazada' && $solicitud->estado_solicitud === 'Aprobada') {
        $repuesto->cantidad_disponible += $cantidadAnterior;
    }

    $repuesto->save();

    $solicitud->update($request->all());

    $user = auth()->user();
    if (!$user) {
        return response()->json(['error' => 'No autenticado'], 401);
    }

    $email_usuario = $user->email;
    $this->registrarYEnviarNotificacion(
        'Solicitud de repuesto actualizada',
        'Se ha actualizado la solicitud de repuesto ID: ' . $solicitud->id .
        ' con estado: ' . $solicitud->estado_solicitud,
        $email_usuario,
        $solicitud->id_servicio ?? null
    );

    return response()->json($solicitud);
}

    public function destroy($id)
    {
        $solicitud = SolicitudRepuesto::findOrFail($id);
        $info = 'ID: ' . $solicitud->id;
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $repuesto = \App\Models\Repuesto::find($solicitud->id_repuesto);
        if ($repuesto) {
            $repuesto->cantidad_disponible += $solicitud->cantidad_solicitada;
            $repuesto->save();
        }

        $solicitud->delete();
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Solicitud de repuesto eliminada',
            'Se ha eliminado la solicitud de repuesto ' . $info,
            $email_usuario,
            $solicitud->id_servicio ?? null
        );
        return response()->json(['message' => 'Solicitud eliminada correctamente']);
    }
}
