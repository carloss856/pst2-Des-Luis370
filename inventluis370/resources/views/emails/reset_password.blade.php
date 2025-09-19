<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Recuperación de contraseña</title>
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <meta name="x-apple-disable-message-reformatting">
  <style>
    body { font-family: Arial, sans-serif; background:#f5f5f5; margin:0; padding:0; }
    .wrap { max-width:560px; margin:30px auto; background:#ffffff; border:1px solid #e2e2e2; border-radius:6px; overflow:hidden; }
    .header { background:#1976d2; color:#fff; padding:16px 24px; }
    .content { padding:24px; color:#333; line-height:1.45; }
    .token-box { font-size:20px; font-weight:bold; letter-spacing:2px; background:#f0f4ff; border:1px dashed #1976d2; padding:12px; text-align:center; margin:18px 0; }
    .footer { font-size:12px; color:#777; padding:16px 24px; background:#fafafa; }
    a.btn { background:#1976d2; color:#fff !important; text-decoration:none; padding:12px 20px; border-radius:4px; font-weight:bold; display:inline-block; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <h2 style="margin:0;">Recuperación de contraseña</h2>
    </div>
    <div class="content">
      <p>Hola {{ $usuario ?? 'Usuario' }},</p>
      <p>Recibimos una solicitud para restablecer tu contraseña en {{ config('app.name') }}.</p>
      <p>Introduce este token en la página de recuperación:</p>
      <div class="token-box">{{ $token }}</div>
      <p>O haz clic en el botón:</p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td>
            <a href="{{ $link }}" class="btn" target="_blank" rel="noopener">Restablecer contraseña</a>
          </td>
        </tr>
      </table>
      <p>Si el botón no funciona, copia y pega este enlace:</p>
      <p style="word-break:break-all;"><a href="{{ $link }}">{{ $link }}</a></p>
      <p>El token expira en 30 minutos y solo puede usarse una vez.</p>
      <p>Si no solicitaste este cambio, ignora este correo.</p>
      <p>Saludos,<br>{{ config('app.name') }}</p>
    </div>
    <div class="footer">
      Mensaje automático. No respondas.
    </div>
  </div>
</body>
</html>