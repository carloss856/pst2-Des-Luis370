<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Token extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'tokens';
    protected $table = 'tokens';
    protected $primaryKey = '_id';
    public $timestamps = true;

    protected $fillable = [
        'token',
        'tokenable_type',
        'tokenable_id',
        'abilities',
        'last_used_at',
        'expires_at',
    ];

    protected $casts = [
        'abilities' => 'array',
        'last_used_at' => 'datetime',
        'expires_at' => 'datetime',
    ];
}
