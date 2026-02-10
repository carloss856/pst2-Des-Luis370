<?php
namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class TarifaServicio extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'tarifas_servicio';
    protected $table = 'tarifas_servicio';
    protected $primaryKey = 'id_tarifa';
    public $timestamps = false;

    protected $fillable = [
        'id_tarifa',
        'tipo_tarea',
        'nivel_tecnico',
        'tarifa_hora',
        'moneda',
        'activo',
        'vigente_desde',
        'vigente_hasta',
    ];

    protected $casts = [
        'tarifa_hora' => 'float',
        'activo' => 'boolean',
    ];
}
