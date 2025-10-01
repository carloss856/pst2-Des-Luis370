<?php

namespace App\Http\Controllers;

use App\Models\Notificacion;
use Illuminate\Support\Facades\Mail;
use App\Models\PropiedadEquipo;
use Illuminate\Http\Request;
use App\Traits\NotificacionTrait;

class PropiedadEquipoController extends Controller
{
    use NotificacionTrait;
    // Listar todas las relaciones de propiedad
    public function index()
    {
        $propiedades = PropiedadEquipo::all();
        return response()->json($propiedades);
    }

    // Guardar una nueva relación de propiedad
    public function store(Request $request)
    {
        $request->validate([
            'id_equipo' => 'required|exists:equipos,id_equipo',
            'id_persona' => 'required|exists:usuario,id_persona',
        ]);

        $propiedad = PropiedadEquipo::create($request->all());
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Propiedad de equipo asignada',
            'Se ha asignado el equipo ID: ' . $propiedad->id_equipo . ' a la persona ID: ' . $propiedad->id_persona,
            $email_usuario,
            $propiedad->id_servicio ?? null
        );
        return response()->json($propiedad, 201);
    }

    // Mostrar una relación específica
    public function show($id)
    {
        $propiedad = PropiedadEquipo::findOrFail($id);
        return response()->json($propiedad);
    }

    // Actualizar una relación de propiedad
    public function update(Request $request, $id)
    {
        $propiedad = PropiedadEquipo::findOrFail($id);

        $request->validate([
            'id_equipo' => 'required|exists:equipos,id_equipo',
            'id_persona' => 'required|exists:usuario,id_persona',
        ]);

        $propiedad->update($request->all());
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Propiedad de equipo actualizada',
            'Se ha actualizado la propiedad del equipo ID: ' . $propiedad->id_equipo . ' para la persona ID: ' . $propiedad->id_persona,
            $email_usuario,
            $propiedad->id_servicio ?? null
        );
        return response()->json($propiedad);
    }

    // Eliminar una relación de propiedad
    public function destroy($id)
    {
        $propiedad = PropiedadEquipo::findOrFail($id);
        $propiedad->delete();
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Propiedad de equipo eliminada',
            'Se ha eliminado la relación de propiedad del equipo ID: ' . $propiedad->id_equipo . ' para la persona ID: ' . $propiedad->id_persona,
            $email_usuario,
            $propiedad->id_servicio ?? null
        );
        return response()->json(['message' => 'Propiedad eliminada']);
    }
    public function showByEquipo($id_equipo)
    {
        return PropiedadEquipo::where('id_equipo', $id_equipo)->first();
    }
}
