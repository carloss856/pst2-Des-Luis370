<?php
namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use App\Support\Email;

class AutenticacionUsuario extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'autenticacion_usuarios';
    protected $table = 'autenticacion_usuarios';
    protected $primaryKey = 'id_usuario';
    public $timestamps = false;

    protected $fillable = [
        'id_usuario',
        'codigo_usuario',
        'email',
        'contrasena',
        'fecha_creacion',
        'intentos_fallidos',
        'estado',
        'token_recuperacion',
        'token_recuperacion_expires_at',
    ];

    protected $hidden = [
        'contrasena',
        'token_recuperacion',
    ];

    public function setEmailAttribute($value): void
    {
        $this->attributes['email'] = Email::normalize(is_string($value) ? $value : (is_null($value) ? null : (string) $value));
    }
}