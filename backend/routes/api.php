<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Health check endpoint
Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

// Auth routes (public)
Route::prefix('auth')->group(function () {
    Route::post('/register', [\App\Http\Controllers\Api\AuthController::class, 'register']);
    Route::post('/login', [\App\Http\Controllers\Api\AuthController::class, 'login']);
});

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes (protected)
    Route::post('/auth/logout', [\App\Http\Controllers\Api\AuthController::class, 'logout']);

    // User profile routes (Story 4.1, 4.2, 4.3)
    Route::get('/profile', [\App\Http\Controllers\Api\ProfileController::class, 'show']);
    Route::put('/profile', [\App\Http\Controllers\Api\ProfileController::class, 'update']);
    Route::post('/profile/export', [\App\Http\Controllers\Api\ProfileController::class, 'export']);
    Route::post('/profile/reset', [\App\Http\Controllers\Api\ProfileController::class, 'reset']);

    // Task routes (Epic 2)
    Route::get('/categories', [\App\Http\Controllers\Api\CategoryController::class, 'index']);
    Route::get('/tasks', [\App\Http\Controllers\Api\TaskController::class, 'index']);
    Route::post('/tasks', [\App\Http\Controllers\Api\TaskController::class, 'store']);
    Route::get('/tasks/{id}', [\App\Http\Controllers\Api\TaskController::class, 'show']);
    Route::put('/tasks/{id}', [\App\Http\Controllers\Api\TaskController::class, 'update']);
    Route::patch('/tasks/{id}/toggle', [\App\Http\Controllers\Api\TaskController::class, 'toggle']);
    Route::delete('/tasks/{id}', [\App\Http\Controllers\Api\TaskController::class, 'destroy']);
    Route::put('/tasks/{id}/history/{entryId}', [\App\Http\Controllers\Api\TaskController::class, 'updateHistory']);
    Route::delete('/tasks/{id}/history/{entryId}', [\App\Http\Controllers\Api\TaskController::class, 'destroyHistory']);

    // Dashboard routes (Epic 3)
    Route::get('/dashboard', [\App\Http\Controllers\Api\DashboardController::class, 'index']);

    // Directory routes (Epic 5)
    Route::get('/directory', [\App\Http\Controllers\Api\DirectoryController::class, 'index']);
    Route::post('/directory', [\App\Http\Controllers\Api\DirectoryController::class, 'store']);
    Route::put('/directory/{id}', [\App\Http\Controllers\Api\DirectoryController::class, 'update']);
    Route::delete('/directory/{id}', [\App\Http\Controllers\Api\DirectoryController::class, 'destroy']);

    // Tools routes (Epic 6)
    Route::get('/tools', [\App\Http\Controllers\Api\ToolController::class, 'index']);
    Route::get('/tools/{id}', [\App\Http\Controllers\Api\ToolController::class, 'show']);

    // AI routes (Epic 7)
    Route::post('/ai/chat', [\App\Http\Controllers\Api\AiController::class, 'chat']);
    Route::post('/ai/generate-plan', [\App\Http\Controllers\Api\AiController::class, 'generatePlan']);
    Route::post('/ai/insight', [\App\Http\Controllers\Api\AiController::class, 'insight']);

    // Admin routes (Epic 8)
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/stats', [\App\Http\Controllers\Api\Admin\StatsController::class, 'index']);
        Route::get('/logs', [\App\Http\Controllers\Api\Admin\ActivityLogController::class, 'index']);
        Route::get('/users', [\App\Http\Controllers\Api\Admin\UserController::class, 'index']);
        Route::post('/users', [\App\Http\Controllers\Api\Admin\UserController::class, 'store']);
        Route::put('/users/{user}', [\App\Http\Controllers\Api\Admin\UserController::class, 'update']);
        Route::delete('/users/{user}', [\App\Http\Controllers\Api\Admin\UserController::class, 'destroy']);
    });
});
