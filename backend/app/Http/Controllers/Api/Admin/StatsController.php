<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ActivityLogResource;
use App\Models\User;
use App\Models\Task;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;

class StatsController extends Controller
{
    /**
     * Get platform-wide statistics.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        // Total registered users
        $totalUsers = User::count();

        // Total tasks across all users
        $totalTasks = Task::count();

        // Total completed tasks
        $completedTasks = Task::where('completed', true)->count();

        // Active users (logged in within last 30 days)
        $activeUsers = User::whereHas('activityLogs', function ($query) {
            $query->where('action', 'user.login')
                  ->where('created_at', '>=', now()->subDays(30));
        })->count();

        // Recent activity (last 10 entries)
        $recentActivity = ActivityLog::with('user')
            ->latest('created_at')
            ->take(10)
            ->get();

        $stats = [
            'totalUsers' => $totalUsers,
            'totalTasks' => $totalTasks,
            'completedTasks' => $completedTasks,
            'activeUsers' => $activeUsers,
            'recentActivity' => ActivityLogResource::collection($recentActivity),
        ];

        return response()->json([
            'data' => $stats,
        ]);
    }
}
