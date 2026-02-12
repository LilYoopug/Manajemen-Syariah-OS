<?php

namespace Tests\Feature\Profile;

use App\Models\Category;
use App\Models\Task;
use App\Models\TaskHistory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileExportTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test authenticated user can export all their data.
     */
    public function test_user_can_export_all_their_data(): void
    {
        $user = User::factory()->create([
            'name' => 'Ahmad',
            'email' => 'ahmad@example.com',
            'theme' => 'dark',
            'zakat_rate' => 2.5,
            'preferred_akad' => 'Murabahah',
            'calculation_method' => 'Hijri',
        ]);

        // Create categories for the user
        $category1 = Category::factory()->create(['user_id' => $user->id, 'name' => 'SDM']);
        $category2 = Category::factory()->create(['user_id' => $user->id, 'name' => 'Keuangan']);

        // Create tasks with history for the user
        $task1 = Task::factory()->create([
            'user_id' => $user->id,
            'text' => 'Complete daily prayer',
            'completed' => true,
            'category' => 'Kepatuhan',
            'progress' => 100,
            'has_limit' => false,
            'reset_cycle' => 'daily',
        ]);
        TaskHistory::factory()->create([
            'task_id' => $task1->id,
            'value' => 1,
            'note' => 'Morning prayer completed',
        ]);

        $task2 = Task::factory()->create([
            'user_id' => $user->id,
            'text' => 'Pay zakat',
            'completed' => false,
            'category' => 'Keuangan',
            'progress' => 50,
            'has_limit' => true,
            'current_value' => 50,
            'target_value' => 100,
            'unit' => 'percent',
            'reset_cycle' => 'yearly',
        ]);

        $response = $this->actingAs($user)
            ->postJson('/api/profile/export');

        $response->assertStatus(200)
            ->assertHeader('Content-Disposition')
            ->assertJsonStructure([
                'exportedAt',
                'profile' => [
                    'name',
                    'email',
                    'role',
                    'theme',
                    'profilePicture',
                    'zakatRate',
                    'preferredAkad',
                    'calculationMethod',
                ],
                'tasks' => [
                    '*' => [
                        'id',
                        'text',
                        'completed',
                        'category',
                        'progress',
                        'hasLimit',
                        'currentValue',
                        'targetValue',
                        'unit',
                        'resetCycle',
                        'createdAt',
                        'updatedAt',
                        'history' => [
                            '*' => [
                                'id',
                                'value',
                                'note',
                                'timestamp',
                            ],
                        ],
                    ],
                ],
                'categories' => [
                    '*' => [
                        'id',
                        'name',
                    ],
                ],
            ])
            ->assertJson([
                'profile' => [
                    'name' => 'Ahmad',
                    'email' => 'ahmad@example.com',
                    'theme' => 'dark',
                    'zakatRate' => 2.5,
                    'preferredAkad' => 'Murabahah',
                    'calculationMethod' => 'Hijri',
                ],
            ]);

        // Verify tasks are included
        $this->assertCount(2, $response->json('tasks'));

        // Verify categories are included
        $this->assertCount(2, $response->json('categories'));

        // Verify history is included for task with history
        $taskData = collect($response->json('tasks'))->firstWhere('text', 'Complete daily prayer');
        $this->assertNotEmpty($taskData['history']);
    }

    /**
     * Test export with empty tasks and categories.
     */
    public function test_export_with_empty_data(): void
    {
        $user = User::factory()->create([
            'name' => 'New User',
            'email' => 'newuser@example.com',
        ]);

        $response = $this->actingAs($user)
            ->postJson('/api/profile/export');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'exportedAt',
                'profile',
                'tasks',
                'categories',
            ])
            ->assertJson([
                'profile' => [
                    'name' => 'New User',
                    'email' => 'newuser@example.com',
                ],
                'tasks' => [],
                'categories' => [],
            ]);
    }

    /**
     * Test unauthenticated user cannot export data.
     */
    public function test_unauthenticated_user_cannot_export(): void
    {
        $response = $this->postJson('/api/profile/export');

        $response->assertStatus(401);
    }

    /**
     * Test export only includes user's own data.
     */
    public function test_export_only_includes_own_data(): void
    {
        // Create two users
        $user1 = User::factory()->create(['name' => 'User One']);
        $user2 = User::factory()->create(['name' => 'User Two']);

        // Create tasks for each user
        $task1 = Task::factory()->create([
            'user_id' => $user1->id,
            'text' => 'User One Task',
        ]);
        $task2 = Task::factory()->create([
            'user_id' => $user2->id,
            'text' => 'User Two Task',
        ]);

        // Create categories for each user
        Category::factory()->create(['user_id' => $user1->id, 'name' => 'User One Category']);
        Category::factory()->create(['user_id' => $user2->id, 'name' => 'User Two Category']);

        // Create history for user2's task (should not appear in user1's export)
        TaskHistory::factory()->create([
            'task_id' => $task2->id,
            'value' => 1,
        ]);

        // Export as user1
        $response = $this->actingAs($user1)
            ->postJson('/api/profile/export');

        $response->assertStatus(200);

        // Verify only user1's data is included
        $tasks = $response->json('tasks');
        $this->assertCount(1, $tasks);
        $this->assertEquals('User One Task', $tasks[0]['text']);

        $categories = $response->json('categories');
        $this->assertCount(1, $categories);
        $this->assertEquals('User One Category', $categories[0]['name']);

        // Verify user2's data is NOT included
        $this->assertNotEquals('User Two Task', $tasks[0]['text'] ?? null);
    }

    /**
     * Test export response has correct download headers.
     */
    public function test_export_has_download_headers(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/profile/export');

        $response->assertStatus(200);

        // Check Content-Disposition header contains filename
        $contentDisposition = $response->headers->get('Content-Disposition');
        $this->assertStringContainsString('attachment', $contentDisposition);
        $this->assertStringContainsString('user-data-', $contentDisposition);
        $this->assertStringContainsString('.json', $contentDisposition);

        // Check Cache-Control header
        $this->assertEquals(
            'no-cache, no-store, must-revalidate',
            $response->headers->get('Cache-Control')
        );
    }

    /**
     * Test activity log is created on export.
     */
    public function test_activity_log_is_created_on_export(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/profile/export');

        $response->assertStatus(200);

        // Verify activity log was created
        $this->assertDatabaseHas('activity_logs', [
            'user_id' => $user->id,
            'action' => 'user.data_exported',
        ]);
    }

    /**
     * Test export excludes sensitive fields.
     */
    public function test_export_excludes_sensitive_fields(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/profile/export');

        $response->assertStatus(200);

        $profile = $response->json('profile');

        // Verify sensitive fields are not included
        $this->assertArrayNotHasKey('password', $profile);
        $this->assertArrayNotHasKey('remember_token', $profile);
    }

    /**
     * Test export with task history entries.
     */
    public function test_export_includes_task_history(): void
    {
        $user = User::factory()->create();

        $task = Task::factory()->create([
            'user_id' => $user->id,
            'text' => 'Task with history',
        ]);

        $history1 = TaskHistory::factory()->create([
            'task_id' => $task->id,
            'value' => 10,
            'note' => 'First entry',
        ]);

        $history2 = TaskHistory::factory()->create([
            'task_id' => $task->id,
            'value' => 20,
            'note' => 'Second entry',
        ]);

        $response = $this->actingAs($user)
            ->postJson('/api/profile/export');

        $response->assertStatus(200);

        $taskData = $response->json('tasks.0');

        $this->assertCount(2, $taskData['history']);

        $historyValues = collect($taskData['history'])->pluck('value')->toArray();
        $this->assertContains(10, $historyValues);
        $this->assertContains(20, $historyValues);
    }
}
