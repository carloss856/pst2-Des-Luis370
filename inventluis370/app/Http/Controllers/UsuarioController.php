<?php

namespace App\Http\Controllers;

use App\Models\Rma;
use App\Models\Notificacion;
use App\Models\Usuario;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Traits\NotificacionTrait;

class UsuarioController extends Controller
{
    use NotificacionTrait;
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

        // se crea el RMA
        if ($usuario->tipo === 'Cliente') {
            $codigo = $this->generarCodigoRmaUnico();
            Rma::create([
                'rma' => $codigo,
                'id_persona' => $usuario->id_persona,
                'fecha_creacion' => now(),
            ]);
            // opcional: adjuntar al retorno
            $usuario->codigo_rma_generado = $codigo;
        }

        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Usuario creado',
            'Se ha creado el usuario: ' . $usuario->nombre . ' (' . $usuario->email . ')',
            $email_usuario,
            $usuario->id_servicio ?? null
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
            $usuario->id_servicio ?? null
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
            $email_usuario,
            $usuario->id_servicio ?? null
        );
        $usuario->delete();
        return response()->json(['message' => 'Usuario eliminado']);
    }

    private function generarCodigoRmaUnico(): string
    {
        do {
            $codigo = 'RMA-' . Str::upper(Str::random(8));
        } while (Rma::where('rma', $codigo)->exists());
        return $codigo;
    }

    public function getNotificacionesConfig($id)
    {
        $usuario = Usuario::findOrFail($id);
        return response()->json([
            'recibir_notificaciones' => $usuario->recibir_notificaciones,
            'tipos_notificacion' => $usuario->tipos_notificacion ? json_decode($usuario->tipos_notificacion, true) : [],
        ]);
    }

    public function setNotificacionesConfig(Request $request, $id)
    {
        $usuario = Usuario::findOrFail($id);
        $request->validate([
            'recibir_notificaciones' => 'required|boolean',
            'tipos_notificacion' => 'nullable|array',
        ]);
        $usuario->recibir_notificaciones = $request->recibir_notificaciones;
        $usuario->tipos_notificacion = $request->has('tipos_notificacion')
            ? json_encode($request->tipos_notificacion)
            : null;
        $usuario->save();
        return response()->json(['message' => 'Configuración actualizada']);
    }
}
