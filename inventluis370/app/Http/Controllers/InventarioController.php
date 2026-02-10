<?php

namespace App\Http\Controllers;

use App\Models\Inventario;
use App\Models\Repuesto;
use Illuminate\Http\Request;
use App\Models\Notificacion;
use Illuminate\Support\Facades\Mail;
use App\Traits\NotificacionTrait;
use App\Support\ApiPagination;
use App\Support\BusinessId;
use Illuminate\Support\Facades\Auth;

class InventarioController extends Controller
{
    use NotificacionTrait;
    // Listar todo el inventario
    public function index(Request $request)
    {
        $query = Inventario::query();
        return ApiPagination::respond($request, $query, function ($i) {
            if (empty($i->id_entrada)) {
                $rawId = $i->getAttribute('_id');
                $i->id_entrada = is_object($rawId) ? (string) $rawId : ($rawId ?? null);
            }
            return $i;
        });
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_repuesto' => 'required|string',
            'cantidad_entrada' => 'required|integer|min:1',
            'fecha_entrada' => 'nullable|date',
        ]);

        $resolvedRepuesto = BusinessId::resolve(Repuesto::class, 'id_repuesto', $request->input('id_repuesto'));
        if (!$resolvedRepuesto) {
            return response()->json(['errors' => ['id_repuesto' => ['Repuesto inválido. Envíe id_repuesto o _id válido.']]], 400);
        }
        $request->merge(['id_repuesto' => $resolvedRepuesto]);

        $repuesto = Repuesto::where('id_repuesto', $request->id_repuesto)->first();
        if (!$repuesto) {
            return response()->json(['error' => 'Repuesto no encontrado'], 404);
        }

        $payload = [
            'id_repuesto' => $request->id_repuesto,
            'cantidad_entrada' => $request->cantidad_entrada,
            'fecha_entrada' => $request->fecha_entrada ?? now(),
        ];
        if (empty($payload['id_entrada'])) {
            $payload['id_entrada'] = 'ENTR-' . \Illuminate\Support\Str::upper(\Illuminate\Support\Str::random(6));
        }

        // Regla de stock: una entrada de inventario incrementa el stock del repuesto.
        // Se intenta mantener consistencia: si falla la creación del inventario, se revierte el stock.
        $repuesto->increment('cantidad_disponible', (int) $payload['cantidad_entrada']);
        try {
            $registro = Inventario::create($payload);
        } catch (\Throwable $e) {
            $repuesto->decrement('cantidad_disponible', (int) $payload['cantidad_entrada']);
            throw $e;
        }

        return response()->json($registro, 201);
    }

    // Mostrar un registro específico de inventario
    public function show($id)
    {
        $registro = Inventario::where('id_entrada', $id)->first();
        if (!$registro) {
            $registro = Inventario::where('_id', $id)->firstOrFail();
        }
        return response()->json($registro);
    }

    // Actualizar un registro de inventario
    public function update(Request $request, $id)
    {
        $registro = Inventario::where('id_entrada', $id)->first();
        if (!$registro) {
            $registro = Inventario::where('_id', $id)->firstOrFail();
        }

        $request->validate([
            'cantidad_entrada' => 'required|integer|min:0',
            'fecha_entrada' => 'nullable|date',
        ]);

        $repuesto = Repuesto::where('id_repuesto', $registro->id_repuesto)->first();
        if (!$repuesto) {
            return response()->json(['error' => 'Repuesto no encontrado para ajustar stock'], 409);
        }

        $cantidadAnterior = (int) ($registro->cantidad_entrada ?? 0);
        $cantidadNueva = (int) ($request->cantidad_entrada ?? 0);
        $delta = $cantidadNueva - $cantidadAnterior;

        if ($delta < 0) {
            $reducir = abs($delta);
            if (((int) ($repuesto->cantidad_disponible ?? 0)) < $reducir) {
                return response()->json(['error' => 'Stock insuficiente para reducir esta entrada'], 400);
            }
        }

        // Ajuste de stock por delta antes de actualizar el registro.
        if ($delta > 0) {
            $repuesto->increment('cantidad_disponible', $delta);
        } elseif ($delta < 0) {
            $repuesto->decrement('cantidad_disponible', abs($delta));
        }

        try {
            $registro->update($request->only(['cantidad_entrada','fecha_entrada']));
        } catch (\Throwable $e) {
            // Revertir ajuste de stock si falla el update.
            if ($delta > 0) {
                $repuesto->decrement('cantidad_disponible', $delta);
            } elseif ($delta < 0) {
                $repuesto->increment('cantidad_disponible', abs($delta));
            }
            throw $e;
        }

        return response()->json($registro);
    }

    // Eliminar un registro de inventario
    public function destroy($id)
    {
        $registro = Inventario::where('id_entrada', $id)->first();
        if (!$registro) {
            $registro = Inventario::where('_id', $id)->firstOrFail();
        }

        $repuesto = Repuesto::where('id_repuesto', $registro->id_repuesto)->first();
        if (!$repuesto) {
            return response()->json(['error' => 'Repuesto no encontrado para revertir stock'], 409);
        }

        $cantidad = (int) ($registro->cantidad_entrada ?? 0);
        if ($cantidad > 0 && ((int) ($repuesto->cantidad_disponible ?? 0)) < $cantidad) {
            return response()->json(['error' => 'Stock insuficiente para eliminar esta entrada'], 400);
        }

        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Inventario eliminado',
            'Se ha eliminado el registro de inventario para el repuesto ID: ' . $registro->id_repuesto,
            $email_usuario,
            null,
            'inventario'
        );

        // Regla de stock: eliminar una entrada revierte el incremento.
        if ($cantidad > 0) {
            $repuesto->decrement('cantidad_disponible', $cantidad);
        }
        $registro->delete();
        return response()->json(['message' => 'Registro de inventario eliminado']);
    }
}
