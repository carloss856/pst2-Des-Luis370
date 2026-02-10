<?php
namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class TarifaServicioHistorial extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'tarifas_servicio_historial';
    protected $table = 'tarifas_servicio_historial';
    protected $primaryKey = 'id_historial';
    public $timestamps = false;

    protected $fillable = [
        'id_historial',
        'id_tarifa',
        'tipo_tarea',
        'nivel_tecnico',
        'tarifa_hora',
        'moneda',
        'fecha_registro',
        'id_usuario',
        'nombre_usuario',
    ];

    protected $casts = [
        'tarifa_hora' => 'float',
    ];
}
