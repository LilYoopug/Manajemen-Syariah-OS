<?php

namespace Tests\Feature\Profile;

use App\Models\Category;
use App\Models\Task;
use App\Models\TaskHistory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileResetTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test authenticated user can reset all their data.
     */
    public function test_user_can_reset_all_their_data(): void
    {
        $user = User::factory()->create([
            'name' => 'Ahmad',
            'email' => 'ahmad@example.com',
            'theme' => 'dark',
            'zakat_rate' => 2.5,
            'preferred_akad' => 'Murabahah',
            'calculation_method' => 'Hijri',
            'profile_picture' => 'https://example.com/avatar.jpg',
        ]);

        // Create tasks with history
        $task1 = Task::factory()->create(['user_id' => $user->id]);
        TaskHistory::factory()->create(['task_id' => $task1->id]);

        $task2 = Task::factory()->create(['user_id' => $user->id]);
        TaskHistory::factory()->count(2)->create(['task_id' => $task2->id]);

        // Create additional categories
        Category::factory()->create(['user_id' => $user->id, 'name' => 'Custom Category']);

        $response = $this->actingAs($user)
            ->postJson('/api/profile/reset');

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'All your data has been reset successfully',
            ]);

        // Verify tasks are deleted
        $this->assertEquals(0, $user->fresh()->tasks()->count());

        // Verify task histories are deleted (cascade)
        $this->assertEquals(0, TaskHistory::whereIn('task_id', [$task1->id, $task2->id])->count());

        // Verify default categories are re-seeded
        $categories = $user->fresh()->categories()->pluck('name')->toArray();
        $this->assertEquals([
            'SDM',
            'Keuangan',
            'Kepatuhan',
            'Pemasaran',
            'Operasional',
            'Teknologi',
        ], $categories);

        // Verify profile settings are reset
        $freshUser = $user->fresh();
        $this->assertEquals('light', $freshUser->theme);
        $this->assertNull($freshUser->zakat_rate);
        $this->assertNull($freshUser->preferred_akad);
        $this->assertNull($freshUser->calculation_method);
        $this->assertNull($freshUser->profile_picture);

        // Verify user account is NOT deleted
        $this->assertEquals('Ahmad', $freshUser->name);
        $this->assertEquals('ahmad@example.com', $freshUser->email);
        $this->assertDatabaseHas('users', ['id' => $user->id]);
    }

    /**
     * Test reset preserves user account.
     */
    public function test_reset_preserves_user_account(): void
    {
        $user = User::factory()->create([
            'name' => 'Original Name',
            'email' => 'original@example.com',
            'role' => 'user',
        ]);

        $originalPassword = $user->password;

        $response = $this->actingAs($user)
            ->postJson('/api/profile/reset');

        $response->assertStatus(200);

        $freshUser = $user->fresh();

        // Verify account details are preserved
        $this->assertEquals('Original Name', $freshUser->name);
        $this->assertEquals('original@example.com', $freshUser->email);
        $this->assertEquals('user', $freshUser->role);
        $this->assertEquals($originalPassword, $freshUser->password);

        // User should still be able to authenticate
        $this->assertAuthenticatedAs($user);
    }

    /**
     * Test default categories are re-seeded after reset.
     */
    public function test_default_categories_reseeded(): void
    {
        $user = User::factory()->create();

        // Add custom categories (total will be 6 default + 2 custom)
        Category::factory()->create(['user_id' => $user->id, 'name' => 'Custom1']);
        Category::factory()->create(['user_id' => $user->id, 'name' => 'Custom2']);

        $this->assertEquals(8, $user->categories()->count());

        $response = $this->actingAs($user)
            ->postJson('/api/profile/reset');

        $response->assertStatus(200);

        // Should only have 6 default categories
        $categories = $user->fresh()->categories()->pluck('name')->toArray();
        $this->assertCount(6, $categories);
        $this->assertContains('SDM', $categories);
        $this->assertContains('Keuangan', $categories);
        $this->assertContains('Kepatuhan', $categories);
        $this->assertContains('Pemasaran', $categories);
        $this->assertContains('Operasional', $categories);
        $this->assertContains('Teknologi', $categories);
    }

    /**
     * Test unauthenticated user cannot reset data.
     */
    public function test_unauthenticated_user_cannot_reset(): void
    {
        $response = $this->postJson('/api/profile/reset');

        $response->assertStatus(401);
    }

    /**
     * Test reset only affects own data.
     */
    public function test_reset_only_affects_own_data(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        // Create tasks for both users
        $task1 = Task::factory()->create(['user_id' => $user1->id, 'text' => 'User 1 Task']);
        $task2 = Task::factory()->create(['user_id' => $user2->id, 'text' => 'User 2 Task']);

        TaskHistory::factory()->create(['task_id' => $task1->id]);
        TaskHistory::factory()->create(['task_id' => $task2->id]);

        // Create categories for both users
        Category::factory()->create(['user_id' => $user1->id, 'name' => 'User 1 Category']);
        Category::factory()->create(['user_id' => $user2->id, 'name' => 'User 2 Category']);

        // Reset as user1
        $response = $this->actingAs($user1)
            ->postJson('/api/profile/reset');

        $response->assertStatus(200);

        // Verify user1's data is reset
        $this->assertEquals(0, $user1->fresh()->tasks()->count());

        // Verify user2's data is NOT affected
        $this->assertEquals(1, $user2->fresh()->tasks()->count());
        $this->assertEquals('User 2 Task', $user2->fresh()->tasks()->first()->text);
        $this->assertDatabaseHas('task_histories', ['task_id' => $task2->id]);
        $this->assertDatabaseHas('categories', [
            'user_id' => $user2->id,
            'name' => 'User 2 Category',
        ]);
    }

    /**
     * Test activity log is created on reset.
     */
    public function test_activity_log_is_created_on_reset(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/profile/reset');

        $response->assertStatus(200);

        // Verify activity log was created
        $this->assertDatabaseHas('activity_logs', [
            'user_id' => $user->id,
            'action' => 'user.data_reset',
        ]);
    }

    /**
     * Test reset with no existing data still works.
     */
    public function test_reset_with_no_existing_data(): void
    {
        $user = User::factory()->create([
            'theme' => 'dark',
            'zakat_rate' => 3.5,
        ]);

        // User has default categories from observer, but no tasks
        $this->assertEquals(6, $user->categories()->count());

        $response = $this->actingAs($user)
            ->postJson('/api/profile/reset');

        $response->assertStatus(200);

        // Verify reset still works
        $freshUser = $user->fresh();
        $this->assertEquals('light', $freshUser->theme);
        $this->assertNull($freshUser->zakat_rate);
        $this->assertEquals(6, $freshUser->categories()->count());
    }

    /**
     * Test task history is cascade deleted with tasks.
     */
    public function test_task_history_cascade_deleted(): void
    {
        $user = User::factory()->create();

        $task = Task::factory()->create(['user_id' => $user->id]);
        $history = TaskHistory::factory()->create(['task_id' => $task->id]);

        $this->assertDatabaseHas('task_histories', ['id' => $history->id]);

        $response = $this->actingAs($user)
            ->postJson('/api/profile/reset');

        $response->assertStatus(200);

        // Verify history is cascade deleted
        $this->assertDatabaseMissing('task_histories', ['id' => $history->id]);
        $this->assertDatabaseMissing('tasks', ['id' => $task->id]);
    }
}
