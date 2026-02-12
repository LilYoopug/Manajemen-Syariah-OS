<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LogoutTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test successful logout returns success message.
     */
    public function test_user_can_logout_successfully(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/auth/logout');

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Logged out successfully',
            ]);
    }

    /**
     * Test token is invalidated after logout.
     */
    public function test_token_is_invalidated_after_logout(): void
    {
        $user = User::factory()->create();

        // Login to get a token
        $loginResponse = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password', // UserFactory default password
        ]);

        $token = $loginResponse->json('token');

        // Logout with the token
        $logoutResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/auth/logout');

        $logoutResponse->assertStatus(200);

        // Try to use the same token again - should fail
        $retryResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/auth/logout');

        $retryResponse->assertStatus(401);
    }

    /**
     * Test activity log is created on logout.
     */
    public function test_activity_log_is_created_on_logout(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/auth/logout');

        $response->assertStatus(200);

        // Verify activity log was created
        $this->assertDatabaseHas('activity_logs', [
            'user_id' => $user->id,
            'action' => 'user.logout',
        ]);
    }

    /**
     * Test unauthenticated request returns 401.
     */
    public function test_logout_fails_without_authentication(): void
    {
        $response = $this->postJson('/api/auth/logout');

        $response->assertStatus(401)
            ->assertJson([
                'message' => 'Unauthenticated.',
            ]);
    }

    /**
     * Test logout with invalid token returns 401.
     */
    public function test_logout_fails_with_invalid_token(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer invalid-token')
            ->postJson('/api/auth/logout');

        $response->assertStatus(401);
    }

    /**
     * Test logout only invalidates current token, not all user tokens.
     */
    public function test_logout_only_invalidates_current_token(): void
    {
        $user = User::factory()->create();

        // Create two tokens (simulating two devices)
        $token1 = $user->createToken('device-1')->plainTextToken;
        $token2 = $user->createToken('device-2')->plainTextToken;

        // Logout with token1
        $logoutResponse = $this->withHeader('Authorization', 'Bearer ' . $token1)
            ->postJson('/api/auth/logout');

        $logoutResponse->assertStatus(200);

        // Token1 should be invalid now
        $retryResponse1 = $this->withHeader('Authorization', 'Bearer ' . $token1)
            ->postJson('/api/auth/logout');
        $retryResponse1->assertStatus(401);

        // Token2 should still be valid
        $retryResponse2 = $this->withHeader('Authorization', 'Bearer ' . $token2)
            ->postJson('/api/auth/logout');
        $retryResponse2->assertStatus(200);
    }
}
