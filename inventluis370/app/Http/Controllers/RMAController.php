<?php

namespace App\Http\Controllers;

use App\Models\Rma;
use Illuminate\Http\Request;

class RMAController extends Controller
{
    // Listar todos los RMA
    public function index()
    {
        return response()->json(Rma::all());
    }

    // Crear un nuevo RMA
    public function store(Request $request)
    {
        $request->validate([
            'codigo_rma' => 'required|string|unique:rma,codigo_rma',
            'id_persona' => 'required|exists:usuario,id_persona',
            'fecha_creacion' => 'required|date',
        ]);

        $rma = Rma::create($request->all());
        return response()->json($rma, 201);
    }

    // Mostrar un RMA específico
    public function show($id)
    {
        $rma = Rma::findOrFail($id);
        return response()->json($rma);
    }

    // Actualizar un RMA
    public function update(Request $request, $id)
    {
        $rma = Rma::findOrFail($id);

        $request->validate([
            'codigo_rma' => 'sometimes|required|string|unique:rma,codigo_rma,' . $id . ',id_rma',
            'id_persona' => 'sometimes|required|exists:usuario,id_persona',
            'fecha_creacion' => 'sometimes|required|date',
        ]);

        $rma->update($request->all());
        return response()->json($rma);
    }

    // Eliminar un RMA
    public function destroy($id)
    {
        $rma = Rma::findOrFail($id);
        $rma->delete();
        return response()->json(['message' => 'RMA eliminado']);
    }
}
