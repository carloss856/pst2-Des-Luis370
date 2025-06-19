<?php

namespace App\Http\Controllers;

use App\Models\Inventario;
use Illuminate\Http\Request;

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
        return response()->json($registro);
    }

    // Eliminar un registro de inventario
    public function destroy($id)
    {
        $registro = Inventario::findOrFail($id);
        $registro->delete();
        return response()->json(['message' => 'Registro de inventario eliminado']);
    }
}
