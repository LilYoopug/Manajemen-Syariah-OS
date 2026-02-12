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

    // User profile routes (Story 4.1)
    // Task routes (Epic 2)
    Route::get('/categories', [\App\Http\Controllers\Api\CategoryController::class, 'index']);
    Route::get('/tasks', [\App\Http\Controllers\Api\TaskController::class, 'index']);
    Route::post('/tasks', [\App\Http\Controllers\Api\TaskController::class, 'store']);
    Route::get('/tasks/{id}', [\App\Http\Controllers\Api\TaskController::class, 'show']);
    Route::put('/tasks/{id}', [\App\Http\Controllers\Api\TaskController::class, 'update']);
    Route::patch('/tasks/{id}/toggle', [\App\Http\Controllers\Api\TaskController::class, 'toggle']);
    Route::delete('/tasks/{id}', [\App\Http\Controllers\Api\TaskController::class, 'destroy']);

    // Dashboard routes (Epic 3)
    // Directory routes (Epic 5)
    // Tools routes (Epic 6)
    // AI routes (Epic 7)

    // Admin routes (Epic 8)
    Route::middleware('admin')->prefix('admin')->group(function () {
        // Admin stats, logs, users, tools management
    });
});
