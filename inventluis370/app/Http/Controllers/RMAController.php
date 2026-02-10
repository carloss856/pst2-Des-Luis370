<?php

namespace App\Http\Controllers;

use App\Models\Rma;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Support\ApiPagination;
use App\Support\Role;
use App\Support\BusinessId;
use App\Models\Usuario;

class RMAController extends Controller
{
    // Listar todos los RMA
    public function index(Request $request)
    {
        $me = Auth::user();
        $role = Role::normalize($me ? ($me->tipo ?? $me->rol ?? null) : null);
        $query = Rma::query();
        if ($me && !in_array($role, ['Administrador','Gerente','Técnico'])) {
            if ($role === 'Cliente') {
                $query->where('id_persona', $me->id_persona);
            } else {
                // Para roles sin acceso, retorna lista vacía sin usar whereRaw (no soportado por MongoDB builder)
                return response()->json([]);
            }
        }
        return ApiPagination::respond($request, $query, function ($r) {
            if (empty($r->rma)) {
                $rawId = $r->getAttribute('_id');
                $r->rma = is_object($rawId) ? (string) $rawId : ($rawId ?? null);
            }
            return $r;
        });
    }

    // Crear un nuevo RMA
    public function store(Request $request)
    {
        $request->validate([
            'id_persona' => 'required|string',
            'fecha_creacion' => 'required|date',
        ]);

        $resolvedPersona = BusinessId::resolve(Usuario::class, 'id_persona', $request->input('id_persona'));
        if (!$resolvedPersona) {
            return response()->json(['errors' => ['id_persona' => ['Usuario inválido. Envíe id_persona o _id válido.']]], 400);
        }
        $request->merge(['id_persona' => $resolvedPersona]);

        $payload = $request->only(['id_persona','fecha_creacion']);
        if (empty($payload['fecha_creacion'])) {
            $payload['fecha_creacion'] = now();
        }
        if (empty($payload['rma'])) {
            $payload['rma'] = 'RMA-' . \Illuminate\Support\Str::upper(\Illuminate\Support\Str::random(6));
        }

        $rma = Rma::create($payload);
        return response()->json($rma, 201);
    }

    // Mostrar un RMA específico
    public function show($id)
    {
        $rma = Rma::where('rma', $id)->first();
        if (!$rma) {
            $rma = Rma::where('_id', $id)->firstOrFail();
        }
        $me = Auth::user();
        $role = Role::normalize($me ? ($me->tipo ?? $me->rol ?? null) : null);
        if ($me && !in_array($role, ['Administrador','Gerente','Técnico'])) {
            if ($role === 'Cliente') {
                if ($rma->id_persona !== $me->id_persona) {
                    return response()->json(['message' => 'Forbidden'], 403);
                }
            } else {
                return response()->json(['message' => 'Forbidden'], 403);
            }
        }
        return response()->json($rma);
    }

    // Actualizar un RMA
    public function update(Request $request, $id)
    {
        $rma = Rma::where('rma', $id)->first();
        if (!$rma) {
            $rma = Rma::where('_id', $id)->firstOrFail();
        }

        $request->validate([
            'id_persona' => 'sometimes|required|string',
            'fecha_creacion' => 'sometimes|required|date',
        ]);

        if ($request->filled('id_persona')) {
            $resolvedPersona = BusinessId::resolve(Usuario::class, 'id_persona', $request->input('id_persona'));
            if (!$resolvedPersona) {
                return response()->json(['errors' => ['id_persona' => ['Usuario inválido. Envíe id_persona o _id válido.']]], 400);
            }
            $request->merge(['id_persona' => $resolvedPersona]);
        }

        $rma->update($request->only(['id_persona','fecha_creacion']));
        return response()->json($rma);
    }

    // Eliminar un RMA
    public function destroy($id)
    {
        $rma = Rma::where('rma', $id)->first();
        if (!$rma) {
            $rma = Rma::where('_id', $id)->firstOrFail();
        }
        $rma->delete();
        return response()->json(['message' => 'RMA eliminado']);
    }
}
