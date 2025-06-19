<?php

namespace App\Http\Controllers;

use App\Models\Servicio;
use Illuminate\Http\Request;

class ServicioController extends Controller
{
    // Listar todos los servicios
    public function index()
    {
        $servicios = Servicio::all();
        return response()->json($servicios);
    }

    // Guardar un nuevo servicio
    public function store(Request $request)
    {
        $request->validate([
            'id_equipo' => 'required|exists:equipos,id_equipo',
            'codigo_rma' => 'required|string|max:20|unique:servicios,codigo_rma',
            'fecha_ingreso' => 'required|date',
            'problema_reportado' => 'required|string',
            'estado' => 'required|in:Pendiente,En proceso,Finalizado',
            'costo_estimado' => 'nullable|numeric',
            'costo_real' => 'nullable|numeric',
            'validado_por_gerente' => 'boolean',
        ]);

        $servicio = Servicio::create($request->all());
        return response()->json($servicio, 201);
    }

    // Mostrar un servicio específico
    public function show($id)
    {
        $servicio = Servicio::findOrFail($id);
        return response()->json($servicio);
    }

    // Actualizar un servicio
    public function update(Request $request, $id)
    {
        $servicio = Servicio::findOrFail($id);

        $request->validate([
            'id_equipo' => 'required|exists:equipos,id_equipo',
            'codigo_rma' => 'required|string|max:20|unique:servicios,codigo_rma,' . $id . ',id_servicio',
            'fecha_ingreso' => 'required|date',
            'problema_reportado' => 'required|string',
            'estado' => 'required|in:Pendiente,En proceso,Finalizado',
            'costo_estimado' => 'nullable|numeric',
            'costo_real' => 'nullable|numeric',
            'validado_por_gerente' => 'boolean',
        ]);

        $servicio->update($request->all());
        return response()->json($servicio);
    }

    // Eliminar un servicio
    public function destroy($id)
    {
        $servicio = Servicio::findOrFail($id);
        $servicio->delete();
        return response()->json(['message' => 'Servicio eliminado']);
    }
}
