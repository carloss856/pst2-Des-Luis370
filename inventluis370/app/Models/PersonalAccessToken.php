<?php

namespace App\Models;

use Laravel\Sanctum\PersonalAccessToken as SanctumPersonalAccessToken;

class PersonalAccessToken extends SanctumPersonalAccessToken
{
    protected $connection = 'mongodb';
    protected $collection = 'personal_access_tokens';
    protected $table = 'personal_access_tokens';
    protected $primaryKey = '_id';
    public $timestamps = true;

    protected $fillable = [
        'token',
        'name',
        'abilities',
        'last_used_at',
        'expires_at',
        'tokenable_type',
        'tokenable_id',
    ];

    protected $casts = [
        'abilities' => 'array',
        'last_used_at' => 'datetime',
        'expires_at' => 'datetime',
    ];
}
