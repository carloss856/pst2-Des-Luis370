<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    // Producción: solo el frontend. Añade más orígenes si hace falta.
    'allowed_origins' => [
        'https://luis370.careilabs.store',
        'http://localhost:5173',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    // Exponer la expiración del token al cliente
    'exposed_headers' => ['X-Token-Expires-At'],

    'max_age' => 0,

    // Usamos tokens en Authorization; no es necesario credenciales
    'supports_credentials' => false,
];
