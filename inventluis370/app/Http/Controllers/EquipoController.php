<?php

namespace App\Http\Controllers;

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
        return response()->json($equipo);
    }

    // Eliminar un equipo
    public function destroy($id)
    {
        $equipo = Equipo::findOrFail($id);
        $equipo->delete();
        return response()->json(['message' => 'Equipo eliminado']);
    }
}
