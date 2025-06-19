<?php

namespace App\Http\Controllers;

use App\Models\Repuesto;
use Illuminate\Http\Request;

class RepuestoController extends Controller
{
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
        ]);

        $repuesto = Repuesto::create($request->all());
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
        ]);

        $repuesto->update($request->all());
        return response()->json($repuesto);
    }

    // Eliminar un repuesto
    public function destroy($id)
    {
        $repuesto = Repuesto::findOrFail($id);
        $repuesto->delete();
        return response()->json(['message' => 'Repuesto eliminado']);
    }
}
