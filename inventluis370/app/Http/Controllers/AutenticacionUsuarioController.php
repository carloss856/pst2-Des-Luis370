<?php

namespace App\Http\Controllers;

use App\Models\AutenticacionUsuario;
use App\Models\Notificacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Auth;
use App\Traits\NotificacionTrait;
use App\Support\ApiPagination;
use App\Support\Email;

class AutenticacionUsuarioController extends Controller
{
    use NotificacionTrait;
    
    // Listar todos los registros de autenticación
    public function index(Request $request)
    {
        $query = AutenticacionUsuario::query();
        return ApiPagination::respond($request, $query, function ($u) {
            if (empty($u->id_usuario)) {
                $rawId = $u->getAttribute('_id');
                $u->id_usuario = is_object($rawId) ? (string) $rawId : ($rawId ?? null);
            }
            return $u;
        });
    }

    // Guardar un nuevo registro de autenticación
    public function store(Request $request)
    {
        if ($request->has('email')) {
            $request->merge(['email' => Email::normalize($request->input('email'))]);
        }
        $request->validate([
            'codigo_usuario' => 'required|string|max:50|unique:mongodb.autenticacion_usuarios,codigo_usuario',
            'email' => 'required|email|unique:mongodb.autenticacion_usuarios,email',
            'contrasena' => 'required|string|min:6',
            'intentos_fallidos' => 'nullable|integer|min:0',
            'estado' => 'nullable|in:Activo,Bloqueado',
            'token_recuperacion' => 'nullable|string|max:255',
        ]);

        $payload = $request->only(['codigo_usuario','email','contrasena','fecha_creacion','intentos_fallidos','estado','token_recuperacion','token_recuperacion_expires_at']);
        if (empty($payload['fecha_creacion'])) {
            $payload['fecha_creacion'] = now();
        }
        if (empty($payload['id_usuario'])) {
            $payload['id_usuario'] = 'USR-' . \Illuminate\Support\Str::upper(\Illuminate\Support\Str::random(8));
        }
        $usuario = AutenticacionUsuario::create($payload);
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Nuevo usuario autenticado',
            'Se ha creado el usuario: ' . $usuario->codigo_usuario,
            $email_usuario,
            $usuario->id_servicio ?? null,
            'usuarios'
        );
        return response()->json($usuario, 201);
    }

    // Mostrar un registro específico
    public function show($id)
    {
        $usuario = AutenticacionUsuario::where('id_usuario', $id)->first();
        if (!$usuario) {
            $usuario = AutenticacionUsuario::where('_id', $id)->firstOrFail();
        }
        return response()->json($usuario);
    }

    // Actualizar un registro de autenticación
    public function update(Request $request, $id)
    {
        if ($request->has('email')) {
            $request->merge(['email' => Email::normalize($request->input('email'))]);
        }
        $usuario = AutenticacionUsuario::where('id_usuario', $id)->first();
        if (!$usuario) {
            $usuario = AutenticacionUsuario::where('_id', $id)->firstOrFail();
        }

        $request->validate([
            'codigo_usuario' => 'required|string|max:50|unique:mongodb.autenticacion_usuarios,codigo_usuario,' . $id . ',id_usuario',
            'email' => 'required|email|unique:mongodb.autenticacion_usuarios,email,' . $id . ',id_usuario',
            'contrasena' => 'nullable|string|min:6',
            'intentos_fallidos' => 'nullable|integer|min:0',
            'estado' => 'nullable|in:Activo,Bloqueado',
            'token_recuperacion' => 'nullable|string|max:255',
        ]);
        $usuario->update($request->only(['codigo_usuario','email','contrasena','fecha_creacion','intentos_fallidos','estado','token_recuperacion','token_recuperacion_expires_at']));
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Actualización de usuario con éxito',
            'Se ha actualizado el usuario: ' . $usuario->codigo_usuario,
            $email_usuario,
            $usuario->id_servicio ?? null,
            'usuarios'
        );
        return response()->json($usuario);
    }

    // Eliminar un registro de autenticación
    public function destroy($id)
    {
        $usuario = AutenticacionUsuario::where('id_usuario', $id)->first();
        if (!$usuario) {
            $usuario = AutenticacionUsuario::where('_id', $id)->firstOrFail();
        }
        $usuario->delete();
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Eliminación de usuario con éxito',
            'Se ha eliminado el usuario: ' . $usuario->codigo_usuario,
            $email_usuario,
            $usuario->id_servicio ?? null,
            'usuarios'
        );
        return response()->json(['message' => 'Registro eliminado']);
    }
    
}
