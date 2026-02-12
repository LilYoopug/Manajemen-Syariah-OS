<?php

namespace Tests\Feature\Task;

use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TaskStoreTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test successful task creation returns 201 with task data.
     */
    public function test_user_can_create_task_successfully(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $taskData = [
            'text' => 'Bayar Zakat Mal',
            'category' => 'Keuangan',
            'resetCycle' => 'monthly',
        ];

        $response = $this->postJson('/api/tasks', $taskData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'data' => [
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
                    'perCheckEnabled',
                    'incrementValue',
                    'lastResetAt',
                    'createdAt',
                    'updatedAt',
                ],
            ])
            ->assertJson([
                'message' => 'Task created successfully',
                'data' => [
                    'text' => 'Bayar Zakat Mal',
                    'category' => 'Keuangan',
                    'resetCycle' => 'monthly',
                    'completed' => false,
                    'progress' => 0,
                    'hasLimit' => false,
                ],
            ]);

        // Verify task was created in database
        $this->assertDatabaseHas('tasks', [
            'user_id' => $user->id,
            'text' => 'Bayar Zakat Mal',
            'category' => 'Keuangan',
        ]);
    }

    /**
     * Test task with numeric target configuration.
     */
    public function test_user_can_create_task_with_numeric_target(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $taskData = [
            'text' => 'Target Zakat Tahunan',
            'category' => 'Keuangan',
            'hasLimit' => true,
            'targetValue' => 10000000,
            'unit' => 'IDR',
            'incrementValue' => 1000000,
        ];

        $response = $this->postJson('/api/tasks', $taskData);

        $response->assertStatus(201)
            ->assertJson([
                'data' => [
                    'hasLimit' => true,
                    'targetValue' => 10000000,
                    'unit' => 'IDR',
                    'incrementValue' => 1000000,
                    'currentValue' => 0,
                ],
            ]);

        $this->assertDatabaseHas('tasks', [
            'user_id' => $user->id,
            'has_limit' => true,
            'target_value' => 10000000,
            'unit' => 'IDR',
        ]);
    }

    /**
     * Test activity log is created on task creation.
     */
    public function test_activity_log_is_created_on_task_creation(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $taskData = [
            'text' => 'Test Task',
            'category' => 'SDM',
        ];

        $response = $this->postJson('/api/tasks', $taskData);

        $response->assertStatus(201);

        $task = Task::where('text', 'Test Task')->first();

        // Verify activity log was created
        $this->assertDatabaseHas('activity_logs', [
            'user_id' => $user->id,
            'action' => 'task.created',
            'subject_type' => Task::class,
            'subject_id' => $task->id,
        ]);
    }

    /**
     * Test validation error for missing text.
     */
    public function test_task_creation_fails_with_missing_text(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $taskData = [
            'category' => 'Keuangan',
        ];

        $response = $this->postJson('/api/tasks', $taskData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['text'])
            ->assertJson([
                'message' => 'Task description is required.',
            ]);
    }

    /**
     * Test validation error for missing category.
     */
    public function test_task_creation_fails_with_missing_category(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $taskData = [
            'text' => 'Test Task',
        ];

        $response = $this->postJson('/api/tasks', $taskData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['category'])
            ->assertJson([
                'message' => 'Category is required.',
            ]);
    }

    /**
     * Test validation error for invalid reset cycle.
     */
    public function test_task_creation_fails_with_invalid_reset_cycle(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $taskData = [
            'text' => 'Test Task',
            'category' => 'Keuangan',
            'resetCycle' => 'invalid',
        ];

        $response = $this->postJson('/api/tasks', $taskData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['resetCycle']);
    }

    /**
     * Test validation error for missing target value when hasLimit is true.
     */
    public function test_task_creation_fails_with_missing_target_value_when_has_limit(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $taskData = [
            'text' => 'Test Task',
            'category' => 'Keuangan',
            'hasLimit' => true,
        ];

        $response = $this->postJson('/api/tasks', $taskData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['targetValue', 'unit']);
    }

    /**
     * Test task is scoped to authenticated user.
     */
    public function test_task_is_scoped_to_authenticated_user(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        Sanctum::actingAs($user);

        $taskData = [
            'text' => 'My Task',
            'category' => 'Keuangan',
        ];

        $response = $this->postJson('/api/tasks', $taskData);

        $response->assertStatus(201);

        // Verify task belongs to authenticated user, not other user
        $this->assertDatabaseHas('tasks', [
            'user_id' => $user->id,
            'text' => 'My Task',
        ]);

        $this->assertDatabaseMissing('tasks', [
            'user_id' => $otherUser->id,
            'text' => 'My Task',
        ]);
    }

    /**
     * Test unauthenticated request returns 401.
     */
    public function test_task_creation_fails_without_authentication(): void
    {
        $taskData = [
            'text' => 'Test Task',
            'category' => 'Keuangan',
        ];

        $response = $this->postJson('/api/tasks', $taskData);

        $response->assertStatus(401)
            ->assertJson([
                'message' => 'Unauthenticated.',
            ]);
    }

    /**
     * Test task with per check enabled.
     */
    public function test_user_can_create_task_with_per_check_enabled(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $taskData = [
            'text' => 'Daily Reading',
            'category' => 'SDM',
            'hasLimit' => true,
            'targetValue' => 100,
            'unit' => 'pages',
            'perCheckEnabled' => true,
            'incrementValue' => 10,
        ];

        $response = $this->postJson('/api/tasks', $taskData);

        $response->assertStatus(201)
            ->assertJson([
                'data' => [
                    'perCheckEnabled' => true,
                    'incrementValue' => 10,
                ],
            ]);
    }
}
