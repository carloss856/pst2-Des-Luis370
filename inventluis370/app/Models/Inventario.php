<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Inventario extends Model
{
    protected $table = 'inventario';
    protected $primaryKey = 'id_repuesto';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'id_repuesto',
        'cantidad_disponible',
        'nivel_critico',
        'ultima_actualizacion',
    ];

    // Relación: El inventario pertenece a un repuesto
    public function repuesto(): BelongsTo
    {
        return $this->belongsTo(Repuesto::class, 'id_repuesto', 'id_repuesto');
    }
}
