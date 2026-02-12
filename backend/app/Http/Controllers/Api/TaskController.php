<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Task\StoreTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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
     * Get the authenticated user's tasks with optional filtering.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $query = $request->user()->tasks();

        // Filter by category
        $query->when($request->filled('category'), function ($q) use ($request) {
            $q->where('category', $request->category);
        });

        // Filter by text search
        $query->when($request->filled('search'), function ($q) use ($request) {
            $q->where('text', 'like', '%' . $request->search . '%');
        });

        // Filter by reset cycle
        $query->when($request->filled('cycle'), function ($q) use ($request) {
            $q->where('reset_cycle', $request->cycle);
        });

        $tasks = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'data' => TaskResource::collection($tasks),
        ]);
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
