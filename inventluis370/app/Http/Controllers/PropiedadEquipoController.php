<?php

namespace App\Http\Controllers;

use App\Models\PropiedadEquipo;
use Illuminate\Http\Request;

class PropiedadEquipoController extends Controller
{
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
        return response()->json($propiedad);
    }

    // Eliminar una relación de propiedad
    public function destroy($id)
    {
        $propiedad = PropiedadEquipo::findOrFail($id);
        $propiedad->delete();
        return response()->json(['message' => 'Propiedad eliminada']);
    }
}
