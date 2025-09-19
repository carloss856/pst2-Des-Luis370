<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Repuesto extends Model
{
    protected $table = 'repuestos';
    protected $primaryKey = 'id_repuesto';
    public $timestamps = false;

    protected $fillable = [
        'nombre_repuesto',
        'cantidad_disponible',
        'costo_unitario',
        'nivel_critico',
    ];

    // Relación: Un repuesto tiene un inventario
    public function inventario(): HasOne
    {
        return $this->hasOne(Inventario::class, 'id_repuesto', 'id_repuesto');
    }
}
