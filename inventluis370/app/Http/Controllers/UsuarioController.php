<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Hash;
use App\Models\Usuario;
use Illuminate\Http\Request;

class UsuarioController extends Controller
{
    // Listar todos los usuarios
    public function index()
    {
        $usuarios = Usuario::all();
        return response()->json($usuarios);
    }

    // Guardar un nuevo usuario
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:100',
            'email' => 'required|email|unique:usuario,email',
            'telefono' => 'nullable|string|max:15',
            'tipo' => 'required|in:Administrador,Técnico,Gerente,Cliente,Empresa',
            'contrasena' => 'required|string|min:6',
            'id_empresa' => 'nullable|exists:empresas,id_empresa',
            'validado_por_gerente' => 'boolean',
        ]);

        $data = $request->all();
        $data['contrasena'] = Hash::make($data['contrasena']);

        $usuario = Usuario::create($data);
        return response()->json($usuario, 201);
    }

    // Mostrar un usuario específico
    public function show($id)
    {
        $usuario = Usuario::findOrFail($id);
        return response()->json($usuario);
    }

    // Actualizar un usuario
    public function update(Request $request, $id)
    {
        $usuario = Usuario::findOrFail($id);

        $request->validate([
            'nombre' => 'required|string|max:100',
            'email' => 'required|email|unique:usuario,email,' . $id . ',id_persona',
            'telefono' => 'nullable|string|max:15',
            'tipo' => 'required|in:Administrador,Técnico,Gerente,Cliente,Empresa',
            'contrasena' => 'nullable|string|min:6',
            'id_empresa' => 'nullable|exists:empresas,id_empresa',
            'validado_por_gerente' => 'boolean',
        ]);

        $data = $request->all();
        if (!empty($data['contrasena'])) {
            $data['contrasena'] = Hash::make($data['contrasena']);
        } else {
            unset($data['contrasena']);
        }

        $usuario->update($data);
        return response()->json($usuario);
    }

    // Eliminar un usuario
    public function destroy($id)
    {
        $usuario = Usuario::findOrFail($id);
        $usuario->delete();
        return response()->json(['message' => 'Usuario eliminado']);
    }
}
