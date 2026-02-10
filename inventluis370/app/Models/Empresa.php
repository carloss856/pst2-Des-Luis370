<?php
namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Support\Email;

class Empresa extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'empresas';
    protected $table = 'empresas';
    protected $primaryKey = 'id_empresa';
    public $timestamps = false;

    protected $fillable = [
        'id_empresa',
        'nombre_empresa',
        'direccion',
        'telefono',
        'email',
        'fecha_creacion',
    ];

    public function setEmailAttribute($value): void
    {
        $this->attributes['email'] = Email::normalize(is_string($value) ? $value : (is_null($value) ? null : (string) $value));
    }

    // Relación: Una empresa tiene muchos usuarios
    public function usuarios(): HasMany
    {
        return $this->hasMany(Usuario::class, 'id_empresa', 'id_empresa');
    }
}
