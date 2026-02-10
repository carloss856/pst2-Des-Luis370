<?php

namespace App\Http\Controllers;

use App\Models\Rma;
use App\Models\Notificacion;
use App\Models\Usuario;
use App\Models\Empresa;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Traits\NotificacionTrait;
use App\Support\ApiPagination;
use App\Support\Role;
use App\Support\Email;
use App\Support\BusinessId;

class UsuarioController extends Controller
{
    use NotificacionTrait;
    // Listar todos los usuarios
    public function index(Request $request)
    {
        $me = \Illuminate\Support\Facades\Auth::user();
        $role = Role::normalize($me ? ($me->tipo ?? $me->rol ?? null) : null);
        $query = Usuario::query();
        if ($me && !in_array($role, ['Administrador','Gerente','Técnico'])) {
            if ($role === 'Cliente') {
                $query->where('id_persona', $me->id_persona);
            } else {
                // Empresa u otros no deben ver usuarios
                return response()->json([]);
            }
        }
        return ApiPagination::respond($request, $query);
    }

    // Guardar un nuevo usuario
    public function store(Request $request)
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
            'validado_por_gerente' => 'boolean',
        ];
        $request->validate($rules);

        if ($request->filled('id_empresa')) {
            $resolvedEmpresa = BusinessId::resolve(Empresa::class, 'id_empresa', $request->input('id_empresa'));
            if (!$resolvedEmpresa) {
                return response()->json(['errors' => ['id_empresa' => ['Empresa inválida. Envíe id_empresa o _id válido.']]], 400);
            }
            $request->merge(['id_empresa' => $resolvedEmpresa]);
        }

        $data = $request->only(['nombre','email','telefono','tipo','contrasena','id_empresa','validado_por_gerente']);
        if (empty($data['id_persona'])) {
            do {
                $candidate = 'USR-' . \Illuminate\Support\Str::upper(\Illuminate\Support\Str::random(8));
            } while (Usuario::where('id_persona', $candidate)->exists());
            $data['id_persona'] = $candidate;
        }
        // Si se crea un usuario de tipo Empresa, crear/asegurar la empresa asociada y vincular id_empresa
        if ($data['tipo'] === 'Empresa') {
            if (empty($data['id_empresa'])) {
                // Reutilizar empresa por email si existe, de lo contrario crear
                $existingEmpresa = Empresa::where('email', $data['email'])->first();
                if ($existingEmpresa) {
                    $data['id_empresa'] = $existingEmpresa->id_empresa;
                } else {
                    $newEmpresaId = 'EMP-' . \Illuminate\Support\Str::upper(\Illuminate\Support\Str::random(6));
                    $empresa = Empresa::create([
                        'id_empresa' => $newEmpresaId,
                        'nombre_empresa' => $data['nombre'],
                        'direccion' => null,
                        'telefono' => $data['telefono'] ?? null,
                        'email' => $data['email'],
                        'fecha_creacion' => now(),
                    ]);
                    $data['id_empresa'] = $empresa->id_empresa;
                }
            } else {
                $empresa = Empresa::where('id_empresa', $data['id_empresa'])->first();
                if (!$empresa) {
                    Empresa::create([
                        'id_empresa' => $data['id_empresa'],
                        'nombre_empresa' => $data['nombre'],
                        'telefono' => $data['telefono'] ?? null,
                        'email' => $data['email'],
                        'fecha_creacion' => now(),
                    ]);
                } else {
                    // sincronizar datos básicos
                    // Validación manual de email único en empresas si cambia
                    if ($data['email'] !== $empresa->email) {
                        $existsEmpEmail = Empresa::where('email', $data['email'])
                            ->where('_id', '!=', $empresa->getAttribute('_id'))
                            ->exists();
                        if (!$existsEmpEmail) {
                            $empresa->email = $data['email'];
                        }
                    }
                    $empresa->nombre_empresa = $data['nombre'];
                    $empresa->telefono = $data['telefono'] ?? null;
                    $empresa->save();
                }
            }
        }
        $data['contrasena'] = Hash::make($data['contrasena']);

        $usuario = Usuario::create($data);
        $user = \Illuminate\Support\Facades\Auth::user();
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
            $usuario->id_servicio ?? null,
            'usuarios'
        );
        return response()->json($usuario, 201);
    }

    // Mostrar un usuario específico
    public function show($id)
    {
        $usuario = Usuario::where('id_persona', $id)->first();
        if (!$usuario) {
            $usuario = Usuario::where('_id', $id)->firstOrFail();
        }
        $me = \Illuminate\Support\Facades\Auth::user();
        $role = Role::normalize($me ? ($me->tipo ?? $me->rol ?? null) : null);
        if ($me && !in_array($role, ['Administrador','Gerente','Técnico'])) {
            if ($role === 'Cliente') {
                if ($usuario->id_persona !== $me->id_persona) {
                    return response()->json(['message' => 'Forbidden'], 403);
                }
            } else {
                return response()->json(['message' => 'Forbidden'], 403);
            }
        }
        return response()->json($usuario);
    }

    // Actualizar un usuario
    public function update(Request $request, $id)
    {
        if ($request->has('email')) {
            $request->merge(['email' => Email::normalize($request->input('email'))]);
        }
        $usuario = Usuario::where('id_persona', $id)->first();
        if (!$usuario) {
            $usuario = Usuario::where('_id', $id)->firstOrFail();
        }

        $finalTipo = $request->has('tipo') ? $request->tipo : $usuario->tipo;
        $rules = [
            'nombre' => 'required|string|max:100',
            'email' => 'required|email|unique:mongodb.usuario,email,' . $id . ',id_persona',
            'telefono' => 'nullable|string|max:15',
            'tipo' => 'required|in:Administrador,Técnico,Gerente,Cliente,Empresa',
            'contrasena' => 'nullable|string|min:6',
            'id_empresa' => 'nullable|string',
            'validado_por_gerente' => 'boolean',
        ];
        $request->validate($rules);

        if ($request->filled('id_empresa')) {
            $resolvedEmpresa = BusinessId::resolve(Empresa::class, 'id_empresa', $request->input('id_empresa'));
            if (!$resolvedEmpresa) {
                return response()->json(['errors' => ['id_empresa' => ['Empresa inválida. Envíe id_empresa o _id válido.']]], 400);
            }
            $request->merge(['id_empresa' => $resolvedEmpresa]);
        }

        $data = $request->all();
        if (!empty($data['contrasena'])) {
            $data['contrasena'] = Hash::make($data['contrasena']);
        } else {
            unset($data['contrasena']);
        }

        // Si el tipo final es Empresa, asegurar empresa y sincronizar
        if ($finalTipo === 'Empresa') {
            $empId = $request->has('id_empresa') ? $request->id_empresa : ($usuario->id_empresa ?? null);
            if (empty($empId)) {
                // crear o reutilizar por email
                $existingEmpresa = Empresa::where('email', $request->has('email') ? $request->email : $usuario->email)->first();
                if ($existingEmpresa) {
                    $data['id_empresa'] = $existingEmpresa->id_empresa;
                } else {
                    $newEmpresaId = 'EMP-' . \Illuminate\Support\Str::upper(\Illuminate\Support\Str::random(6));
                    $empresa = Empresa::create([
                        'id_empresa' => $newEmpresaId,
                        'nombre_empresa' => $request->has('nombre') ? $request->nombre : $usuario->nombre,
                        'telefono' => $request->has('telefono') ? $request->telefono : $usuario->telefono,
                        'email' => $request->has('email') ? $request->email : $usuario->email,
                        'fecha_creacion' => now(),
                    ]);
                    $data['id_empresa'] = $empresa->id_empresa;
                }
            } else {
                $empresa = Empresa::where('id_empresa', $empId)->first();
                if (!$empresa) {
                    Empresa::create([
                        'id_empresa' => $empId,
                        'nombre_empresa' => $request->has('nombre') ? $request->nombre : $usuario->nombre,
                        'telefono' => $request->has('telefono') ? $request->telefono : $usuario->telefono,
                        'email' => $request->has('email') ? $request->email : $usuario->email,
                        'fecha_creacion' => now(),
                    ]);
                    $data['id_empresa'] = $empId;
                } else {
                    // sincronizar cambios
                    $newEmail = $request->has('email') ? $request->email : $usuario->email;
                    if ($newEmail !== $empresa->email) {
                        $existsEmpEmail = Empresa::where('email', $newEmail)
                            ->where('_id', '!=', $empresa->getAttribute('_id'))
                            ->exists();
                        if (!$existsEmpEmail) {
                            $empresa->email = $newEmail;
                        }
                    }
                    $empresa->nombre_empresa = $request->has('nombre') ? $request->nombre : $usuario->nombre;
                    $empresa->telefono = $request->has('telefono') ? $request->telefono : $usuario->telefono;
                    $empresa->save();
                }
            }
        }

        $usuario->update($data);
        $user = \Illuminate\Support\Facades\Auth::user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Usuario actualizado',
            'Se ha actualizado el usuario: ' . $usuario->nombre . ' (' . $usuario->email . ')',
            $email_usuario,
            $usuario->id_servicio ?? null,
            'usuarios'
        );
        return response()->json($usuario);
    }

    // Eliminar un usuario
    public function destroy($id)
    {
        $usuario = Usuario::where('id_persona', $id)->first();
        if (!$usuario) {
            $usuario = Usuario::where('_id', $id)->firstOrFail();
        }
        $nombre = $usuario->nombre;
        $email = $usuario->email;
        // Si es tipo Empresa, eliminar la empresa vinculada
        if ($usuario->tipo === 'Empresa' && !empty($usuario->id_empresa)) {
            try {
                $empresa = Empresa::where('id_empresa', $usuario->id_empresa)->first();
                if ($empresa) { $empresa->delete(); }
            } catch (\Throwable $e) {
                // ignorar errores de cascada
            }
        }
        $user = \Illuminate\Support\Facades\Auth::user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Usuario eliminado',
            'Se ha eliminado el usuario: ' . $nombre . ' (' . $email . ')',
            $email_usuario,
            $usuario->id_servicio ?? null,
            'usuarios'
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
        $usuario = Usuario::where('id_persona', $id)->first();
        if (!$usuario) {
            $usuario = Usuario::where('_id', $id)->firstOrFail();
        }

        $tipos = $usuario->tipos_notificacion;
        if (is_string($tipos)) {
            $decoded = json_decode($tipos, true);
            $tipos = is_array($decoded) ? $decoded : [];
        } elseif (!is_array($tipos)) {
            $tipos = [];
        }

        return response()->json([
            'recibir_notificaciones' => $usuario->recibir_notificaciones,
            'tipos_notificacion' => $tipos,
        ]);
    }

    public function setNotificacionesConfig(Request $request, $id)
    {
        $usuario = Usuario::where('id_persona', $id)->first();
        if (!$usuario) {
            $usuario = Usuario::where('_id', $id)->firstOrFail();
        }
        $request->validate([
            'recibir_notificaciones' => 'required|boolean',
            'tipos_notificacion' => 'nullable|array',
        ]);
        $usuario->recibir_notificaciones = $request->recibir_notificaciones;
        $usuario->tipos_notificacion = $request->has('tipos_notificacion')
            ? array_values($request->tipos_notificacion)
            : null;
        $usuario->save();
        return response()->json(['message' => 'Configuración actualizada']);
    }
}
