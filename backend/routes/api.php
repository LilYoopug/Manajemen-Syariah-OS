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

// Islamic source routes (public - external API proxies)
Route::prefix('islamic')->group(function () {
    Route::get('/surahs', [\App\Http\Controllers\Api\IslamicSourceController::class, 'getSurahs']);
    Route::get('/surahs/{number}', [\App\Http\Controllers\Api\IslamicSourceController::class, 'getSurah']);
    Route::get('/surahs/{surah}/verse/{verse}', [\App\Http\Controllers\Api\IslamicSourceController::class, 'getVerse']);
    Route::get('/hadith-books', [\App\Http\Controllers\Api\IslamicSourceController::class, 'getHadithBooks']);
    Route::get('/hadith/{book}/{number}', [\App\Http\Controllers\Api\IslamicSourceController::class, 'getHadith']);
});

// Auth routes (public) - with rate limiting for security
Route::prefix('auth')->middleware('throttle:5,1')->group(function () {
    Route::post('/register', [\App\Http\Controllers\Api\AuthController::class, 'register']);
    Route::post('/login', [\App\Http\Controllers\Api\AuthController::class, 'login']);
    Route::post('/email/verification-notification', [\App\Http\Controllers\Api\AuthController::class, 'resendVerification']);
    Route::get('/email/verify/{id}/{hash}', [\App\Http\Controllers\Api\AuthController::class, 'verifyEmail'])
        ->name('verification.verify');
});

// Password reset routes (public) - with rate limiting
Route::prefix('auth')->middleware('throttle:3,1')->group(function () {
    Route::post('/forgot-password', [\App\Http\Controllers\Api\AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [\App\Http\Controllers\Api\AuthController::class, 'resetPassword']);
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
    Route::post('/tasks/{id}/progress', [\App\Http\Controllers\Api\TaskController::class, 'addProgress']);

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
        Route::get('/stats/export', [\App\Http\Controllers\Api\Admin\StatsController::class, 'export']);
        Route::get('/stats/user-growth', [\App\Http\Controllers\Api\Admin\StatsController::class, 'userGrowth']);
        Route::get('/stats', [\App\Http\Controllers\Api\Admin\StatsController::class, 'index']);
        Route::get('/logs', [\App\Http\Controllers\Api\Admin\ActivityLogController::class, 'index']);
        Route::get('/users/export', [\App\Http\Controllers\Api\Admin\UserController::class, 'export']);
        Route::get('/users', [\App\Http\Controllers\Api\Admin\UserController::class, 'index']);
        Route::post('/users', [\App\Http\Controllers\Api\Admin\UserController::class, 'store']);
        Route::put('/users/{user}', [\App\Http\Controllers\Api\Admin\UserController::class, 'update']);
        Route::delete('/users/{user}', [\App\Http\Controllers\Api\Admin\UserController::class, 'destroy']);
        Route::get('/tools/export', [\App\Http\Controllers\Api\Admin\ToolController::class, 'export']);
        Route::get('/tools', [\App\Http\Controllers\Api\Admin\ToolController::class, 'index']);
        Route::post('/tools', [\App\Http\Controllers\Api\Admin\ToolController::class, 'store']);
        Route::put('/tools/{tool}', [\App\Http\Controllers\Api\Admin\ToolController::class, 'update']);
        Route::delete('/tools/{tool}', [\App\Http\Controllers\Api\Admin\ToolController::class, 'destroy']);
    });
});
