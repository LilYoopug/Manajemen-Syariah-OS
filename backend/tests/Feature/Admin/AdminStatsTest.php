<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Models\Task;
use App\Models\ActivityLog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminStatsTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test admin can view platform statistics.
     */
    public function test_admin_can_view_statistics(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        // Create some test data - tasks should be associated with users
        $users = User::factory()->count(5)->create();
        foreach ($users as $user) {
            Task::factory()->count(2)->for($user)->create(['completed' => false]);
        }
        // Create some completed tasks
        Task::factory()->count(3)->for($users->first())->create(['completed' => true]);

        // Create login activity for some users
        foreach ($users->take(3) as $user) {
            ActivityLog::create([
                'user_id' => $user->id,
                'action' => 'user.login',
                'created_at' => now()->subDays(5),
            ]);
        }

        $response = $this->actingAs($admin)
            ->getJson('/api/admin/stats');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'totalUsers',
                    'totalTasks',
                    'completedTasks',
                    'activeUsers',
                    'recentActivity',
                ],
            ])
            ->assertJson([
                'data' => [
                    'totalUsers' => 6, // 5 + admin
                    'totalTasks' => 13, // 10 incomplete + 3 completed
                    'completedTasks' => 3,
                    'activeUsers' => 3, // 3 users with login activity
                ],
            ]);
    }

    /**
     * Test admin statistics include recent activity.
     */
    public function test_admin_stats_include_recent_activity(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        // Create some activity logs
        ActivityLog::create([
            'user_id' => $admin->id,
            'action' => 'user.login',
        ]);
        ActivityLog::create([
            'user_id' => $admin->id,
            'action' => 'task.created',
        ]);

        $response = $this->actingAs($admin)
            ->getJson('/api/admin/stats');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data.recentActivity');
    }

    /**
     * Test admin statistics limits recent activity to 10 entries.
     */
    public function test_admin_stats_limits_recent_activity_to_ten(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        // Create 15 activity logs
        for ($i = 0; $i < 15; $i++) {
            ActivityLog::create([
                'user_id' => $admin->id,
                'action' => 'test.action',
            ]);
        }

        $response = $this->actingAs($admin)
            ->getJson('/api/admin/stats');

        $response->assertStatus(200)
            ->assertJsonCount(10, 'data.recentActivity');
    }

    /**
     * Test active users counts only recent logins.
     */
    public function test_active_users_counts_only_recent_logins(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        // Create user with recent login (within 30 days)
        $recentUser = User::factory()->create();
        ActivityLog::create([
            'user_id' => $recentUser->id,
            'action' => 'user.login',
            'created_at' => now()->subDays(15),
        ]);

        // Create user with old login (more than 30 days)
        $oldUser = User::factory()->create();
        ActivityLog::create([
            'user_id' => $oldUser->id,
            'action' => 'user.login',
            'created_at' => now()->subDays(35),
        ]);

        $response = $this->actingAs($admin)
            ->getJson('/api/admin/stats');

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'activeUsers' => 1, // Only the recent user (not admin or old user)
                ],
            ]);
    }

    /**
     * Test non-admin user cannot access statistics.
     */
    public function test_non_admin_cannot_access_statistics(): void
    {
        $user = User::factory()->create(['role' => 'user']);

        $response = $this->actingAs($user)
            ->getJson('/api/admin/stats');

        $response->assertStatus(403);
    }

    /**
     * Test unauthenticated user cannot access statistics.
     */
    public function test_unauthenticated_cannot_access_statistics(): void
    {
        $response = $this->getJson('/api/admin/stats');

        $response->assertStatus(401);
    }

    /**
     * Test statistics return zero values for empty database.
     */
    public function test_statistics_zero_values_for_empty_database(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)
            ->getJson('/api/admin/stats');

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'totalUsers' => 1, // Only admin
                    'totalTasks' => 0,
                    'completedTasks' => 0,
                    'activeUsers' => 0,
                    'recentActivity' => [],
                ],
            ]);
    }

    /**
     * Test recent activity includes user information.
     */
    public function test_recent_activity_includes_user_information(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $otherUser = User::factory()->create(['name' => 'John Doe', 'email' => 'john@example.com']);

        ActivityLog::create([
            'user_id' => $otherUser->id,
            'action' => 'user.login',
        ]);

        $response = $this->actingAs($admin)
            ->getJson('/api/admin/stats');

        $response->assertStatus(200)
            ->assertJsonPath('data.recentActivity.0.user.name', 'John Doe')
            ->assertJsonPath('data.recentActivity.0.user.email', 'john@example.com');
    }
}
