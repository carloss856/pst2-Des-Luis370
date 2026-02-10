<?php
namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SolicitudRepuesto extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'solicitud_repuestos';
    protected $table = 'solicitud_repuestos';
    protected $primaryKey = 'id_solicitud';
    public $timestamps = false;

    protected $fillable = [
        'id_solicitud',
        'id_repuesto',
        'id_servicio',
        'cantidad_solicitada',
        'id_usuario',
        'fecha_solicitud',
        'estado_solicitud',
        'comentarios',
    ];

    public function repuesto(): BelongsTo
    {
        return $this->belongsTo(Repuesto::class, 'id_repuesto', 'id_repuesto');
    }

    public function servicio(): BelongsTo
    {
        return $this->belongsTo(Servicio::class, 'id_servicio', 'id_servicio');
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'id_usuario', 'id_persona');
    }
}
