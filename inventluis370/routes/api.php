<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EmpresaController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\AutenticacionUsuarioController;
use App\Http\Controllers\EquipoController;
use App\Http\Controllers\PropiedadEquipoController;
use App\Http\Controllers\ServicioController;
use App\Http\Controllers\GarantiaController;
use App\Http\Controllers\RepuestoController;
use App\Http\Controllers\InventarioController;
use App\Http\Controllers\SolicitudRepuestoController;
use App\Http\Controllers\NotificacionController;
use App\Http\Controllers\ReporteController;

// Rutas públicas
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Rutas protegidas
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::apiResource('/empresas', EmpresaController::class);
    Route::apiResource('/usuarios', UsuarioController::class);
    Route::apiResource('/autenticacion-usuarios', AutenticacionUsuarioController::class);
    Route::apiResource('/equipos', EquipoController::class);
    Route::apiResource('/propiedad-equipos', PropiedadEquipoController::class);
    Route::apiResource('/servicios', ServicioController::class);
    Route::apiResource('/garantias', GarantiaController::class);
    Route::apiResource('/repuestos', RepuestoController::class);
    Route::apiResource('/inventario', InventarioController::class);
    Route::apiResource('/solicitud-repuestos', SolicitudRepuestoController::class);
    Route::apiResource('/notificaciones', NotificacionController::class);
    Route::apiResource('/reportes', ReporteController::class);
});