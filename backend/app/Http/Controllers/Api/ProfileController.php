<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Profile\UpdateProfileRequest;
use App\Http\Resources\ProfileResource;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ProfileController extends Controller
{
    /**
     * @var ActivityLogService
     */
    protected ActivityLogService $activityLogService;

    /**
     * Create a new ProfileController instance.
     */
    public function __construct(ActivityLogService $activityLogService)
    {
        $this->activityLogService = $activityLogService;
    }

    /**
     * Get the authenticated user's profile.
     *
     * @return JsonResponse
     */
    public function show(): JsonResponse
    {
        $user = request()->user();

        return response()->json([
            'data' => new ProfileResource($user),
        ]);
    }

    /**
     * Update the authenticated user's profile.
     *
     * @param UpdateProfileRequest $request
     * @return JsonResponse
     */
    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();

        // Get only the validated fields that are present in the request
        $validatedData = $request->validated();

        // Map camelCase to snake_case for database columns
        // Use array_key_exists() to handle null values correctly (isset() returns false for null)
        $fieldMap = [
            'name' => 'name',
            'profilePicture' => 'profile_picture',
            'theme' => 'theme',
            'zakatRate' => 'zakat_rate',
            'preferredAkad' => 'preferred_akad',
            'calculationMethod' => 'calculation_method',
        ];

        $updateData = [];
        foreach ($fieldMap as $camelCase => $snakeCase) {
            if (array_key_exists($camelCase, $validatedData)) {
                $updateData[$snakeCase] = $validatedData[$camelCase];
            }
        }

        // Wrap in transaction for consistency with other controllers
        DB::transaction(function () use ($user, $updateData): void {
            // Update only provided fields
            if (!empty($updateData)) {
                $user->update($updateData);
            }

            // Log the profile update activity
            $this->activityLogService->log('user.profile_updated', $user->id);
        });

        return response()->json([
            'data' => new ProfileResource($user->fresh()),
        ]);
    }

    /**
     * Export all user data as a downloadable JSON file.
     *
     * @return JsonResponse
     */
    public function export(): JsonResponse
    {
        $user = request()->user();

        // Gather all user data scoped by ownership
        $tasks = $user->tasks()->with('history')->get();
        $categories = $user->categories()->get();

        // Build export data structure
        $exportData = [
            'exportedAt' => now()->toISOString(),
            'profile' => [
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'theme' => $user->theme,
                'profilePicture' => $user->profile_picture,
                'zakatRate' => $user->zakat_rate,
                'preferredAkad' => $user->preferred_akad,
                'calculationMethod' => $user->calculation_method,
            ],
            'tasks' => $tasks->map(function ($task) {
                return [
                    'id' => $task->id,
                    'text' => $task->text,
                    'completed' => $task->completed,
                    'category' => $task->category,
                    'progress' => $task->progress,
                    'hasLimit' => $task->has_limit,
                    'currentValue' => $task->current_value,
                    'targetValue' => $task->target_value,
                    'unit' => $task->unit,
                    'resetCycle' => $task->reset_cycle,
                    'createdAt' => $task->created_at?->toISOString(),
                    'updatedAt' => $task->updated_at?->toISOString(),
                    'history' => $task->history->map(function ($entry) {
                        return [
                            'id' => $entry->id,
                            'value' => $entry->value,
                            'note' => $entry->note,
                            'timestamp' => $entry->timestamp?->toISOString(),
                        ];
                    })->toArray(),
                ];
            })->toArray(),
            'categories' => $categories->map(function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                ];
            })->toArray(),
        ];

        // Log the export activity
        DB::transaction(function () use ($user): void {
            $this->activityLogService->log('user.data_exported', $user->id);
        });

        // Return JSON response with download headers
        $filename = 'user-data-' . now()->format('Y-m-d-His') . '.json';

        return response()->json($exportData)
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"')
            ->header('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
}
