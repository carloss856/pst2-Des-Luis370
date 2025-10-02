<?php

namespace App\Http\Controllers;

use App\Models\Notificacion;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use App\Models\Equipo;
use App\Models\PropiedadEquipo;
use Illuminate\Http\Request;
use App\Traits\NotificacionTrait;

class EquipoController extends Controller
{
    use NotificacionTrait;
    // Listar todos los equipos
    public function index()
    {
        $equipos = Equipo::with(['propiedad.usuario'])->get();
        return response()->json($equipos);
    }

    // Guardar un nuevo equipo
    public function store(Request $request)
    {
        $request->validate([
            'tipo_equipo' => 'required|string|max:50',
            'marca' => 'nullable|string|max:50',
            'modelo' => 'nullable|string|max:50',
            'id_persona' => 'required|exists:usuario,id_persona', // quien crea
            'id_asignado' => 'required|exists:usuario,id_persona', // a quien se asigna
        ]);

        // 1. Crear equipo con el usuario que lo crea
        $equipo = Equipo::create([
            'tipo_equipo' => $request->tipo_equipo,
            'marca' => $request->marca,
            'modelo' => $request->modelo,
            'id_persona' => $request->id_persona,
        ]);

        \App\Models\PropiedadEquipo::create([
            'id_equipo' => $equipo->id_equipo,
            'id_persona' => $request->id_asignado,
        ]);

        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Equipo creado',
            'Se ha creado el equipo: ' . $equipo->tipo_equipo . ' ' . $equipo->marca . ' ' . $equipo->modelo,
            $email_usuario,
            $equipo->id_servicio ?? null
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
            'id_asignado' => 'nullable|exists:usuario,id_persona',
        ]);
        
        $propiedad = PropiedadEquipo::where('id_equipo', $equipo->id_equipo)->first();

        if ($propiedad) {
            $propiedad->update(['id_persona' => $request->id_asignado]);
        } else {
            PropiedadEquipo::create([
                'id_equipo' => $equipo->id_equipo,
                'id_persona' => $request->id_asignado,
            ]);
        }
        
        $equipo->update($request->only(['tipo_equipo', 'marca', 'modelo']));
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Equipo actualizado',
            'Se ha actualizado el equipo: ' . $equipo->tipo_equipo . ' ' . $equipo->marca . ' ' . $equipo->modelo,
            $email_usuario,
            $equipo->id_servicio ?? null
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
            $equipo->id_servicio ?? null
        );
        return response()->json(['message' => 'Equipo eliminado']);
    }
}
