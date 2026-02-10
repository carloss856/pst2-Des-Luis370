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
use App\Http\Controllers\RmaController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\TarifaServicioController;
use App\Http\Controllers\MaintenanceController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\StatsController;
use App\Http\Controllers\PermissionsController;
use App\Http\Controllers\RbacController;

// Rutas públicas
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/password/forgot', [PasswordResetController::class, 'requestToken']);
Route::post('/password/verify', [PasswordResetController::class, 'verifyToken']);
Route::post('/password/reset', [PasswordResetController::class, 'resetPassword']);

// Rutas protegidas
Route::middleware([\App\Http\Middleware\TokenAuth::class, \App\Http\Middleware\RolePermission::class])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/token/extend', [AuthController::class, 'extend']);
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard.index');

    // RBAC efectivo para el usuario autenticado (para ocultar menú/botones en el Front)
    Route::get('/rbac', [RbacController::class, 'me'])->name('rbac.me');

    // Estadísticas (widgets)
    Route::get('/stats/{module}', [StatsController::class, 'show'])->name('stats.show');
    Route::post('/stats/batch', [StatsController::class, 'batch'])->name('stats.batch');

    // Gestión de permisos RBAC (solo Administrador/Gerente)
    Route::get('/permissions', [PermissionsController::class, 'show'])->name('permissions.index');
    Route::put('/permissions', [PermissionsController::class, 'update'])->name('permissions.update');
    Route::post('/permissions/reset', [PermissionsController::class, 'reset'])->name('permissions.reset');

    // Permisos RBAC por usuario (override individual)
    Route::get('/permissions/user/{id}', [PermissionsController::class, 'showUser'])->name('permissions.user.show');
    Route::put('/permissions/user/{id}', [PermissionsController::class, 'updateUser'])->name('permissions.user.update');
    Route::post('/permissions/user/{id}/reset', [PermissionsController::class, 'resetUser'])->name('permissions.user.reset');

    Route::apiResource('/empresas', EmpresaController::class);
    Route::apiResource('/usuarios', UsuarioController::class);
    Route::get('usuarios/{id}/notificaciones', [UsuarioController::class, 'getNotificacionesConfig'])->name('usuarios.notifications.get');
    Route::post('usuarios/{id}/notificaciones', [UsuarioController::class, 'setNotificacionesConfig'])->name('usuarios.notifications.set');
    Route::apiResource('/autenticacion-usuarios', AutenticacionUsuarioController::class);
    Route::apiResource('/equipos', EquipoController::class);
    Route::apiResource('/propiedad-equipos', PropiedadEquipoController::class);
    Route::get('propiedad-equipo/{id_equipo}', [PropiedadEquipoController::class, 'showByEquipo']);
    Route::apiResource('/servicios', ServicioController::class);
    // Partes de trabajo por servicio (horas trabajadas)
    Route::get('/servicios/{id}/partes', [ServicioController::class, 'listPartes'])->name('servicios.partes.index');
    Route::post('/servicios/{id}/partes', [ServicioController::class, 'addParte'])->name('servicios.partes.store');
    Route::put('/servicios/{id}/partes/{id_parte}', [ServicioController::class, 'updateParte'])->name('servicios.partes.update');
    Route::delete('/servicios/{id}/partes/{id_parte}', [ServicioController::class, 'deleteParte'])->name('servicios.partes.destroy');
    Route::apiResource('/garantias', GarantiaController::class);
    Route::apiResource('/repuestos', RepuestoController::class);
    Route::apiResource('/inventario', InventarioController::class);
    Route::apiResource('/solicitud-repuestos', SolicitudRepuestoController::class);

    // Notificaciones: leído/no leído
    Route::patch('/notificaciones/{id}/leida', [NotificacionController::class, 'setLeida'])->name('notificaciones.setLeida');
    Route::post('/notificaciones/marcar-todas-leidas', [NotificacionController::class, 'markAllAsRead'])->name('notificaciones.markAllAsRead');
    Route::apiResource('/notificaciones', NotificacionController::class);
    Route::apiResource('/reportes', ReporteController::class);
    Route::apiResource('/rma', RmaController::class);
    Route::apiResource('/tarifas-servicio', TarifaServicioController::class);
    Route::get('/tarifas-servicio/{id}/historial', [TarifaServicioController::class, 'history'])->name('tarifas-servicio.historial.index');
    // Mantenimiento (solo Admin/Gerente)
    Route::post('/maintenance/backfill-assignments', [MaintenanceController::class, 'backfillAssignments'])->name('maintenance.backfill');
});
