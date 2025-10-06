<?php

namespace App\Http\Middleware;

use Closure;

class ForceUtf8
{
    public function handle($request, Closure $next)
    {
        $input = $request->all();

        array_walk_recursive($input, function (&$value) {
            if (is_string($value)) {
                if (!mb_check_encoding($value, 'UTF-8')) {
                    $value = utf8_encode($value);
                } else {
                    $value = mb_convert_encoding($value, 'UTF-8', 'UTF-8');
                }
            }
        });

        $request->merge($input);
        $response = $next($request);

        // Asegura que la respuesta también sea UTF-8
        if (method_exists($response, 'setCharset')) {
            $response->setCharset('UTF-8');
        }
        $response->headers->set('Content-Type', 'application/json; charset=UTF-8');

        return $response;
    }
}