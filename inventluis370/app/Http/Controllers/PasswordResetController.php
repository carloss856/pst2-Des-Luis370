<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use App\Models\AutenticacionUsuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Carbon\Carbon;

class PasswordResetController extends Controller
{
    public function requestToken(Request $request)
    {
        $request->validate(['email'=>'required|email']);
        $usuario = Usuario::where('email',$request->email)->first();
        if(!$usuario){
            return response()->json(['error'=>'El correo indicado no existe'],404);
        }

        $auth = AutenticacionUsuario::firstOrCreate(
            ['email'=>$usuario->email],
            [
                'codigo_usuario'=>'AU-'.Str::upper(Str::random(6)),
                'contrasena'=>$usuario->contrasena,
                'estado'=>'Activo',
                'fecha_creacion'=>now(),
            ]
        );

        $tokenPlano = Str::upper(Str::random(8));
        $auth->token_recuperacion = Hash::make($tokenPlano);
        $auth->token_recuperacion_expires_at = Carbon::now()->addMinutes(30);
        $auth->save();

        $link = env('FRONTEND_URL', 'https://inventario.cssubero.com').'/reset-password?email='.urlencode($usuario->email);

        try {
            \Log::info('Enviando token recuperación a '.$usuario->email);
            Mail::send('emails.reset_password', [
                'token'=>$tokenPlano,
                'link'=>$link,
                'usuario'=>$usuario->nombre ?? $usuario->email,
            ], function($m) use($usuario){
                $m->to($usuario->email)->subject('Recuperación de contraseña');
            });
        } catch (\Throwable $e){
            \Log::error('Error envío reset: '.$e->getMessage());
            return response()->json(['error'=>'No se pudo enviar el correo'],500);
        }

        return response()->json(['message'=>'Token enviado al correo']);
    }

    public function verifyToken(Request $request)
    {
        $request->validate(['email'=>'required|email','token'=>'required|string']);
        $auth = AutenticacionUsuario::where('email',$request->email)->first();
        if(!$auth || !$auth->token_recuperacion){
            return response()->json(['error'=>'Token inválido'],400);
        }
        if($auth->token_recuperacion_expires_at && now()->gt($auth->token_recuperacion_expires_at)){
            return response()->json(['error'=>'Token expirado'],400);
        }
        if(!Hash::check($request->token,$auth->token_recuperacion)){
            return response()->json(['error'=>'Token incorrecto'],400);
        }
        return response()->json(['message'=>'Token válido']);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email'=>'required|email',
            'token'=>'required|string',
            'nueva_contrasena'=>'required|string|min:6'
        ]);

        $usuario = Usuario::where('email',$request->email)->first();
        $auth = AutenticacionUsuario::where('email',$request->email)->first();

        if(!$usuario || !$auth || !$auth->token_recuperacion){
            return response()->json(['error'=>'Datos inválidos'],400);
        }
        if($auth->token_recuperacion_expires_at && now()->gt($auth->token_recuperacion_expires_at)){
            return response()->json(['error'=>'Token expirado'],400);
        }
        if(!Hash::check($request->token,$auth->token_recuperacion)){
            return response()->json(['error'=>'Token incorrecto'],400);
        }

        $usuario->contrasena = Hash::make($request->nueva_contrasena);
        $usuario->save();

        $auth->token_recuperacion = null;
        $auth->token_recuperacion_expires_at = null;
        $auth->save();

        return response()->json(['message'=>'Contraseña actualizada correctamente']);
    }
}
