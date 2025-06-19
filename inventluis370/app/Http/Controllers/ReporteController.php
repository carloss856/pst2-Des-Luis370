<?php

namespace App\Http\Controllers;

use App\Models\Reporte;
use Illuminate\Http\Request;

class ReporteController extends Controller
{
    // Listar todos los reportes
    public function index()
    {
        $reportes = Reporte::all();
        return response()->json($reportes);
    }

    // Guardar un nuevo reporte
    public function store(Request $request)
    {
        $request->validate([
            'tipo_reporte' => 'required|string|max:100',
            'fecha_generacion' => 'nullable|date',
            'parametros_utilizados' => 'nullable|string',
            'id_usuario' => 'nullable|exists:usuario,id_persona',
        ]);

        $reporte = Reporte::create($request->all());
        return response()->json($reporte, 201);
    }

    // Mostrar un reporte específico
    public function show($id)
    {
        $reporte = Reporte::findOrFail($id);
        return response()->json($reporte);
    }

    // Actualizar un reporte
    public function update(Request $request, $id)
    {
        $reporte = Reporte::findOrFail($id);

        $request->validate([
            'tipo_reporte' => 'required|string|max:100',
            'fecha_generacion' => 'nullable|date',
            'parametros_utilizados' => 'nullable|string',
            'id_usuario' => 'nullable|exists:usuario,id_persona',
        ]);

        $reporte->update($request->all());
        return response()->json($reporte);
    }

    // Eliminar un reporte
    public function destroy($id)
    {
        $reporte = Reporte::findOrFail($id);
        $reporte->delete();
        return response()->json(['message' => 'Reporte eliminado']);
    }
}
