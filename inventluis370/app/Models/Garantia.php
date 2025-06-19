<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Garantia extends Model
{
    protected $table = 'garantias';
    protected $primaryKey = 'id_garantia';
    public $timestamps = false;

    protected $fillable = [
        'id_servicio',
        'fecha_inicio',
        'fecha_fin',
        'observaciones',
        'validado_por_gerente',
    ];

    // Relación: Una garantía pertenece a un servicio
    public function servicio(): BelongsTo
    {
        return $this->belongsTo(Servicio::class, 'id_servicio', 'id_servicio');
    }
}
