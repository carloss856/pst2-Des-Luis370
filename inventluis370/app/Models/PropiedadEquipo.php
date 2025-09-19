<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PropiedadEquipo extends Model
{
    protected $table = 'propiedad_equipos';
    protected $primaryKey = 'id_propiedad';
    public $timestamps = false;

    protected $fillable = [
        'id_equipo',
        'id_persona',
    ];

    // Relación: PropiedadEquipo pertenece a un equipo
    public function equipo(): BelongsTo
    {
        return $this->belongsTo(Equipo::class, 'id_equipo', 'id_equipo');
    }

    // Relación: PropiedadEquipo pertenece a un usuario
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Usuario::class, 'id_persona', 'id_persona');
    }
}
