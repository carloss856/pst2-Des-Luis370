<?php
header('Content-Type: text/html; charset=utf-8');
echo "<h2>Diagnóstico Ultraligero PHP</h2>";
echo "Versión de PHP activa: <strong>" . phpversion() . "</strong><br>";
echo "Extensión 'mongodb' cargada: <strong>" . (extension_loaded('mongodb') ? "<span style='color:green'>SÍ</span>" : "<span style='color:red'>NO</span>") . "</strong><br>";
echo "Carpeta actual: <code>" . __DIR__ . "</code><br>";
echo "Existe vendor/autoload.php en carpeta superior: <strong>" . (file_exists(__DIR__ . '/../../inventluis370/vendor/autoload.php') ? "<span style='color:green'>SÍ</span>" : "<span style='color:red'>NO</span>") . "</strong><br>";
