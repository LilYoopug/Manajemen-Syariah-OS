<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Task\StoreTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class TaskController extends Controller
{
    /**
     * @var ActivityLogService
     */
    protected ActivityLogService $activityLogService;

    /**
     * Create a new TaskController instance.
     */
    public function __construct(ActivityLogService $activityLogService)
    {
        $this->activityLogService = $activityLogService;
    }

    /**
     * Store a newly created task.
     *
     * @param StoreTaskRequest $request
     * @return JsonResponse
     */
    public function store(StoreTaskRequest $request): JsonResponse
    {
        $user = $request->user();

        // Create task in transaction with activity logging
        $task = DB::transaction(function () use ($request, $user): Task {
            $task = Task::create([
                'user_id' => $user->id,
                'text' => $request->text,
                'category' => $request->category,
                'reset_cycle' => $request->resetCycle,
                'has_limit' => $request->hasLimit,
                'target_value' => $request->targetValue,
                'unit' => $request->unit,
                'increment_value' => $request->incrementValue ?? 1,
                'per_check_enabled' => $request->perCheckEnabled,
                'completed' => false,
                'progress' => 0,
                'current_value' => 0,
            ]);

            // Log the task creation activity
            $this->activityLogService->logCrud('task.created', $task);

            return $task;
        });

        return response()->json([
            'message' => 'Task created successfully',
            'data' => new TaskResource($task),
        ], 201);
    }
}
