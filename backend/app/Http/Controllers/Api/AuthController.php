<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

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

    /**
     * Login an existing user.
     *
     * @param LoginRequest $request
     * @return JsonResponse
     */
    public function login(LoginRequest $request): JsonResponse
    {
        // Find user by email
        $user = User::where('email', $request->email)->first();

        // Validate credentials
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials',
            ], 401);
        }

        // Wrap token creation and activity logging in transaction for consistency
        $token = DB::transaction(function () use ($user): string {
            // Create Sanctum bearer token
            $token = $user->createToken(self::TOKEN_NAME)->plainTextToken;

            // Log the login activity
            $this->activityLogService->logAuth('user.login', $user->id);

            return $token;
        });

        // Return response with token and user data
        return response()->json([
            'message' => 'Login successful',
            'token' => $token,
            'data' => new UserResource($user),
        ]);
    }

    /**
     * Logout the authenticated user.
     *
     * @return JsonResponse
     */
    public function logout(): JsonResponse
    {
        $user = request()->user();

        // Wrap token deletion and activity logging in transaction for consistency
        DB::transaction(function () use ($user): void {
            // Delete the current access token
            $user->currentAccessToken()->delete();

            // Log the logout activity
            $this->activityLogService->logAuth('user.logout', $user->id);
        });

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }
}
