<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use App\Models\Token;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\Notificacion;
use Illuminate\Support\Facades\Mail;
use App\Traits\NotificacionTrait;
use Illuminate\Support\Facades\Auth;
use App\Support\Email;
use App\Support\BusinessId;
use App\Models\Empresa;

class AuthController extends Controller
{
    use NotificacionTrait;
    // Registro de usuario
    public function register(Request $request)
    {
        if ($request->has('email')) {
            $request->merge(['email' => Email::normalize($request->input('email'))]);
        }
        $rules = [
            'nombre' => 'required|string|max:100',
            'email' => 'required|email|unique:mongodb.usuario,email',
            'telefono' => 'nullable|string|max:15',
            'tipo' => 'required|in:Administrador,Técnico,Gerente,Cliente,Empresa',
            'contrasena' => 'required|string|min:6',
            'id_empresa' => 'nullable|string',
        ];
        $request->validate($rules);

        if ($request->filled('id_empresa')) {
            $resolvedEmpresa = BusinessId::resolve(Empresa::class, 'id_empresa', $request->input('id_empresa'));
            if (!$resolvedEmpresa) {
                return response()->json(['errors' => ['id_empresa' => ['Empresa inválida. Envíe id_empresa o _id válido.']]], 400);
            }
            $request->merge(['id_empresa' => $resolvedEmpresa]);
        }

        $userData = [
            'nombre' => $request->nombre,
            'email' => $request->email,
            'telefono' => $request->telefono,
            'tipo' => $request->tipo,
            'contrasena' => Hash::make($request->contrasena),
            'id_empresa' => $request->id_empresa,
        ];
        // Si es Empresa, crear/asegurar la empresa vinculada cuando no se provee id_empresa
        if ($request->tipo === 'Empresa') {
            if (empty($userData['id_empresa'])) {
                $existingEmpresa = \App\Models\Empresa::where('email', $userData['email'])->first();
                if ($existingEmpresa) {
                    $userData['id_empresa'] = $existingEmpresa->id_empresa;
                } else {
                    $newEmpresaId = 'EMP-' . \Illuminate\Support\Str::upper(\Illuminate\Support\Str::random(6));
                    $empresa = \App\Models\Empresa::create([
                        'id_empresa' => $newEmpresaId,
                        'nombre_empresa' => $userData['nombre'],
                        'telefono' => $userData['telefono'] ?? null,
                        'email' => $userData['email'],
                        'fecha_creacion' => now(),
                    ]);
                    $userData['id_empresa'] = $empresa->id_empresa;
                }
            } else {
                // Si el cliente envía id_empresa, asegurar que exista en empresas y sincronizar datos básicos
                $empresa = \App\Models\Empresa::where('id_empresa', $userData['id_empresa'])->first();
                if (!$empresa) {
                    \App\Models\Empresa::create([
                        'id_empresa' => $userData['id_empresa'],
                        'nombre_empresa' => $userData['nombre'],
                        'telefono' => $userData['telefono'] ?? null,
                        'email' => $userData['email'],
                        'fecha_creacion' => now(),
                    ]);
                } else {
                    $empresa->nombre_empresa = $userData['nombre'];
                    $empresa->telefono = $userData['telefono'] ?? null;
                    // Solo actualizar email si no colisiona con otra empresa
                    if ($empresa->email !== $userData['email']) {
                        $existsEmpEmail = \App\Models\Empresa::where('email', $userData['email'])
                            ->where('_id', '!=', $empresa->getAttribute('_id'))
                            ->exists();
                        if (!$existsEmpEmail) {
                            $empresa->email = $userData['email'];
                        }
                    }
                    $empresa->save();
                }
            }
        }

        $usuario = Usuario::create($userData);

        $plainTextToken = bin2hex(random_bytes(32));
        $expiresAt = now()->addHour();
        Token::create([
            'token' => hash('sha256', $plainTextToken),
            'name' => 'auth_token',
            'abilities' => ['*'],
            'tokenable_type' => Usuario::class,
            'tokenable_id' => $usuario->id_persona,
            'last_used_at' => null,
            'expires_at' => $expiresAt,
        ]);

        return response()->json([
            'usuario' => $usuario,
            'token' => $plainTextToken,
            'tipo' => $usuario->tipo,
            'expires_at' => $expiresAt,
        ], 201);
    }

    // Login de usuario
    public function login(Request $request)
    {
        if ($request->has('email')) {
            $request->merge(['email' => Email::normalize($request->input('email'))]);
        }
        $request->validate([
            'email' => 'required|email',
            'contrasena' => 'required|string',
        ]);

        $usuario = Usuario::where('email', $request->email)->first();

        if (!$usuario || !Hash::check($request->contrasena, $usuario->contrasena)) {
            return response()->json(['message' => 'Credenciales incorrectas'], 401);
        }

        // Bloquear inicio de sesión para usuarios de tipo Empresa
        if ($usuario->tipo === 'Empresa') {
            return response()->json(['message' => 'Acceso no permitido para usuarios de tipo Empresa'], 403);
        }

        $plainTextToken = bin2hex(random_bytes(32));
        $expiresAt = now()->addHour();
        Token::create([
            'token' => hash('sha256', $plainTextToken),
            'name' => 'auth_token',
            'abilities' => ['*'],
            'tokenable_type' => Usuario::class,
            'tokenable_id' => $usuario->id_persona,
            'last_used_at' => null,
            'expires_at' => $expiresAt,
        ]);

        $this->registrarYEnviarNotificacion(
            'Inicio de sesion exitoso',
            'El usuario ' . $usuario->nombre . ' ha iniciado sesion correctamente.',
            $usuario->email,
            $usuario->id_servicio ?? null,
            'usuarios'
        );

        return response()->json([
            'usuario' => $usuario,
            'token' => $plainTextToken,
            'tipo' => $usuario->tipo,
            'expires_at' => $expiresAt,
        ]);
    }

    // Logout de usuario
    public function logout(Request $request)
    {
        $authHeader = $request->header('Authorization');
        if ($authHeader && str_starts_with($authHeader, 'Bearer ')) {
            $plain = substr($authHeader, 7);
            Token::where('token', hash('sha256', $plain))->delete();
        }
        return response()->json(['message' => 'Sesion cerrada']);
    }

    // Extender la expiración del token actual (renueva por 1 hora)
    public function extend(Request $request)
    {
        $authHeader = $request->header('Authorization');
        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        $plain = substr($authHeader, 7);
        $hash = hash('sha256', $plain);
        $token = Token::where('token', $hash)->first();
        if (!$token) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        if ($token->expires_at && now()->greaterThan($token->expires_at)) {
            return response()->json(['message' => 'Token expired'], 401);
        }

        $token->expires_at = now()->addHour();
        $token->save();

        return response()
            ->json([
            'message' => 'Token extended',
            'expires_at' => $token->expires_at,
        ])
            ->header('X-Token-Expires-At', $token->expires_at->toIso8601String());
    }

    // Usuario actual segun token
    public function me(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        return response()->json(['usuario' => [
            'id_persona' => $user->id_persona,
            'nombre' => $user->nombre ?? null,
            'email' => $user->email ?? null,
            'tipo' => $user->tipo ?? null,
            'rol' => $user->rol ?? null,
        ]]);
    }
}
