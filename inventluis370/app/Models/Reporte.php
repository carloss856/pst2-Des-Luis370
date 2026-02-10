<?php
namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reporte extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'reportes';
    protected $table = 'reportes';
    protected $primaryKey = 'id_reporte';
    public $timestamps = false;

    protected $fillable = [
        'id_reporte',
        'tipo_reporte',
        'fecha_generacion',
        'parametros_utilizados',
        'id_usuario',
    ];

    // Relación: El reporte pertenece a un usuario
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'id_usuario', 'id_persona');
    }
}
