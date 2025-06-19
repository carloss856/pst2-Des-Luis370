<?php

namespace App\Http\Controllers;

use App\Models\Empresa;
use Illuminate\Http\Request;

class EmpresaController extends Controller
{
    // Listar todas las empresas
    public function index()
    {
        $empresas = Empresa::all();
        return response()->json($empresas);
    }

    // Mostrar formulario de creación (opcional para API)
    public function create()
    {
        //
    }

    // Guardar una nueva empresa
    public function store(Request $request)
    {
        $request->validate([
            'nombre_empresa' => 'required|string|max:100',
            'direccion' => 'nullable|string',
            'telefono' => 'nullable|string|max:15',
            'email' => 'required|email|unique:empresas,email',
        ]);

        $empresa = Empresa::create($request->all());
        return response()->json($empresa, 201);
    }

    // Mostrar una empresa específica
    public function show($id)
    {
        $empresa = Empresa::findOrFail($id);
        return response()->json($empresa);
    }

    // Mostrar formulario de edición (opcional para API)
    public function edit($id)
    {
        //
    }

    // Actualizar una empresa
    public function update(Request $request, $id)
    {
        $empresa = Empresa::findOrFail($id);

        $request->validate([
            'nombre_empresa' => 'required|string|max:100',
            'direccion' => 'nullable|string',
            'telefono' => 'nullable|string|max:15',
            'email' => 'required|email|unique:empresas,email,' . $id . ',id_empresa',
        ]);

        $empresa->update($request->all());
        return response()->json($empresa);
    }

    // Eliminar una empresa
    public function destroy($id)
    {
        $empresa = Empresa::findOrFail($id);
        $empresa->delete();
        return response()->json(['message' => 'Empresa eliminada']);
    }
}
