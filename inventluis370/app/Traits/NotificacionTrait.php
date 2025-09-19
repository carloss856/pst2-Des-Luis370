<?php

namespace App\Traits;

use App\Models\Notificacion;
use App\Models\Usuario;
use Illuminate\Support\Facades\Mail;

trait NotificacionTrait
{
    public function registrarYEnviarNotificacion($asunto, $mensaje, $email_usuario, $id_servicio, $tipo = null)
    {
        $usuario = Usuario::where('email', $email_usuario)->first();
        if (!$usuario) return;

        if (!$usuario->recibir_notificaciones) return;

        if ($tipo && $usuario->tipos_notificacion) {
            $preferencias = is_array($usuario->tipos_notificacion)
                ? $usuario->tipos_notificacion
                : json_decode($usuario->tipos_notificacion, true);
            if (!in_array($tipo, $preferencias)) return;
        }

        Notificacion::create([
            'id_servicio' => $id_servicio,
            'email_destinatario' => $email_usuario,
            'asunto' => $asunto,
            'mensaje' => $mensaje,
            'fecha_envio' => now(),
            'estado_envio' => 'Enviado',
        ]);

        $correoNotificacion = env('NOTIFICACION_CORREO');
        Mail::raw($mensaje, function ($mail) use ($email_usuario, $correoNotificacion, $asunto) {
            $mail->to($email_usuario)
                ->bcc($correoNotificacion)
                ->subject($asunto);
        });
    }
}
