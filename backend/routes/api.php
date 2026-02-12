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
    // Registration and login will be added in Story 1.2 and 1.3
});

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    // User profile routes (Story 4.1)
    // Task routes (Epic 2)
    // Dashboard routes (Epic 3)
    // Directory routes (Epic 5)
    // Tools routes (Epic 6)
    // AI routes (Epic 7)

    // Admin routes (Epic 8)
    Route::middleware('admin')->prefix('admin')->group(function () {
        // Admin stats, logs, users, tools management
    });
});
