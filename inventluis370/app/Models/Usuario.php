<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Usuario extends Authenticatable
{
    use HasApiTokens, Notifiable;
    protected $table = 'usuario';
    protected $primaryKey = 'id_persona';
    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'email',
        'telefono',
        'tipo',
        'contrasena',
        'id_empresa',
        'validado_por_gerente',
    ];

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
}
