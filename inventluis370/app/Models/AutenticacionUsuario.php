<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AutenticacionUsuario extends Model
{
    protected $table = 'autenticacion_usuarios';
    protected $primaryKey = 'id_usuario';
    public $timestamps = false;

    protected $fillable = [
        'codigo_usuario',
        'email',
        'contrasena',
        'fecha_creacion',
        'intentos_fallidos',
        'estado',
        'token_recuperacion',
    ];
}
