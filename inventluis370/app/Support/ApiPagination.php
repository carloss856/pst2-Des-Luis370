<?php

namespace App\Support;

use Illuminate\Http\Request;

class ApiPagination
{
    public static function enabled(Request $request): bool
    {
        return $request->query('page') !== null || $request->query('per_page') !== null;
    }

    /**
     * @return array{page:int,per_page:int}
     */
    public static function normalize(Request $request, int $defaultPerPage = 25, int $maxPerPage = 100): array
    {
        $page = (int) $request->query('page', 1);
        if ($page < 1) {
            $page = 1;
        }

        $perPage = (int) $request->query('per_page', $defaultPerPage);
        if ($perPage < 1) {
            $perPage = 1;
        }
        if ($perPage > $maxPerPage) {
            $perPage = $maxPerPage;
        }

        return ['page' => $page, 'per_page' => $perPage];
    }

    /**
     * Responde con paginación si llegan query params page/per_page.
     * Mantiene compatibilidad: si no hay page/per_page, devuelve lista completa (array).
     *
     * @param  mixed  $query  Eloquent/Mongo Builder con filtros ya aplicados
     */
    public static function respond(Request $request, $query, ?callable $map = null, int $defaultPerPage = 25, int $maxPerPage = 100)
    {
        if (!self::enabled($request)) {
            $items = $query->get();
            if ($map) {
                $items = $items->map($map);
            }
            return response()->json($items);
        }

        $norm = self::normalize($request, $defaultPerPage, $maxPerPage);
        $page = $norm['page'];
        $perPage = $norm['per_page'];

        $countQuery = clone $query;
        $total = (int) $countQuery->count();

        $items = $query->skip(($page - 1) * $perPage)->take($perPage)->get();
        if ($map) {
            $items = $items->map($map);
        }

        $totalPages = (int) max(1, (int) ceil($total / $perPage));

        return response()->json([
            'data' => $items,
            'meta' => [
                'page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'total_pages' => $totalPages,
                'has_prev' => $page > 1,
                'has_next' => $page < $totalPages,
            ],
        ]);
    }
}
