<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class PermissionSetting extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'permission_settings';
    protected $table = 'permission_settings';
    public $timestamps = false;

    protected $fillable = [
        'key',
        'modules',
        'routes',
        'updated_at',
        'updated_by',
    ];

    protected $casts = [
        'modules' => 'array',
        'routes' => 'array',
    ];
}
