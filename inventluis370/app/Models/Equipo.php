<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Equipo extends Model
{
    protected $table = 'equipos';
    protected $primaryKey = 'id_equipo';
    public $timestamps = false;

    protected $fillable = [
        'tipo_equipo',
        'marca',
        'modelo',
        'id_persona',
    ];

    // Relación: Un equipo pertenece a un usuario
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'id_persona', 'id_persona');
    }

    // Relación: Un equipo puede tener muchos servicios
    public function servicios(): HasMany
    {
        return $this->hasMany(Servicio::class, 'id_equipo', 'id_equipo');
    }
}
