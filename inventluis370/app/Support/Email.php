<?php

namespace App\Support;

class Email
{
    public static function normalize(?string $email): ?string
    {
        if ($email === null) {
            return null;
        }

        $email = trim($email);
        if ($email === '') {
            return '';
        }

        if (function_exists('mb_strtolower')) {
            return mb_strtolower($email, 'UTF-8');
        }

        return strtolower($email);
    }
}
