<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Symfony\Component\Console\Command\Command;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('mongodb:indexes {--ttl : Crea TTL en tokens.expires_at (borra documentos expirados)}', function () {
    $this->info('MongoDB: normalizando emails a lowercase (si existen)...');

    $connection = DB::connection('mongodb');

    $db = null;
    if (method_exists($connection, 'getMongoDB')) {
        $db = $connection->getMongoDB();
    } elseif (method_exists($connection, 'getMongoClient')) {
        $client = $connection->getMongoClient();
        $databaseName = method_exists($connection, 'getDatabaseName')
            ? $connection->getDatabaseName()
            : config('database.connections.mongodb.database');
        $db = $client->selectDatabase($databaseName);
    }

    if (!$db) {
        $this->error('No se pudo obtener la instancia de MongoDB desde la conexión "mongodb".');
        return Command::FAILURE;
    }

    $normalizeEmail = function (string $collectionName) use ($db) {
        $collection = $db->selectCollection($collectionName);

        try {
            // Requiere MongoDB 4.2+ (update con pipeline)
            $result = $collection->updateMany(
                ['email' => ['$type' => 'string']],
                [[ '$set' => ['email' => ['$toLower' => '$email']] ]]
            );
            return (int) ($result->getModifiedCount() ?? 0);
        } catch (\Throwable $e) {
            // Fallback: iteración manual
            $modified = 0;
            $cursor = $collection->find(
                ['email' => ['$type' => 'string']],
                ['projection' => ['_id' => 1, 'email' => 1]]
            );
            foreach ($cursor as $doc) {
                $email = isset($doc['email']) ? (string) $doc['email'] : '';
                $lower = strtolower(trim($email));
                if ($email !== $lower) {
                    $collection->updateOne(['_id' => $doc['_id']], ['$set' => ['email' => $lower]]);
                    $modified++;
                }
            }
            return $modified;
        }
    };

    $modifiedUsuario = $normalizeEmail('usuario');
    $modifiedEmpresas = $normalizeEmail('empresas');
    $modifiedAuthUsers = $normalizeEmail('autenticacion_usuarios');

    $this->line("- usuario: {$modifiedUsuario} docs normalizados");
    $this->line("- empresas: {$modifiedEmpresas} docs normalizados");
    $this->line("- autenticacion_usuarios: {$modifiedAuthUsers} docs normalizados");

    $this->info('MongoDB: creando índices (idempotente; si ya existen, se omiten)...');

    $normalizeAssoc = function ($value): array {
        if ($value instanceof \MongoDB\Model\BSONDocument || $value instanceof \MongoDB\Model\BSONArray) {
            $value = $value->getArrayCopy();
        } elseif (is_object($value)) {
            $value = (array) $value;
        }
        if (!is_array($value)) {
            return [];
        }
        $out = [];
        foreach ($value as $k => $v) {
            if (is_int($k)) {
                continue;
            }
            $out[(string) $k] = is_numeric($v) ? (int) $v : $v;
        }
        return $out;
    };

    $ensureIndex = function (string $collectionName, array $keys, array $options = [], string $label = '') use ($db, $normalizeAssoc) {
        $collection = $db->selectCollection($collectionName);

        $wantedUnique = (bool) ($options['unique'] ?? false);
        $wantedExpire = $options['expireAfterSeconds'] ?? null;
        $wantedPartial = $options['partialFilterExpression'] ?? null;
        $wantedKeys = $normalizeAssoc($keys);
        $wantedPartialNorm = $wantedPartial === null ? null : $normalizeAssoc($wantedPartial);

        try {
            foreach ($collection->listIndexes() as $idx) {
                $info = method_exists($idx, 'getInfo') ? $idx->getInfo() : (array) $idx;
                $existingKeys = $info['key'] ?? null;
                $existingKeysNorm = $normalizeAssoc($existingKeys);
                if (!$existingKeysNorm || $existingKeysNorm != $wantedKeys) {
                    continue;
                }

                $existingUnique = (bool) ($info['unique'] ?? false);
                $existingExpire = $info['expireAfterSeconds'] ?? null;
                $existingPartial = $info['partialFilterExpression'] ?? null;
                $existingPartialNorm = $existingPartial === null ? null : $normalizeAssoc($existingPartial);

                $sameUnique = $existingUnique === $wantedUnique;
                $sameExpire = $wantedExpire === null ? true : ((string) $existingExpire === (string) $wantedExpire);
                $samePartial = $wantedPartialNorm === null ? true : ($existingPartialNorm == $wantedPartialNorm);

                if ($sameUnique && $sameExpire && $samePartial) {
                    $name = $info['name'] ?? '(sin nombre)';
                    $this->line('OK: ' . ($label ?: ($collectionName . ' ' . json_encode($keys))) . " (ya existe: {$name})");
                    return true;
                }

                $name = $info['name'] ?? '(sin nombre)';
                $this->warn('CONFLICT: ' . ($label ?: ($collectionName . ' ' . json_encode($keys))) . " (existe: {$name}). Si desea cambiar opciones, primero haga dropIndex('{$name}') y re-ejecute.");
                return false;
            }
        } catch (\Throwable $e) {
            $this->warn('WARN: No se pudieron listar índices de ' . $collectionName . ' — ' . $e->getMessage());
        }

        try {
            $name = $collection->createIndex($keys, $options);
            $this->line('OK: ' . ($label ?: ($collectionName . ' ' . json_encode($keys))) . (is_string($name) ? " ({$name})" : ''));
            return true;
        } catch (\Throwable $e) {
            $msg = $e->getMessage();
            if (is_string($msg) && str_contains($msg, 'Index already exists with a different name:')) {
                $existingName = trim(substr($msg, strpos($msg, 'Index already exists with a different name:') + strlen('Index already exists with a different name:')));
                $this->line('OK: ' . ($label ?: ($collectionName . ' ' . json_encode($keys))) . " (ya existe con otro nombre: {$existingName})");
                return true;
            }

            $this->warn('SKIP/FAIL: ' . ($label ?: ($collectionName . ' ' . json_encode($keys))) . ' — ' . $msg);
            return false;
        }
    };

    // Unique por IDs de negocio (si falla por duplicados, revisar data y re-ejecutar)
    $ensureIndex('usuario', ['id_persona' => 1], ['unique' => true, 'name' => 'uniq_usuario_id_persona'], 'usuario uniq id_persona');
    $ensureIndex('empresas', ['id_empresa' => 1], ['unique' => true, 'name' => 'uniq_empresas_id_empresa'], 'empresas uniq id_empresa');
    $ensureIndex('equipos', ['id_equipo' => 1], ['unique' => true, 'name' => 'uniq_equipos_id_equipo'], 'equipos uniq id_equipo');
    $ensureIndex('servicios', ['id_servicio' => 1], ['unique' => true, 'name' => 'uniq_servicios_id_servicio'], 'servicios uniq id_servicio');
    $ensureIndex('repuestos', ['id_repuesto' => 1], ['unique' => true, 'name' => 'uniq_repuestos_id_repuesto'], 'repuestos uniq id_repuesto');
    $ensureIndex('inventario', ['id_entrada' => 1], ['unique' => true, 'name' => 'uniq_inventario_id_entrada'], 'inventario uniq id_entrada');
    $ensureIndex('solicitud_repuestos', ['id_solicitud' => 1], ['unique' => true, 'name' => 'uniq_solicitud_repuestos_id_solicitud'], 'solicitud_repuestos uniq id_solicitud');
    $ensureIndex(
        'notificaciones',
        ['id_notificacion' => 1],
        [
            'unique' => true,
            'name' => 'uniq_notificaciones_id_notificacion',
            'partialFilterExpression' => ['id_notificacion' => ['$exists' => true, '$type' => 'string']],
        ],
        'notificaciones uniq id_notificacion (partial)'
    );

    // Email unique (ya normalizado a lowercase). Si hay duplicados existentes, fallará.
    $ensureIndex('usuario', ['email' => 1], ['unique' => true, 'name' => 'uniq_usuario_email'], 'usuario uniq email');
    $ensureIndex('empresas', ['email' => 1], ['unique' => true, 'name' => 'uniq_empresas_email'], 'empresas uniq email');
    $ensureIndex('autenticacion_usuarios', ['email' => 1], ['unique' => true, 'name' => 'uniq_autenticacion_usuarios_email'], 'autenticacion_usuarios uniq email');

    // Lookup / filtros frecuentes
    $ensureIndex('usuario', ['id_empresa' => 1], ['name' => 'idx_usuario_id_empresa'], 'usuario idx id_empresa');
    $ensureIndex('usuario', ['tipo' => 1], ['name' => 'idx_usuario_tipo'], 'usuario idx tipo');

    $ensureIndex('equipos', ['id_persona' => 1], ['name' => 'idx_equipos_id_persona'], 'equipos idx id_persona');

    $ensureIndex('propiedad_equipos', ['id_equipo' => 1], ['unique' => true, 'name' => 'uniq_propiedad_equipos_id_equipo'], 'propiedad_equipos uniq id_equipo');
    $ensureIndex('propiedad_equipos', ['id_persona' => 1], ['name' => 'idx_propiedad_equipos_id_persona'], 'propiedad_equipos idx id_persona');

    $ensureIndex('servicios', ['id_equipo' => 1], ['name' => 'idx_servicios_id_equipo'], 'servicios idx id_equipo');
    $ensureIndex('servicios', ['estado' => 1], ['name' => 'idx_servicios_estado'], 'servicios idx estado');

    $ensureIndex('inventario', ['id_repuesto' => 1], ['name' => 'idx_inventario_id_repuesto'], 'inventario idx id_repuesto');
    $ensureIndex('inventario', ['fecha_entrada' => 1], ['name' => 'idx_inventario_fecha_entrada'], 'inventario idx fecha_entrada');

    $ensureIndex('solicitud_repuestos', ['id_servicio' => 1], ['name' => 'idx_solicitud_repuestos_id_servicio'], 'solicitud_repuestos idx id_servicio');
    $ensureIndex('solicitud_repuestos', ['id_repuesto' => 1], ['name' => 'idx_solicitud_repuestos_id_repuesto'], 'solicitud_repuestos idx id_repuesto');
    $ensureIndex('solicitud_repuestos', ['estado_solicitud' => 1], ['name' => 'idx_solicitud_repuestos_estado'], 'solicitud_repuestos idx estado_solicitud');
    $ensureIndex('solicitud_repuestos', ['fecha_solicitud' => 1], ['name' => 'idx_solicitud_repuestos_fecha'], 'solicitud_repuestos idx fecha_solicitud');

    $ensureIndex('notificaciones', ['email_destinatario' => 1, 'fecha_envio' => -1], ['name' => 'idx_notif_email_fecha'], 'notificaciones idx (email_destinatario, fecha_envio)');
    $ensureIndex('notificaciones', ['id_servicio' => 1], ['name' => 'idx_notificaciones_id_servicio'], 'notificaciones idx id_servicio');

    $ensureIndex('tokens', ['token' => 1], ['name' => 'idx_tokens_token'], 'tokens idx token');
    $ensureIndex('tokens', ['tokenable_id' => 1], ['name' => 'idx_tokens_tokenable_id'], 'tokens idx tokenable_id');
    $ensureIndex('tokens', ['expires_at' => 1], ['name' => 'idx_tokens_expires_at'], 'tokens idx expires_at');

    if ((bool) $this->option('ttl')) {
        $ensureIndex('tokens', ['expires_at' => 1], ['expireAfterSeconds' => 0, 'name' => 'ttl_tokens_expires_at'], 'tokens TTL expires_at');
    } else {
        $this->line('TTL no creado (use --ttl si lo desea).');
    }

    $this->info('Listo. Puede re-ejecutar este comando sin riesgo (idempotente).');
    return Command::SUCCESS;
})->purpose('Normaliza emails a lowercase y crea índices recomendados en MongoDB');
