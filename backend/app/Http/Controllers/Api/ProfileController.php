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
}
