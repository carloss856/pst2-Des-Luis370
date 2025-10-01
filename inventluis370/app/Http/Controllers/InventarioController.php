<?php

namespace App\Http\Controllers;

use App\Models\Inventario;
use Illuminate\Http\Request;
use App\Models\Notificacion;
use Illuminate\Support\Facades\Mail;
use App\Traits\NotificacionTrait;

class InventarioController extends Controller
{
    use NotificacionTrait;
    // Listar todo el inventario
    public function index()
    {
        $inventario = Inventario::all();
        return response()->json($inventario);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_repuesto' => 'required|exists:repuestos,id_repuesto',
            'cantidad_entrada' => 'required|integer|min:1',
            'fecha_entrada' => 'nullable|date',
        ]);

        $registro = Inventario::create([
            'id_repuesto' => $request->id_repuesto,
            'cantidad_entrada' => $request->cantidad_entrada,
            'fecha_entrada' => $request->fecha_entrada ?? now(),
        ]);

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
            'cantidad_entrada' => 'required|integer|min:0',
            'fecha_entrada' => 'nullable|date',
        ]);

        $registro->update($request->all());

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
            null
        );
        $registro->delete();
        return response()->json(['message' => 'Registro de inventario eliminado']);
    }
}
