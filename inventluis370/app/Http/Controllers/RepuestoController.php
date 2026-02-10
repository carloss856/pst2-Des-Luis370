<?php

namespace App\Http\Controllers;

use App\Models\Notificacion;
use Illuminate\Support\Facades\Mail;
use App\Models\Repuesto;
use Illuminate\Http\Request;
use App\Traits\NotificacionTrait;
use App\Support\ApiPagination;

class RepuestoController extends Controller
{
    use NotificacionTrait;
    // Listar todos los repuestos
    public function index(Request $request)
    {
        $query = Repuesto::query();
        return ApiPagination::respond($request, $query, function ($r) {
            if (empty($r->id_repuesto)) {
                $rawId = $r->getAttribute('_id');
                $r->id_repuesto = is_object($rawId) ? (string) $rawId : ($rawId ?? null);
            }
            return $r;
        });
    }

    // Guardar un nuevo repuesto
    public function store(Request $request)
    {
        $request->validate([
            'nombre_repuesto' => 'required|string|max:100',
            'cantidad_disponible' => 'required|integer|min:0',
            'costo_unitario' => 'nullable|numeric',
            'nivel_critico' => 'required|integer|min:0',
        ]);

        $payload = $request->only(['nombre_repuesto','cantidad_disponible','costo_unitario','nivel_critico']);
        if (empty($payload['id_repuesto'])) {
            $payload['id_repuesto'] = 'REP-' . \Illuminate\Support\Str::upper(\Illuminate\Support\Str::random(6));
        }
        $repuesto = Repuesto::create($payload);

        // Nota: el módulo /inventario gestiona las entradas y el ajuste automático de stock.
        // No se crea un documento inventario aquí porque el modelo Inventario representa entradas (id_entrada, cantidad_entrada, fecha_entrada).
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Repuesto creado',
            'Se ha creado el repuesto: ' . $repuesto->nombre_repuesto,
            $email_usuario,
            null,
            'repuestos'
        );
        return response()->json($repuesto, 201);
    }

    // Mostrar un repuesto específico
    public function show($id)
    {
        $repuesto = Repuesto::where('id_repuesto', $id)->first();
        if (!$repuesto) {
            $repuesto = Repuesto::where('_id', $id)->firstOrFail();
        }
        return response()->json($repuesto);
    }

    // Actualizar un repuesto
    public function update(Request $request, $id)
    {
        $repuesto = Repuesto::where('id_repuesto', $id)->first();
        if (!$repuesto) {
            $repuesto = Repuesto::where('_id', $id)->firstOrFail();
        }

        $request->validate([
            'nombre_repuesto' => 'required|string|max:100',
            'cantidad_disponible' => 'required|integer|min:0',
            'costo_unitario' => 'nullable|numeric',
            'nivel_critico' => 'required|integer|min:0',
        ]);

        $repuesto->update($request->only(['nombre_repuesto','cantidad_disponible','costo_unitario','nivel_critico']));
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Repuesto actualizado',
            'Se ha actualizado el repuesto: ' . $repuesto->nombre_repuesto,
            $email_usuario,
            null,
            'repuestos'
        );
        return response()->json($repuesto);
    }

    // Eliminar un repuesto
    public function destroy($id)
    {
        $repuesto = Repuesto::where('id_repuesto', $id)->first();
        if (!$repuesto) {
            $repuesto = Repuesto::where('_id', $id)->firstOrFail();
        }
        $repuesto->delete();
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $email_usuario = $user->email;
        $this->registrarYEnviarNotificacion(
            'Repuesto eliminado',
            'Se ha eliminado el repuesto: ' . $repuesto->nombre_repuesto,
            $email_usuario,
            null,
            'repuestos'
        );
        return response()->json(['message' => 'Repuesto eliminado']);
    }
}
