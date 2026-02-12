<?php

namespace Tests\Feature\Middleware;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test admin user can access protected routes.
     */
    public function test_admin_user_can_access_protected_routes(): void
    {
        $admin = User::factory()->admin()->create();
        Sanctum::actingAs($admin);

        // Create a test route with admin middleware
        $response = $this->getJson('/api/admin/test');

        // Since no actual admin routes exist yet, we expect 404 (route not found)
        // but NOT 401 or 403 (middleware passed)
        $response->assertStatus(404);
    }

    /**
     * Test regular user gets 403 Forbidden.
     */
    public function test_regular_user_gets_403_forbidden(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/admin/test');

        $response->assertStatus(403)
            ->assertJson([
                'message' => 'Unauthorized',
            ]);
    }

    /**
     * Test unauthenticated request gets 401 Unauthorized.
     */
    public function test_unauthenticated_request_gets_401_unauthorized(): void
    {
        $response = $this->getJson('/api/admin/test');

        $response->assertStatus(401)
            ->assertJson([
                'message' => 'Unauthenticated.',
            ]);
    }

    /**
     * Test admin middleware allows request to proceed for admin role.
     */
    public function test_middleware_allows_admin_role(): void
    {
        $admin = User::factory()->admin()->create();
        Sanctum::actingAs($admin);

        // Use the actual route structure - any /api/admin/* route
        $response = $this->getJson('/api/admin/statistics');

        // Route doesn't exist yet, but middleware should pass
        $response->assertStatus(404);
    }

    /**
     * Test admin middleware blocks user role.
     */
    public function test_middleware_blocks_user_role(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/admin/statistics');

        $response->assertStatus(403);
    }

    /**
     * Test invalid token gets 401.
     */
    public function test_invalid_token_gets_401(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer invalid-token')
            ->getJson('/api/admin/test');

        $response->assertStatus(401);
    }

    /**
     * Test admin role check via isAdmin method.
     */
    public function test_user_is_admin_method_works_correctly(): void
    {
        $admin = User::factory()->admin()->create();
        $user = User::factory()->create();

        $this->assertTrue($admin->isAdmin());
        $this->assertFalse($user->isAdmin());
    }
}
