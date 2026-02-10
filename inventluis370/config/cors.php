<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    // Permitir cualquier origen (web LAN y apps móviles)
    'allowed_origins' => ['*'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    // Exponer la expiración del token al cliente
    'exposed_headers' => ['X-Token-Expires-At'],

    'max_age' => 0,

    // Usamos tokens en Authorization; no es necesario credenciales
    'supports_credentials' => false,
];
