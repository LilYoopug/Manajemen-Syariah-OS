<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\StreamedResponse;

class UserController extends Controller
{
    protected ActivityLogService $activityLogService;

    /**
     * Create a new UserController instance.
     */
    public function __construct(ActivityLogService $activityLogService)
    {
        $this->activityLogService = $activityLogService;
    }

    /**
     * Get paginated list of users with optional search.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::query();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->paginate(15);

        return UserResource::collection($users)
            ->response()
            ->setStatusCode(200);
    }

    /**
     * Create a new user.
     *
     * @param StoreUserRequest $request
     * @return JsonResponse
     */
    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = User::create($request->validated());

        $this->activityLogService->logAdmin('admin.user_created', $user);

        return (new UserResource($user))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Update an existing user.
     *
     * @param UpdateUserRequest $request
     * @param User $user
     * @return JsonResponse
     */
    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $user->update($request->validated());

        $this->activityLogService->logAdmin('admin.user_updated', $user);

        return (new UserResource($user))
            ->response()
            ->setStatusCode(200);
    }

    /**
     * Delete a user and all their data.
     *
     * @param User $user
     * @return JsonResponse
     */
    public function destroy(User $user): JsonResponse
    {
        $this->activityLogService->logAdmin('admin.user_deleted', $user);

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully.',
        ]);
    }

    /**
     * Export all users as JSON file.
     *
     * @return StreamedResponse
     */
    public function export(): StreamedResponse
    {
        $users = User::select([
            'id',
            'name',
            'email',
            'role',
            'theme',
            'profile_picture',
            'zakat_rate',
            'preferred_akad',
            'calculation_method',
            'created_at',
            'updated_at',
        ])->get();

        $filename = 'users_export_' . now()->format('Y_m_d_His') . '.json';

        return response()->streamDownload(function () use ($users) {
            echo json_encode($users, JSON_PRETTY_PRINT);
        }, $filename, [
            'Content-Type' => 'application/json',
        ]);
    }
}
