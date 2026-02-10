<?php
namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notificacion extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'notificaciones';
    protected $table = 'notificaciones';
    protected $primaryKey = 'id_notificacion';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'id_notificacion',
        'id_servicio',
        'tipo',
        'email_destinatario',
        'asunto',
        'mensaje',
        'fecha_envio',
        'estado_envio',
        'leida',
        'leida_en',
    ];

    protected $casts = [
        'fecha_envio' => 'datetime',
        'leida' => 'boolean',
        'leida_en' => 'datetime',
    ];

    // Relación: La notificación pertenece a un servicio
    public function servicio(): BelongsTo
    {
        return $this->belongsTo(Servicio::class, 'id_servicio', 'id_servicio');
    }
}
