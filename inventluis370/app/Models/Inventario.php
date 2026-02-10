<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Inventario extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'inventario';
    protected $table = 'inventario';
    protected $primaryKey = 'id_entrada';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'id_entrada',
        'id_repuesto',
        'cantidad_entrada',
        'fecha_entrada',
    ];

    // Relación: El inventario pertenece a un repuesto
    public function repuesto(): BelongsTo
    {
        return $this->belongsTo(Repuesto::class, 'id_repuesto', 'id_repuesto');
    }
}
