<?php

namespace App\Support;

use MongoDB\Laravel\Eloquent\Model;

class BusinessId
{
    /**
     * Resuelve un ID recibido desde clientes (puede ser el ID de negocio o el _id de Mongo)
     * y retorna el ID de negocio (p. ej. id_persona, id_equipo, etc.).
     */
    public static function resolve(string $modelClass, string $businessKey, mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $value = is_string($value) ? trim($value) : (is_scalar($value) ? (string) $value : null);
        if ($value === null || $value === '') {
            return null;
        }

        /** @var Model|null $byBusiness */
        $byBusiness = $modelClass::where($businessKey, $value)->first();
        if ($byBusiness) {
            $resolved = $byBusiness->getAttribute($businessKey);
            return is_string($resolved) && $resolved !== '' ? $resolved : $value;
        }

        /** @var Model|null $byMongoId */
        $byMongoId = null;
        if (is_string($value) && preg_match('/^[a-f0-9]{24}$/i', $value)) {
            try {
                $objectIdClass = '\\MongoDB\\BSON\\ObjectId';
                if (class_exists($objectIdClass)) {
                    $byMongoId = $modelClass::where('_id', new $objectIdClass($value))->first();
                }
            } catch (\Throwable $e) {
                $byMongoId = null;
            }
        }
        if (!$byMongoId) {
            $byMongoId = $modelClass::where('_id', $value)->first();
        }
        if ($byMongoId) {
            $resolved = $byMongoId->getAttribute($businessKey);
            return is_string($resolved) && $resolved !== '' ? $resolved : null;
        }

        return null;
    }
}
