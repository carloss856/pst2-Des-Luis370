<?php

namespace App\Http\Controllers;

use App\Models\Notificacion;
use Illuminate\Support\Facades\Mail;
use App\Models\Empresa;
use App\Models\Usuario;
use Illuminate\Http\Request;
use App\Traits\NotificacionTrait;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use App\Support\ApiPagination;
use App\Support\Email;

class EmpresaController extends Controller
{
    use NotificacionTrait;
    // Listar todas las empresas
    public function index(Request $request)
    {
        $query = Empresa::query();
        return ApiPagination::respond($request, $query, function ($e) {
            if (empty($e->id_empresa)) {
                // Exponer id_empresa con fallback al _id para compatibilidad del front
                $rawId = $e->getAttribute('_id');
                $e->id_empresa = is_object($rawId) ? (string) $rawId : ($rawId ?? null);
            }
            return $e;
        });
    }

    // Mostrar formulario de creación (opcional para API)
    public function create()
    {
        //
    }

    // Guardar una nueva empresa
    public function store(Request $request)
    {
        if ($request->has('email')) {
            $request->merge(['email' => Email::normalize($request->input('email'))]);
        }
        $request->validate([
            'nombre_empresa' => 'required|string|max:100',
            'direccion' => 'nullable|string',
            'telefono' => 'nullable|string|max:15',
            'email' => 'required|email|unique:mongodb.empresas,email',
        ]);

        // Generar id_empresa si no viene en el request
        $payload = $request->only(['nombre_empresa','direccion','telefono','email','fecha_creacion']);
        if (empty($payload['fecha_creacion'])) {
            $payload['fecha_creacion'] = now();
        }
        if (empty($payload['id_empresa'])) {
            $payload['id_empresa'] = 'EMP-' . Str::upper(Str::random(6));
        }

        $empresa = Empresa::create($payload);

        // Crear automáticamente un usuario de tipo Empresa con datos de la empresa
        try {
            $usuarioPayload = [
                'id_persona' => 'USR-' . Str::upper(Str::random(8)),
                'nombre' => $empresa->nombre_empresa,
                'email' => $empresa->email,
                'telefono' => $empresa->telefono ?? null,
                'tipo' => 'Empresa',
                'contrasena' => Hash::make('NOLOGIN-EMPRESA'), // genérica; además estará bloqueado para login
                'id_empresa' => $empresa->id_empresa,
                'recibir_notificaciones' => false,
                'tipos_notificacion' => [],
            ];
            Usuario::create($usuarioPayload);
        } catch (\Throwable $e) {
            // Si algo falla al crear el usuario, no bloquear la creación de empresa
            // Podríamos registrar log si se requiere
        }
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Empresa creada',
            'Se ha creado la empresa: ' . $empresa->nombre_empresa,
            $email_usuario,
            null,
            'empresa'
        );

        return response()->json($empresa, 201);
    }

    // Mostrar una empresa específica
    public function show($id)
    {
        // Buscar por id_empresa, y si no existe, intentar por _id
        $empresa = Empresa::where('id_empresa', $id)->first();
        if (!$empresa) {
            $empresa = Empresa::where('_id', $id)->firstOrFail();
        }
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
        if ($request->has('email')) {
            $request->merge(['email' => Email::normalize($request->input('email'))]);
        }
        // Buscar por id_empresa, y si no existe, intentar por _id
        $empresa = Empresa::where('id_empresa', $id)->first();
        if (!$empresa) {
            $empresa = Empresa::where('_id', $id)->firstOrFail();
        }

        $request->validate([
            'nombre_empresa' => 'required|string|max:100',
            'direccion' => 'nullable|string',
            'telefono' => 'nullable|string|max:15',
            'email' => 'required|email',
        ]);

        // Validación manual de email único (excluyendo la empresa actual)
        if ($request->has('email') && $request->email !== $empresa->email) {
            $exists = Empresa::where('email', $request->email)
                ->where('_id', '!=', $empresa->getAttribute('_id'))
                ->exists();
            if ($exists) {
                return response()->json([
                    'message' => 'El email ya está en uso',
                    'errors' => ['email' => ['El email ya está en uso por otra empresa']]
                ], 422);
            }
        }

        $empresa->update($request->only(['nombre_empresa','direccion','telefono','email']));

        // Sincronizar datos con el usuario de tipo Empresa vinculado
        try {
            $usuarioEmpresa = \App\Models\Usuario::where('tipo', 'Empresa')
                ->where('id_empresa', $empresa->id_empresa)
                ->first();
            if ($usuarioEmpresa) {
                // Validar colisión de email en usuarios si cambia
                if ($request->has('email') && $request->email !== $usuarioEmpresa->email) {
                    $existsUserEmail = \App\Models\Usuario::where('email', $request->email)
                        ->where('_id', '!=', $usuarioEmpresa->getAttribute('_id'))
                        ->exists();
                    if ($existsUserEmail) {
                        // Evitar romper por colisión; mantener email anterior del usuario
                    } else {
                        $usuarioEmpresa->email = $request->email;
                    }
                }
                if ($request->has('nombre_empresa')) {
                    $usuarioEmpresa->nombre = $request->nombre_empresa;
                }
                if ($request->has('telefono')) {
                    $usuarioEmpresa->telefono = $request->telefono;
                }
                $usuarioEmpresa->save();
            }
        } catch (\Throwable $e) {
            // Ignorar errores de sincronización para no bloquear la actualización
        }
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Empresa actualizada',
            'Se ha actualizado la empresa: ' . $empresa->nombre_empresa,
            $email_usuario,
            null,
            'empresa'
        );
        return response()->json($empresa);
    }

    // Eliminar una empresa
    public function destroy($id)
    {
        // Buscar por id_empresa, y si no existe, intentar por _id
        $empresa = Empresa::where('id_empresa', $id)->first();
        if (!$empresa) {
            $empresa = Empresa::where('_id', $id)->firstOrFail();
        }
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;

        try {
            // Eliminar usuario(s) de tipo Empresa vinculados a esta empresa
            try {
                $usuariosEmpresa = \App\Models\Usuario::where('tipo', 'Empresa')
                    ->where('id_empresa', $empresa->id_empresa)
                    ->get();
                foreach ($usuariosEmpresa as $u) {
                    $u->delete();
                }
            } catch (\Throwable $e) {
                // no bloquear por errores de eliminación de usuarios
            }

            $this->registrarYEnviarNotificacion(
                'Empresa eliminada',
                'Se ha eliminado la empresa: ' . $empresa->nombre_empresa,
                $email_usuario,
                null,
                'empresa'
            );
            $empresa->delete();
            return response()->json(['message' => 'Empresa eliminada']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al eliminar empresa', 'detalle' => $e->getMessage()], 500);
        }
    }
}
