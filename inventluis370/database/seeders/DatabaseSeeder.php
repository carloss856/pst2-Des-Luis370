<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\Usuario;
use App\Models\Empresa;
use App\Models\Equipo;
use App\Models\PropiedadEquipo;
use App\Models\Servicio;
use App\Models\Repuesto;
use App\Models\Inventario;
use App\Models\SolicitudRepuesto;
use App\Models\Garantia;
use App\Models\Rma;
use App\Models\Reporte;
use App\Models\Notificacion;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $email = 'carlos.lamole98@gmail.com';

        $usuario = Usuario::where('email', $email)->first();

        if (!$usuario) {
            Usuario::create([
                'id_persona' => 'USR-' . Str::upper(Str::random(8)),
                'nombre' => 'Carlos Lamole',
                'email' => $email,
                'telefono' => null,
                'tipo' => 'Administrador',
                'contrasena' => Hash::make('227567'),
                'id_empresa' => null,
                'validado_por_gerente' => true,
                'recibir_notificaciones' => true,
                'tipos_notificacion' => ['general','seguridad','sistema'],
            ]);
            $usuario = Usuario::where('email', $email)->first();
        }

        // Datos de prueba mínimos en cada colección
        // Empresa
        $empresa = Empresa::first();
        if (!$empresa) {
            $empresa = new Empresa([
                'nombre_empresa' => 'Empresa Demo',
                'direccion' => 'Calle Falsa 123',
                'telefono' => '000-000',
                'email' => 'demo@empresa.com',
                'fecha_creacion' => now(),
            ]);
            $empresa->id_empresa = 'EMP-' . Str::upper(Str::random(6));
            $empresa->save();
        }

        // Equipo
        $equipo = Equipo::first();
        if (!$equipo) {
            $equipo = new Equipo([
                'tipo_equipo' => 'Laptop',
                'marca' => 'DemoBrand',
                'modelo' => 'DB-100',
                'id_persona' => $usuario?->id_persona,
            ]);
            $equipo->id_equipo = 'EQP-' . Str::upper(Str::random(6));
            $equipo->save();
        }

        // PropiedadEquipo
        $prop = PropiedadEquipo::first();
        if (!$prop && $equipo && $usuario) {
            $prop = new PropiedadEquipo([
                'id_equipo' => $equipo->id_equipo,
                'id_persona' => $usuario->id_persona,
            ]);
            $prop->id_propiedad = 'PRP-' . Str::upper(Str::random(6));
            $prop->save();
        }

        // Servicio
        $servicio = Servicio::first();
        if (!$servicio && $equipo) {
            $servicio = new Servicio([
                'id_equipo' => $equipo->id_equipo,
                'codigo_rma' => 'RMA-' . Str::upper(Str::random(6)),
                'fecha_ingreso' => now(),
                'problema_reportado' => 'Prueba de servicio',
                'estado' => 'Abierto',
                'costo_estimado' => 0,
                'costo_real' => 0,
                'validado_por_gerente' => true,
            ]);
            $servicio->id_servicio = 'SRV-' . Str::upper(Str::random(6));
            $servicio->save();
        }

        // Repuesto
        $repuesto = Repuesto::first();
        if (!$repuesto) {
            $repuesto = new Repuesto([
                'nombre_repuesto' => 'Batería Demo',
                'cantidad_disponible' => 10,
                'costo_unitario' => 25.5,
                'nivel_critico' => 2,
            ]);
            $repuesto->id_repuesto = 'REP-' . Str::upper(Str::random(6));
            $repuesto->save();
        }

        // Inventario
        $inventario = Inventario::first();
        if (!$inventario && $repuesto) {
            $inventario = new Inventario([
                'id_repuesto' => $repuesto->id_repuesto,
                'cantidad_entrada' => 5,
                'fecha_entrada' => now(),
            ]);
            $inventario->id_entrada = 'ENTR-' . Str::upper(Str::random(6));
            $inventario->save();
        }

        // Solicitud de Repuesto
        $sol = SolicitudRepuesto::first();
        if (!$sol && $repuesto && $servicio && $usuario) {
            $sol = new SolicitudRepuesto([
                'id_repuesto' => $repuesto->id_repuesto,
                'id_servicio' => $servicio->id_servicio,
                'cantidad_solicitada' => 1,
                'id_usuario' => $usuario->id_persona,
                'fecha_solicitud' => now(),
                'estado_solicitud' => 'Pendiente',
                'comentarios' => 'Solicitud de prueba',
            ]);
            $sol->id_solicitud = 'SOL-' . Str::upper(Str::random(6));
            $sol->save();
        }

        // Garantía
        $gar = Garantia::first();
        if (!$gar && $servicio) {
            $gar = new Garantia([
                'id_servicio' => $servicio->id_servicio,
                'fecha_inicio' => now(),
                'fecha_fin' => now()->addMonths(6),
                'observaciones' => 'Garantía de prueba',
                'validado_por_gerente' => true,
            ]);
            $gar->id_garantia = 'GAR-' . Str::upper(Str::random(6));
            $gar->save();
        }

        // RMA
        $rma = Rma::first();
        if (!$rma && $usuario) {
            $rma = new Rma([
                'id_persona' => $usuario->id_persona,
                'fecha_creacion' => now(),
            ]);
            $rma->rma = 'RMA-' . Str::upper(Str::random(6));
            $rma->save();
        }

        // Reporte
        $reporte = Reporte::first();
        if (!$reporte && $usuario) {
            $reporte = new Reporte([
                'tipo_reporte' => 'Operativo',
                'fecha_generacion' => now(),
                'parametros_utilizados' => 'demo=true',
                'id_usuario' => $usuario->id_persona,
            ]);
            $reporte->id_reporte = 'REP-' . Str::upper(Str::random(6));
            $reporte->save();
        }

        // Notificación (registro, sin envío de correo en local)
        $notif = Notificacion::first();
        if (!$notif) {
            Notificacion::create([
                'id_notificacion' => 'NOTIF-' . Str::upper(Str::random(8)),
                'id_servicio' => $servicio?->id_servicio,
                'email_destinatario' => $email,
                'asunto' => 'Notificación de prueba',
                'mensaje' => 'Este es un mensaje de prueba.',
                'fecha_envio' => now(),
                'estado_envio' => app()->environment('local') ? 'Omitido' : 'Pendiente',
            ]);
        }
    }
}
