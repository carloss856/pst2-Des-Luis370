<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Empresa extends Model
{
    protected $table = 'empresas';
    protected $primaryKey = 'id_empresa';
    public $timestamps = false;

    protected $fillable = [
        'nombre_empresa',
        'direccion',
        'telefono',
        'email',
        'fecha_creacion',
    ];

    // Relación: Una empresa tiene muchos usuarios
    public function usuarios(): HasMany
    {
        return $this->hasMany(Usuario::class, 'id_empresa', 'id_empresa');
    }
}
