<?php

namespace App\Support;

final class Role
{
    /**
     * Normaliza el rol/tipo a uno de los valores estándar usados por permisos.
     *
     * Valores estándar: Administrador, Gerente, Técnico, Cliente, Empresa.
     */
    public static function normalize(?string $role): ?string
    {
        if (!$role) {
            return null;
        }

        $role = trim((string) $role);
        if ($role === '') {
            return null;
        }

        $map = [
            'tecnico' => 'Técnico',
            'técnico' => 'Técnico',
            'Tecnico' => 'Técnico',
            'Técnico' => 'Técnico',

            'admin' => 'Administrador',
            'Admin' => 'Administrador',
            'superadmin' => 'Administrador',
            'SuperAdmin' => 'Administrador',
            'administrador' => 'Administrador',
            'Administrador' => 'Administrador',

            'gerente' => 'Gerente',
            'Gerente' => 'Gerente',

            'cliente' => 'Cliente',
            'Cliente' => 'Cliente',

            'empresa' => 'Empresa',
            'Empresa' => 'Empresa',
        ];

        $roleLowerNoAccent = strtr(mb_strtolower($role, 'UTF-8'), [
            'á' => 'a', 'é' => 'e', 'í' => 'i', 'ó' => 'o', 'ú' => 'u', 'ñ' => 'n',
        ]);

        return $map[$role] ?? $map[$roleLowerNoAccent] ?? $role;
    }
}
