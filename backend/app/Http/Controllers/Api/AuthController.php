<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    /**
     * Token name for Sanctum authentication.
     */
    private const TOKEN_NAME = 'auth-token';

    /**
     * @var ActivityLogService
     */
    protected ActivityLogService $activityLogService;

    /**
     * Create a new AuthController instance.
     */
    public function __construct(ActivityLogService $activityLogService)
    {
        $this->activityLogService = $activityLogService;
    }

    /**
     * Register a new user.
     *
     * @param RegisterRequest $request
     * @return JsonResponse
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        // Wrap in transaction to ensure atomicity of user creation and activity logging
        return DB::transaction(function () use ($request): JsonResponse {
            // Create user with validated data (password hashed via model cast)
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => $request->password,
            ]);

            // Create Sanctum bearer token
            $token = $user->createToken(self::TOKEN_NAME)->plainTextToken;

            // Log the registration activity
            $this->activityLogService->logAuth('user.registered', $user->id);

            // Return response with token and user data
            return response()->json([
                'message' => 'Registration successful',
                'token' => $token,
                'data' => new UserResource($user),
            ], 201);
        });
    }
}
