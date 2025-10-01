<?php

namespace App\Http\Controllers;

use App\Models\Notificacion;
use Illuminate\Support\Facades\Mail;
use App\Models\Inventario;
use App\Models\Repuesto;
use Illuminate\Http\Request;
use App\Traits\NotificacionTrait;

class RepuestoController extends Controller
{
    use NotificacionTrait;
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
            'nivel_critico' => 'required|integer|min:0',
        ]);

        $repuesto = Repuesto::create($request->all());

        // Crear inventario asociado
        Inventario::create([
            'nombre_repuesto' => $repuesto->nombre_repuesto,
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
            $repuesto->id_repuesto,
            $repuesto->id_servicio ?? null
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
            'nivel_critico' => 'required|integer|min:0',
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
            $repuesto->id_repuesto,
            $repuesto->id_servicio ?? null
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
            $repuesto->id_repuesto,
            $repuesto->id_servicio ?? null
        );
        return response()->json(['message' => 'Repuesto eliminado']);
    }
}
