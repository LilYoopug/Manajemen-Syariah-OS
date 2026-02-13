<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ActivityLogTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test admin can view paginated activity logs.
     */
    public function test_admin_can_view_paginated_logs(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        // Create some activity logs
        for ($i = 0; $i < 20; $i++) {
            ActivityLog::create([
                'user_id' => $admin->id,
                'action' => 'test.action',
            ]);
        }

        $response = $this->actingAs($admin)
            ->getJson('/api/admin/logs');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data',
                'meta' => [
                    'current_page',
                    'last_page',
                    'total',
                ],
            ])
            ->assertJsonPath('meta.total', 20)
            ->assertJsonPath('meta.current_page', 1);
    }

    /**
     * Test activity logs are ordered by most recent first.
     */
    public function test_logs_ordered_by_most_recent_first(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        // Create logs at different times with explicit timestamps
        $oldLog = ActivityLog::create([
            'user_id' => $admin->id,
            'action' => 'old.action',
            'created_at' => now()->subDays(2),
        ]);

        // Ensure different timestamp by adding a second delay
        sleep(1);

        $newLog = ActivityLog::create([
            'user_id' => $admin->id,
            'action' => 'new.action',
            'created_at' => now(),
        ]);

        $response = $this->actingAs($admin)
            ->getJson('/api/admin/logs');

        $response->assertStatus(200);

        // First log should be the newer one (by ID since timestamps might be same)
        $firstLogAction = $response->json('data.0.action');
        $this->assertEquals('new.action', $firstLogAction);
    }

    /**
     * Test admin can filter logs by action.
     */
    public function test_admin_can_filter_by_action(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        // Create different action types
        ActivityLog::create([
            'user_id' => $admin->id,
            'action' => 'user.login',
        ]);
        ActivityLog::create([
            'user_id' => $admin->id,
            'action' => 'user.logout',
        ]);
        ActivityLog::create([
            'user_id' => $admin->id,
            'action' => 'user.login',
        ]);

        $response = $this->actingAs($admin)
            ->getJson('/api/admin/logs?action=user.login');

        $response->assertStatus(200)
            ->assertJsonPath('meta.total', 2);

        // All returned logs should have action = user.login
        foreach ($response->json('data') as $log) {
            $this->assertEquals('user.login', $log['action']);
        }
    }

    /**
     * Test admin can filter logs by user_id.
     */
    public function test_admin_can_filter_by_user_id(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        // Create logs for different users
        ActivityLog::create([
            'user_id' => $user1->id,
            'action' => 'test.action',
        ]);
        ActivityLog::create([
            'user_id' => $user2->id,
            'action' => 'test.action',
        ]);
        ActivityLog::create([
            'user_id' => $user1->id,
            'action' => 'another.action',
        ]);

        $response = $this->actingAs($admin)
            ->getJson('/api/admin/logs?user_id=' . $user1->id);

        $response->assertStatus(200)
            ->assertJsonPath('meta.total', 2);

        // All returned logs should be for user1
        foreach ($response->json('data') as $log) {
            $this->assertEquals($user1->id, $log['userId']);
        }
    }

    /**
     * Test logs include user information.
     */
    public function test_logs_include_user_information(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create(['name' => 'John Doe', 'email' => 'john@example.com']);

        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'test.action',
        ]);

        $response = $this->actingAs($admin)
            ->getJson('/api/admin/logs');

        $response->assertStatus(200)
            ->assertJsonPath('data.0.user.name', 'John Doe')
            ->assertJsonPath('data.0.user.email', 'john@example.com');
    }

    /**
     * Test pagination works correctly.
     */
    public function test_pagination_works_correctly(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        // Create 20 logs (should span 2 pages with 15 per page)
        for ($i = 0; $i < 20; $i++) {
            ActivityLog::create([
                'user_id' => $admin->id,
                'action' => 'test.action',
            ]);
        }

        // First page
        $response = $this->actingAs($admin)
            ->getJson('/api/admin/logs?page=1');

        $response->assertStatus(200)
            ->assertJsonPath('meta.current_page', 1)
            ->assertJsonPath('meta.last_page', 2)
            ->assertJsonPath('meta.total', 20);

        // Should have 15 items on first page
        $this->assertCount(15, $response->json('data'));

        // Second page
        $response = $this->actingAs($admin)
            ->getJson('/api/admin/logs?page=2');

        $response->assertStatus(200)
            ->assertJsonPath('meta.current_page', 2);

        // Should have 5 items on second page
        $this->assertCount(5, $response->json('data'));
    }

    /**
     * Test non-admin user cannot access logs.
     */
    public function test_non_admin_cannot_access_logs(): void
    {
        $user = User::factory()->create(['role' => 'user']);

        $response = $this->actingAs($user)
            ->getJson('/api/admin/logs');

        $response->assertStatus(403);
    }

    /**
     * Test unauthenticated user cannot access logs.
     */
    public function test_unauthenticated_cannot_access_logs(): void
    {
        $response = $this->getJson('/api/admin/logs');

        $response->assertStatus(401);
    }

    /**
     * Test empty logs return empty data.
     */
    public function test_empty_logs_return_empty_data(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)
            ->getJson('/api/admin/logs');

        $response->assertStatus(200)
            ->assertJsonPath('meta.total', 0)
            ->assertJsonCount(0, 'data');
    }

    /**
     * Test combined filters work correctly.
     */
    public function test_combined_filters_work(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        // Create various logs
        ActivityLog::create([
            'user_id' => $user1->id,
            'action' => 'user.login',
        ]);
        ActivityLog::create([
            'user_id' => $user1->id,
            'action' => 'user.logout',
        ]);
        ActivityLog::create([
            'user_id' => $user2->id,
            'action' => 'user.login',
        ]);

        // Filter by both user_id and action
        $response = $this->actingAs($admin)
            ->getJson('/api/admin/logs?user_id=' . $user1->id . '&action=user.login');

        $response->assertStatus(200)
            ->assertJsonPath('meta.total', 1);
    }
}
