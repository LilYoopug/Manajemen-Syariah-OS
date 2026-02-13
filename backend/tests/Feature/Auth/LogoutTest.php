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

        // Create a real token via the login endpoint
        $loginResponse = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password', // UserFactory default password
        ]);

        $loginResponse->assertStatus(200);
        $token = $loginResponse->json('token');

        // Verify token works
        $profileResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/profile');
        $profileResponse->assertStatus(200);

        // Logout with the token
        $logoutResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/auth/logout');

        $logoutResponse->assertStatus(200);

        // Try to use the same token again - should fail with 401
        // Note: After logout, the token is deleted from the database
        // But Laravel Sanctum's transient tokens from actingAs() behave differently
        // We need to verify the token was actually deleted
        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $user->id,
            'name' => 'auth-token',
        ]);
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

        // Verify both tokens work
        $profile1 = $this->withHeader('Authorization', 'Bearer ' . $token1)
            ->getJson('/api/profile');
        $profile1->assertStatus(200);

        $profile2 = $this->withHeader('Authorization', 'Bearer ' . $token2)
            ->getJson('/api/profile');
        $profile2->assertStatus(200);

        // Logout with token1
        $logoutResponse = $this->withHeader('Authorization', 'Bearer ' . $token1)
            ->postJson('/api/auth/logout');

        $logoutResponse->assertStatus(200);

        // Verify token1 was deleted from database
        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $user->id,
            'name' => 'device-1',
        ]);

        // Verify token2 still exists in database
        $this->assertDatabaseHas('personal_access_tokens', [
            'tokenable_id' => $user->id,
            'name' => 'device-2',
        ]);

        // Token2 should still work
        $retryResponse2 = $this->withHeader('Authorization', 'Bearer ' . $token2)
            ->getJson('/api/profile');
        $retryResponse2->assertStatus(200);
    }
}
