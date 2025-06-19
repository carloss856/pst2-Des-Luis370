<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Servicio extends Model
{
    protected $table = 'servicios';
    protected $primaryKey = 'id_servicio';
    public $timestamps = false;

    protected $fillable = [
        'id_equipo',
        'codigo_rma',
        'fecha_ingreso',
        'problema_reportado',
        'estado',
        'costo_estimado',
        'costo_real',
        'validado_por_gerente',
    ];

    // Relación: Un servicio pertenece a un equipo
    public function equipo(): BelongsTo
    {
        return $this->belongsTo(Equipo::class, 'id_equipo', 'id_equipo');
    }

    // Relación: Un servicio puede tener muchas garantías
    public function garantias(): HasMany
    {
        return $this->hasMany(Garantia::class, 'id_servicio', 'id_servicio');
    }
}
