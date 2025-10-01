<?php

namespace App\Http\Controllers;

use App\Models\AutenticacionUsuario;
use App\Models\Notificacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Traits\NotificacionTrait;

class AutenticacionUsuarioController extends Controller
{
    use NotificacionTrait;
    
    // Listar todos los registros de autenticación
    public function index()
    {
        $usuarios = AutenticacionUsuario::all();
        return response()->json($usuarios);
    }

    // Guardar un nuevo registro de autenticación
    public function store(Request $request)
    {
        $request->validate([
            'codigo_usuario' => 'required|string|max:50|unique:autenticacion_usuarios,codigo_usuario',
            'email' => 'required|email|unique:autenticacion_usuarios,email',
            'contrasena' => 'required|string|min:6',
            'intentos_fallidos' => 'nullable|integer|min:0',
            'estado' => 'nullable|in:Activo,Bloqueado',
            'token_recuperacion' => 'nullable|string|max:255',
        ]);

        $usuario = AutenticacionUsuario::create($request->all());
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Nuevo usuario autenticado',
            'Se ha creado el usuario: ' . $usuario->codigo_usuario,
            $email_usuario,
            $usuario->id_servicio ?? null
        );
        return response()->json($usuario, 201);
    }

    // Mostrar un registro específico
    public function show($id)
    {
        $usuario = AutenticacionUsuario::findOrFail($id);
        return response()->json($usuario);
    }

    // Actualizar un registro de autenticación
    public function update(Request $request, $id)
    {
        $usuario = AutenticacionUsuario::findOrFail($id);

        $request->validate([
            'codigo_usuario' => 'required|string|max:50|unique:autenticacion_usuarios,codigo_usuario,' . $id . ',id_usuario',
            'email' => 'required|email|unique:autenticacion_usuarios,email,' . $id . ',id_usuario',
            'contrasena' => 'nullable|string|min:6',
            'intentos_fallidos' => 'nullable|integer|min:0',
            'estado' => 'nullable|in:Activo,Bloqueado',
            'token_recuperacion' => 'nullable|string|max:255',
        ]);
        $usuario->update($request->all());
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Actualización de usuario con éxito',
            'Se ha actualizado el usuario: ' . $usuario->codigo_usuario,
            $email_usuario,
            $usuario->id_servicio ?? null
        );
        return response()->json($usuario);
    }

    // Eliminar un registro de autenticación
    public function destroy($id)
    {
        $usuario = AutenticacionUsuario::findOrFail($id);
        $usuario->delete();
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Eliminación de usuario con éxito',
            'Se ha eliminado el usuario: ' . $usuario->codigo_usuario,
            $email_usuario,
            $usuario->id_servicio ?? null
        );
        return response()->json(['message' => 'Registro eliminado']);
    }
    
}
