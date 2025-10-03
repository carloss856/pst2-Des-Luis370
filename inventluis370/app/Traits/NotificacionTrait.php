<?php

namespace App\Traits;

use App\Models\Notificacion;
use App\Models\Usuario;
use Illuminate\Support\Facades\Mail;
use App\Models\Servicio;

trait NotificacionTrait
{
    public function registrarYEnviarNotificacion($asunto, $mensaje, $email_usuario, $id_servicio = null, $tipo = null)
    {
        // Buscar usuario solo para preferencias (no bloquear el registro si no existe)
        $usuario = Usuario::where('email', $email_usuario)->first();

        // Evaluar si se debe ENVIAR correo (aunque SIEMPRE registraremos la notificación)
        $omitirEnvioPorPreferencias = false;
        if ($usuario) {
            if (!$usuario->recibir_notificaciones) {
                $omitirEnvioPorPreferencias = true;
            }
            if ($tipo && $usuario->tipos_notificacion) {
                $preferencias = is_array($usuario->tipos_notificacion)
                    ? $usuario->tipos_notificacion
                    : json_decode($usuario->tipos_notificacion, true);
                if (is_array($preferencias) && !in_array($tipo, $preferencias)) {
                    $omitirEnvioPorPreferencias = true;
                }
            }
        }

        $servicioValido = null;
        if ($id_servicio) {
            $servicioValido = \App\Models\Servicio::find($id_servicio);
        }
        $notificacion = Notificacion::create([
            'id_servicio' => $servicioValido ? $id_servicio : null,
            'email_destinatario' => $email_usuario,
            'asunto' => mb_convert_encoding($asunto, 'UTF-8', 'UTF-8'),
            'mensaje' => mb_convert_encoding($mensaje, 'UTF-8', 'UTF-8'),
            'fecha_envio' => now(),
            'estado_envio' => $omitirEnvioPorPreferencias ? 'Fallido' : 'Pendiente',
        ]);

        if ($omitirEnvioPorPreferencias) {
            return;
        }

        $correoNotificacion = trim((string) env('NOTIFICACION_CORREO'));
        $fromFallback = config('mail.from.address');
        $to = $email_usuario;
        $bcc = array_values(array_filter(array_map('trim', explode(',', $correoNotificacion))));

        try {
            Mail::raw($mensaje, function ($mail) use ($to, $bcc, $asunto, $fromFallback) {
                if ($fromFallback) {
                    $mail->from($fromFallback, config('mail.from.name'));
                }
                $mail->to($to)->subject($asunto);
                if (!empty($bcc)) {
                    $mail->bcc($bcc);
                }
            });

            if ($notificacion) {
                $notificacion->update(['estado_envio' => 'Enviado']);
            }
        } catch (\Throwable $e) {
            \Log::error('Error enviando correo de notificación: ' . $e->getMessage(), [
                'asunto' => $asunto,
                'dest_to' => $to,
                'dest_bcc' => $bcc,
            ]);
            if ($notificacion) {
                $notificacion->update(['estado_envio' => 'Fallido']);
            }
        }
    }
}
