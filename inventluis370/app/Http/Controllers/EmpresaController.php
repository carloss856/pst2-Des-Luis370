<?php

namespace App\Http\Controllers;

use App\Models\Notificacion;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;

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
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Empresa creada',
            'Se ha creado la empresa: ' . $empresa->nombre_empresa,
            $email_usuario,
            null
        );

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
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Empresa actualizada',
            'Se ha actualizado la empresa: ' . $empresa->nombre_empresa,
            $email_usuario,
            null
        );
        return response()->json($empresa);
    }

    // Eliminar una empresa
    public function destroy($id)
    {
        $empresa = Empresa::findOrFail($id);
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;

        try {
            $this->registrarYEnviarNotificacion(
                'Empresa eliminada',
                'Se ha eliminado la empresa: ' . $empresa->nombre_empresa,
                $email_usuario,
                null
            );
            $empresa->delete();
            return response()->json(['message' => 'Empresa eliminada']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al eliminar empresa', 'detalle' => $e->getMessage()], 500);
        }
    }

    private function registrarYEnviarNotificacion($asunto, $mensaje, $email_usuario, $id_servicio = null)
    {
        $data = [
            'email_destinatario' => $email_usuario,
            'asunto' => $asunto,
            'mensaje' => $mensaje,
            'fecha_envio' => now(),
            'estado_envio' => 'Enviado',
        ];
        if ($id_servicio) {
            $data['id_servicio'] = $id_servicio;
        }

        $notificacion = Notificacion::create($data);

        $destinatarios = [$email_usuario, 'info@midominio.com'];
        Mail::raw($mensaje, function ($mail) use ($destinatarios, $asunto) {
            $mail->to($destinatarios)
                ->subject($asunto);
        });

        return $notificacion;
    }
}
