<?php
use Illuminate\Support\Str;
use App\Models\Usuario;
use App\Models\Equipo;
use App\Models\PropiedadEquipo;

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$usersUpdated = 0;
$equiposProcessed = 0;
$propiedadesCreated = 0;
$propiedadesUpdated = 0;

$usuarios = Usuario::all();
foreach ($usuarios as $u) {
    if (empty($u->id_persona)) {
        $u->id_persona = 'USR-' . Str::upper(Str::random(8));
        $u->save();
        $usersUpdated++;
    }
}

$equipos = Equipo::all();
foreach ($equipos as $e) {
    $equiposProcessed++;
    $exists = PropiedadEquipo::where('id_equipo', $e->id_equipo)->exists();
    if ($exists) { continue; }
    $assigned = $e->id_persona; // asignar por defecto al creador del equipo
    if (empty($assigned)) { continue; }
    $u = Usuario::where('id_persona', $assigned)->first();
    if (!$u) { $u = Usuario::where('_id', $assigned)->first(); }
    if (!$u) { continue; }
    if (empty($u->id_persona)) {
        $u->id_persona = 'USR-' . Str::upper(Str::random(8));
        $u->save();
        $usersUpdated++;
    }
    PropiedadEquipo::create([
        'id_propiedad' => 'PRP-' . Str::upper(Str::random(6)),
        'id_equipo' => $e->id_equipo,
        'id_persona' => $u->id_persona,
    ]);
    $propiedadesCreated++;
}

$props = PropiedadEquipo::all();
foreach ($props as $p) {
    $u = Usuario::where('id_persona', $p->id_persona)->first();
    if ($u) { continue; }
    $u = Usuario::where('_id', $p->id_persona)->first();
    if (!$u) { continue; }
    if (empty($u->id_persona)) {
        $u->id_persona = 'USR-' . Str::upper(Str::random(8));
        $u->save();
        $usersUpdated++;
    }
    $p->id_persona = $u->id_persona;
    $p->save();
    $propiedadesUpdated++;
}

$result = [
    'usuarios_actualizados' => $usersUpdated,
    'equipos_procesados' => $equiposProcessed,
    'propiedades_creadas' => $propiedadesCreated,
    'propiedades_actualizadas' => $propiedadesUpdated,
];

echo json_encode($result, JSON_PRETTY_PRINT) . PHP_EOL;
