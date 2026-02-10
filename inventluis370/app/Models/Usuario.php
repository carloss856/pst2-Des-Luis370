<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use MongoDB\Laravel\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Support\Email;

class Usuario extends Authenticatable
{
    use HasApiTokens, Notifiable;
    protected $connection = 'mongodb';
    protected $collection = 'usuario';
    protected $table = 'usuario';
    protected $primaryKey = '_id';
    public $timestamps = false;

    protected $fillable = [
        'id_persona',
        'nombre',
        'email',
        'telefono',
        'tipo',
        'contrasena',
        'id_empresa',
        'fecha_creacion',
        'validado_por_gerente',
        'recibir_notificaciones',
        'tipos_notificacion',
    ];

    protected $casts = [
        'tipos_notificacion' => 'array',
        'recibir_notificaciones' => 'boolean',
    ];

    protected $hidden = [
        'contrasena',
    ];

    public function setEmailAttribute($value): void
    {
        $this->attributes['email'] = Email::normalize(is_string($value) ? $value : (is_null($value) ? null : (string) $value));
    }

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->id_persona)) {
                // Genera un id_persona único
                do {
                    $candidate = 'USR-' . \Illuminate\Support\Str::upper(\Illuminate\Support\Str::random(8));
                } while (self::where('id_persona', $candidate)->exists());
                $model->id_persona = $candidate;
            }
        });
    }

    // Relación: Un usuario pertenece a una empresa
    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Empresa::class, 'id_empresa', 'id_empresa');
    }

    // Relación: Un usuario puede tener muchos equipos
    public function equipos(): HasMany
    {
        return $this->hasMany(Equipo::class, 'id_persona', 'id_persona');
    }

    // Relacion: un usuario puede tener un RMA
    public function rma(): HasOne
    {
        return $this->hasOne(Rma::class, 'id_persona', 'id_persona');
    }
}
