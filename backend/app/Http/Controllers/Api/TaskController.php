<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Task\StoreTaskRequest;
use App\Http\Requests\Task\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use App\Models\TaskHistory;
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

    /**
     * Update the specified task.
     *
     * @param UpdateTaskRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(UpdateTaskRequest $request, int $id): JsonResponse
    {
        $user = $request->user();

        // Find task scoped to authenticated user
        $task = $user->tasks()->findOrFail($id);

        // Update task in transaction with activity logging
        DB::transaction(function () use ($request, $task): void {
            $updateData = [];

            if ($request->has('text')) {
                $updateData['text'] = $request->text;
            }

            if ($request->has('category')) {
                $updateData['category'] = $request->category;
            }

            if ($request->has('resetCycle')) {
                $updateData['reset_cycle'] = $request->resetCycle;
            }

            if ($request->has('hasLimit')) {
                $updateData['has_limit'] = $request->hasLimit;
            }

            if ($request->has('targetValue')) {
                $updateData['target_value'] = $request->targetValue;
            }

            if ($request->has('unit')) {
                $updateData['unit'] = $request->unit;
            }

            if ($request->has('incrementValue')) {
                $updateData['increment_value'] = $request->incrementValue;
            }

            if ($request->has('perCheckEnabled')) {
                $updateData['per_check_enabled'] = $request->perCheckEnabled;
            }

            if (!empty($updateData)) {
                $task->update($updateData);

                // Log the task update activity
                $this->activityLogService->logCrud('task.updated', $task);
            }
        });

        return response()->json([
            'message' => 'Task updated successfully',
            'data' => new TaskResource($task->fresh()),
        ]);
    }

    /**
     * Remove the specified task.
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        // Find task scoped to authenticated user
        $task = $user->tasks()->findOrFail($id);

        // Delete task in transaction with activity logging
        DB::transaction(function () use ($task): void {
            // Log the task deletion activity before deletion
            $this->activityLogService->logCrud('task.deleted', $task);

            // Delete task (histories will cascade delete via foreign key)
            $task->delete();
        });

        return response()->json([
            'message' => 'Task deleted successfully',
        ]);
    }

    /**
     * Get the specified task with its history.
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        // Find task scoped to authenticated user with history
        $task = $user->tasks()->with('history')->findOrFail($id);

        return response()->json([
            'data' => new TaskResource($task),
        ]);
    }

    /**
     * Toggle the task completion status.
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function toggle(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        // Find task scoped to authenticated user
        $task = $user->tasks()->findOrFail($id);

        // Toggle task in transaction with history recording
        DB::transaction(function () use ($task): void {
            if ($task->has_limit) {
                // Incremental progress mode
                $incrementValue = $task->increment_value ?? 1;
                $newValue = $task->current_value + $incrementValue;
                $targetValue = $task->target_value ?? 0;

                // Calculate progress
                $progress = $targetValue > 0 ? min(100, (int) round(($newValue / $targetValue) * 100)) : 0;

                // Check if target reached
                $completed = $targetValue > 0 && $newValue >= $targetValue;

                $task->update([
                    'current_value' => $newValue,
                    'progress' => $progress,
                    'completed' => $completed,
                ]);

                // Create history entry
                TaskHistory::create([
                    'task_id' => $task->id,
                    'value' => $incrementValue,
                    'note' => null,
                    'timestamp' => now(),
                ]);

                // Log activity
                $action = $completed ? 'task.completed' : 'task.progressed';
                $this->activityLogService->logCrud($action, $task);
            } else {
                // Binary toggle mode
                $newCompleted = !$task->completed;

                $task->update([
                    'completed' => $newCompleted,
                    'progress' => $newCompleted ? 100 : 0,
                ]);

                // Create history entry
                TaskHistory::create([
                    'task_id' => $task->id,
                    'value' => $newCompleted ? 1 : 0,
                    'note' => null,
                    'timestamp' => now(),
                ]);

                // Log activity
                $action = $newCompleted ? 'task.completed' : 'task.uncompleted';
                $this->activityLogService->logCrud($action, $task);
            }
        });

        return response()->json([
            'message' => 'Task toggled successfully',
            'data' => new TaskResource($task->fresh()->load('history')),
        ]);
    }
}
