<?php

namespace App\Http\Controllers;

use App\Models\Garantia;
use Illuminate\Http\Request;

class GarantiaController extends Controller
{
    // Listar todas las garantías
    public function index()
    {
        $garantias = Garantia::all();
        return response()->json($garantias);
    }

    // Guardar una nueva garantía
    public function store(Request $request)
    {
        $request->validate([
            'id_servicio' => 'required|exists:servicios,id_servicio',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
            'observaciones' => 'nullable|string',
            'validado_por_gerente' => 'boolean',
        ]);

        $garantia = Garantia::create($request->all());
        return response()->json($garantia, 201);
    }

    // Mostrar una garantía específica
    public function show($id)
    {
        $garantia = Garantia::findOrFail($id);
        return response()->json($garantia);
    }

    // Actualizar una garantía
    public function update(Request $request, $id)
    {
        $garantia = Garantia::findOrFail($id);

        $request->validate([
            'id_servicio' => 'required|exists:servicios,id_servicio',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
            'observaciones' => 'nullable|string',
            'validado_por_gerente' => 'boolean',
        ]);

        $garantia->update($request->all());
        return response()->json($garantia);
    }

    // Eliminar una garantía
    public function destroy($id)
    {
        $garantia = Garantia::findOrFail($id);
        $garantia->delete();
        return response()->json(['message' => 'Garantía eliminada']);
    }
}
