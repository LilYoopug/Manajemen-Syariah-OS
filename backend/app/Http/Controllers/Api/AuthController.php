<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

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

    /**
     * Send a password reset link to the user's email.
     *
     * @param ForgotPasswordRequest $request
     * @return JsonResponse
     */
    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        // Send password reset link
        $status = Password::sendResetLink($request->only('email'));

        // Always return success message to prevent email enumeration
        return response()->json([
            'message' => 'If the email exists in our system, a reset link has been sent.',
        ]);
    }

    /**
     * Reset the user's password using the token from email.
     *
     * @param ResetPasswordRequest $request
     * @return JsonResponse
     */
    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                // Log the password reset activity
                $this->activityLogService->logAuth('user.password_reset', $user->id);
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json([
                'message' => 'Password has been reset successfully.',
            ]);
        }

        return response()->json([
            'message' => 'Invalid or expired reset token.',
        ], 400);
    }

    /**
     * Verify the user's email address.
     *
     * @param \Illuminate\Http\Request $request
     * @param int $id
     * @param string $hash
     * @return JsonResponse
     */
    public function verifyEmail(\Illuminate\Http\Request $request, int $id, string $hash): JsonResponse
    {
        $user = User::findOrFail($id);

        // Verify the hash
        if (!hash_equals(
            sha1($user->getEmailForVerification()),
            $hash
        )) {
            return response()->json([
                'message' => 'Invalid verification link.',
            ], 400);
        }

        // Check if already verified
        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Email already verified.',
            ]);
        }

        // Mark as verified
        if ($user->markEmailAsVerified()) {
            $this->activityLogService->logAuth('user.email_verified', $user->id);
        }

        return response()->json([
            'message' => 'Email verified successfully.',
        ]);
    }

    /**
     * Resend the email verification notification.
     *
     * @param \Illuminate\Http\Request $request
     * @return JsonResponse
     */
    public function resendVerification(\Illuminate\Http\Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            // Return success anyway to prevent email enumeration
            return response()->json([
                'message' => 'If the email exists and is not verified, a verification link has been sent.',
            ]);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Email already verified.',
            ]);
        }

        $user->sendEmailVerificationNotification();

        return response()->json([
            'message' => 'Verification link sent.',
        ]);
    }
}
