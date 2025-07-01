<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Hash;
use App\Models\Usuario;
use Illuminate\Http\Request;
use App\Models\Notificacion;
use Illuminate\Support\Facades\Mail;

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
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Usuario creado',
            'Se ha creado el usuario: ' . $usuario->nombre . ' (' . $usuario->email . ')',
            $email_usuario,
            $usuario->id_servicio
        );
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
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Usuario actualizado',
            'Se ha actualizado el usuario: ' . $usuario->nombre . ' (' . $usuario->email . ')',
            $email_usuario,
            $usuario->id_servicio
        );
        return response()->json($usuario);
    }

    // Eliminar un usuario
    public function destroy($id)
    {
        $usuario = Usuario::findOrFail($id);
        $nombre = $usuario->nombre;
        $email = $usuario->email;
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Usuario eliminado',
            'Se ha eliminado el usuario: ' . $nombre . ' (' . $email . ')',
            $email_usuario
        );
        $usuario->delete();
        return response()->json(['message' => 'Usuario eliminado']);
    }
    private function registrarYEnviarNotificacion($asunto, $mensaje, $email_usuario, $id_servicio = null)
    {
        // Registrar solo para el usuario que hizo la acción
        Notificacion::create([
            'id_servicio' => $id_servicio,
            'email_destinatario' => $email_usuario,
            'asunto' => $asunto,
            'mensaje' => $mensaje,
            'fecha_envio' => now(),
            'estado_envio' => 'Enviado',
        ]);

        // Enviar correo tanto al usuario como a info@midominio.com
        $destinatarios = [$email_usuario, 'info@midominio.com'];
        Mail::raw($mensaje, function ($mail) use ($destinatarios, $asunto) {
            $mail->to($destinatarios)
                ->subject($asunto);
        });
    }
}
