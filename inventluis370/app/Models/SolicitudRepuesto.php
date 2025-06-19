<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SolicitudRepuesto extends Model
{
    protected $table = 'solicitud_repuestos';
    protected $primaryKey = 'id_solicitud';
    public $timestamps = false;

    protected $fillable = [
        'id_repuesto',
        'id_servicio',
        'cantidad_solicitada',
        'id_usuario',
        'fecha_solicitud',
        'estado_solicitud',
        'comentarios',
    ];

    // Relación: La solicitud pertenece a un repuesto
    public function repuesto(): BelongsTo
    {
        return $this->belongsTo(Repuesto::class, 'id_repuesto', 'id_repuesto');
    }

    // Relación: La solicitud pertenece a un servicio
    public function servicio(): BelongsTo
    {
        return $this->belongsTo(Servicio::class, 'id_servicio', 'id_servicio');
    }

    // Relación: La solicitud pertenece a un usuario
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'id_usuario', 'id_persona');
    }
}
