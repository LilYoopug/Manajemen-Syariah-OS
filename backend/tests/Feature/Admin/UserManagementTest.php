<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Models\Task;
use App\Models\ActivityLog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    // ==========================================
    // List Users Tests
    // ==========================================

    /**
     * Test admin can list users with pagination.
     */
    public function test_admin_can_list_users_with_pagination(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        User::factory()->count(20)->create();

        $response = $this->actingAs($admin)
            ->getJson('/api/admin/users');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data',
                'meta' => [
                    'current_page',
                    'last_page',
                    'total',
                ],
            ])
            ->assertJsonPath('meta.total', 21); // 20 + admin
    }

    /**
     * Test admin can search users by name.
     */
    public function test_admin_can_search_users_by_name(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        User::factory()->create(['name' => 'John Doe']);
        User::factory()->create(['name' => 'Jane Smith']);
        User::factory()->create(['name' => 'Bob Johnson']);

        $response = $this->actingAs($admin)
            ->getJson('/api/admin/users?search=John');

        $response->assertStatus(200)
            ->assertJsonPath('meta.total', 2); // John Doe + admin
    }

    /**
     * Test admin can search users by email.
     */
    public function test_admin_can_search_users_by_email(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'email' => 'admin@test.com']);
        User::factory()->create(['email' => 'john@example.com']);
        User::factory()->create(['email' => 'jane@other.com']);

        $response = $this->actingAs($admin)
            ->getJson('/api/admin/users?search=john@example.com');

        $response->assertStatus(200)
            ->assertJsonPath('meta.total', 1);
    }

    // ==========================================
    // Create User Tests
    // ==========================================

    /**
     * Test admin can create user.
     */
    public function test_admin_can_create_user(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)
            ->postJson('/api/admin/users', [
                'name' => 'New User',
                'email' => 'newuser@example.com',
                'password' => 'password123',
                'role' => 'user',
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'email',
                    'role',
                ],
            ])
            ->assertJson([
                'data' => [
                    'name' => 'New User',
                    'email' => 'newuser@example.com',
                    'role' => 'user',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'newuser@example.com',
            'role' => 'user',
        ]);
    }

    /**
     * Test creating user logs activity.
     */
    public function test_creating_user_logs_activity(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->postJson('/api/admin/users', [
                'name' => 'New User',
                'email' => 'newuser@example.com',
                'password' => 'password123',
                'role' => 'user',
            ]);

        $this->assertDatabaseHas('activity_logs', [
            'action' => 'admin.user_created',
        ]);
    }

    /**
     * Test create user validates required fields.
     */
    public function test_create_user_validates_required_fields(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)
            ->postJson('/api/admin/users', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'password', 'role']);
    }

    /**
     * Test create user validates unique email.
     */
    public function test_create_user_validates_unique_email(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        User::factory()->create(['email' => 'existing@example.com']);

        $response = $this->actingAs($admin)
            ->postJson('/api/admin/users', [
                'name' => 'New User',
                'email' => 'existing@example.com',
                'password' => 'password123',
                'role' => 'user',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /**
     * Test create user validates role.
     */
    public function test_create_user_validates_role(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)
            ->postJson('/api/admin/users', [
                'name' => 'New User',
                'email' => 'newuser@example.com',
                'password' => 'password123',
                'role' => 'invalid_role',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['role']);
    }

    // ==========================================
    // Update User Tests
    // ==========================================

    /**
     * Test admin can update user.
     */
    public function test_admin_can_update_user(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create(['name' => 'Old Name', 'role' => 'user']);

        $response = $this->actingAs($admin)
            ->putJson("/api/admin/users/{$user->id}", [
                'name' => 'New Name',
                'email' => $user->email,
                'role' => 'admin',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'name' => 'New Name',
                    'role' => 'admin',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'New Name',
            'role' => 'admin',
        ]);
    }

    /**
     * Test updating user logs activity.
     */
    public function test_updating_user_logs_activity(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create();

        $this->actingAs($admin)
            ->putJson("/api/admin/users/{$user->id}", [
                'name' => 'New Name',
                'email' => $user->email,
                'role' => 'user',
            ]);

        $this->assertDatabaseHas('activity_logs', [
            'action' => 'admin.user_updated',
            'subject_id' => $user->id,
        ]);
    }

    /**
     * Test update user validates unique email.
     */
    public function test_update_user_validates_unique_email(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create();
        User::factory()->create(['email' => 'other@example.com']);

        $response = $this->actingAs($admin)
            ->putJson("/api/admin/users/{$user->id}", [
                'name' => $user->name,
                'email' => 'other@example.com',
                'role' => 'user',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /**
     * Test update user can keep same email.
     */
    public function test_update_user_can_keep_same_email(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create(['email' => 'same@example.com']);

        $response = $this->actingAs($admin)
            ->putJson("/api/admin/users/{$user->id}", [
                'name' => 'New Name',
                'email' => 'same@example.com',
                'role' => 'user',
            ]);

        $response->assertStatus(200);
    }

    // ==========================================
    // Delete User Tests
    // ==========================================

    /**
     * Test admin can delete user.
     */
    public function test_admin_can_delete_user(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create();

        $response = $this->actingAs($admin)
            ->deleteJson("/api/admin/users/{$user->id}");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'User deleted successfully.',
            ]);

        $this->assertDatabaseMissing('users', [
            'id' => $user->id,
        ]);
    }

    /**
     * Test deleting user logs activity.
     */
    public function test_deleting_user_logs_activity(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create();

        $this->actingAs($admin)
            ->deleteJson("/api/admin/users/{$user->id}");

        $this->assertDatabaseHas('activity_logs', [
            'action' => 'admin.user_deleted',
        ]);
    }

    /**
     * Test deleting user cascades to tasks.
     */
    public function test_deleting_user_cascades_to_tasks(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create();
        $task = Task::factory()->create(['user_id' => $user->id]);

        $this->actingAs($admin)
            ->deleteJson("/api/admin/users/{$user->id}");

        $this->assertDatabaseMissing('tasks', [
            'id' => $task->id,
        ]);
    }

    /**
     * Test deleting user cascades to activity logs.
     */
    public function test_deleting_user_cascades_to_activity_logs(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create();
        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'test.action',
        ]);

        $this->actingAs($admin)
            ->deleteJson("/api/admin/users/{$user->id}");

        $this->assertDatabaseMissing('activity_logs', [
            'user_id' => $user->id,
        ]);
    }

    // ==========================================
    // Authorization Tests
    // ==========================================

    /**
     * Test non-admin cannot list users.
     */
    public function test_non_admin_cannot_list_users(): void
    {
        $user = User::factory()->create(['role' => 'user']);

        $response = $this->actingAs($user)
            ->getJson('/api/admin/users');

        $response->assertStatus(403);
    }

    /**
     * Test non-admin cannot create user.
     */
    public function test_non_admin_cannot_create_user(): void
    {
        $user = User::factory()->create(['role' => 'user']);

        $response = $this->actingAs($user)
            ->postJson('/api/admin/users', [
                'name' => 'New User',
                'email' => 'new@example.com',
                'password' => 'password123',
                'role' => 'user',
            ]);

        $response->assertStatus(403);
    }

    /**
     * Test non-admin cannot update user.
     */
    public function test_non_admin_cannot_update_user(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $targetUser = User::factory()->create();

        $response = $this->actingAs($user)
            ->putJson("/api/admin/users/{$targetUser->id}", [
                'name' => 'New Name',
                'email' => $targetUser->email,
                'role' => 'user',
            ]);

        $response->assertStatus(403);
    }

    /**
     * Test non-admin cannot delete user.
     */
    public function test_non_admin_cannot_delete_user(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $targetUser = User::factory()->create();

        $response = $this->actingAs($user)
            ->deleteJson("/api/admin/users/{$targetUser->id}");

        $response->assertStatus(403);
    }

    /**
     * Test unauthenticated cannot access any user management endpoint.
     */
    public function test_unauthenticated_cannot_access_user_management(): void
    {
        $user = User::factory()->create();

        $this->getJson('/api/admin/users')->assertStatus(401);
        $this->postJson('/api/admin/users', [])->assertStatus(401);
        $this->putJson("/api/admin/users/{$user->id}", [])->assertStatus(401);
        $this->deleteJson("/api/admin/users/{$user->id}")->assertStatus(401);
    }
}
