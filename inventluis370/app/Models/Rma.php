<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Rma extends Model
{
    protected $table = 'rma';
    protected $primaryKey = 'rma';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'rma',
        'id_persona',
        'fecha_creacion',
    ];

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'id_persona', 'id_persona');
    }
}