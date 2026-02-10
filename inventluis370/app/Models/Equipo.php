<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Equipo extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'equipos';
    protected $table = 'equipos';
    protected $primaryKey = 'id_equipo';
    public $timestamps = false;

    protected $fillable = [
        'id_equipo',
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
    public function propiedad()
    {
        return $this->hasOne(\App\Models\PropiedadEquipo::class, 'id_equipo', 'id_equipo');
    }
}
