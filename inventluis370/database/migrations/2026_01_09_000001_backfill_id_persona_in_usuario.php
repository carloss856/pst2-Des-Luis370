<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Recorre todos los usuarios y agrega id_persona si falta
        $usuarios = DB::connection('mongodb')->table('usuario')->get();
        foreach ($usuarios as $u) {
            $idp = property_exists($u, 'id_persona') ? $u->id_persona : null;
            if (empty($idp)) {
                // Genera un id_persona único
                do {
                    $candidate = 'USR-' . \Illuminate\Support\Str::upper(\Illuminate\Support\Str::random(8));
                    $exists = DB::connection('mongodb')->table('usuario')->where('id_persona', $candidate)->exists();
                } while ($exists);
                $rawId = property_exists($u, '_id') ? $u->_id : null;
                DB::connection('mongodb')->table('usuario')
                    ->where('_id', $rawId)
                    ->update(['id_persona' => $candidate]);
            }
        }
    }

    public function down(): void
    {
        // No revertimos el id_persona asignado
    }
};
