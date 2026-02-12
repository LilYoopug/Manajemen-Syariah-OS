<?php

namespace Tests\Feature\Task;

use App\Models\ActivityLog;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TaskUpdateTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test successful task update.
     */
    public function test_user_can_update_their_own_task(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create([
            'text' => 'Original Task',
            'category' => 'SDM',
            'reset_cycle' => 'daily',
        ]);

        Sanctum::actingAs($user);

        $response = $this->putJson("/api/tasks/{$task->id}", [
            'text' => 'Updated Task',
            'category' => 'Keuangan',
            'resetCycle' => 'monthly',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Task updated successfully',
                'data' => [
                    'id' => $task->id,
                    'text' => 'Updated Task',
                    'category' => 'Keuangan',
                    'resetCycle' => 'monthly',
                ],
            ]);

        // Verify database was updated
        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'text' => 'Updated Task',
            'category' => 'Keuangan',
            'reset_cycle' => 'monthly',
        ]);
    }

    /**
     * Test update task with numeric target.
     */
    public function test_user_can_update_task_with_numeric_target(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create([
            'has_limit' => false,
        ]);

        Sanctum::actingAs($user);

        $response = $this->putJson("/api/tasks/{$task->id}", [
            'hasLimit' => true,
            'targetValue' => 10000000,
            'unit' => 'IDR',
            'incrementValue' => 500000,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'hasLimit' => true,
                    'targetValue' => 10000000,
                    'unit' => 'IDR',
                    'incrementValue' => 500000,
                ],
            ]);
    }

    /**
     * Test user cannot update another user's task.
     */
    public function test_user_cannot_update_other_users_task(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $otherUserTask = Task::factory()->for($otherUser)->create();

        Sanctum::actingAs($user);

        $response = $this->putJson("/api/tasks/{$otherUserTask->id}", [
            'text' => 'Trying to update',
        ]);

        $response->assertStatus(404);
    }

    /**
     * Test validation error for invalid reset cycle.
     */
    public function test_validation_error_for_invalid_reset_cycle(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create();

        Sanctum::actingAs($user);

        $response = $this->putJson("/api/tasks/{$task->id}", [
            'resetCycle' => 'invalid',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['resetCycle']);
    }

    /**
     * Test validation error for missing target value when hasLimit is true.
     */
    public function test_validation_error_for_missing_target_value_when_has_limit_enabled(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create();

        Sanctum::actingAs($user);

        $response = $this->putJson("/api/tasks/{$task->id}", [
            'hasLimit' => true,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['targetValue', 'unit']);
    }

    /**
     * Test activity log is created on update.
     */
    public function test_activity_log_is_created_on_update(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create();

        Sanctum::actingAs($user);

        $this->putJson("/api/tasks/{$task->id}", [
            'text' => 'Updated Task',
        ]);

        $this->assertDatabaseHas('activity_logs', [
            'user_id' => $user->id,
            'action' => 'task.updated',
            'subject_type' => Task::class,
            'subject_id' => $task->id,
        ]);
    }

    /**
     * Test unauthenticated request returns 401.
     */
    public function test_unauthenticated_request_returns_401(): void
    {
        $task = Task::factory()->create();

        $response = $this->putJson("/api/tasks/{$task->id}", [
            'text' => 'Updated Task',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'message' => 'Unauthenticated.',
            ]);
    }

    /**
     * Test update non-existent task returns 404.
     */
    public function test_update_non_existent_task_returns_404(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->putJson('/api/tasks/999', [
            'text' => 'Updated Task',
        ]);

        $response->assertStatus(404);
    }

    /**
     * Test partial update works correctly.
     */
    public function test_partial_update_works_correctly(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create([
            'text' => 'Original Text',
            'category' => 'SDM',
            'reset_cycle' => 'daily',
        ]);

        Sanctum::actingAs($user);

        // Only update text, leave other fields unchanged
        $response = $this->putJson("/api/tasks/{$task->id}", [
            'text' => 'New Text Only',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'text' => 'New Text Only',
                    'category' => 'SDM', // unchanged
                    'resetCycle' => 'daily', // unchanged
                ],
            ]);
    }

    /**
     * Test update preserves completion status.
     */
    public function test_update_preserves_completion_status(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create([
            'completed' => true,
            'progress' => 50,
        ]);

        Sanctum::actingAs($user);

        $response = $this->putJson("/api/tasks/{$task->id}", [
            'text' => 'Updated Text',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'completed' => true,
                    'progress' => 50,
                ],
            ]);
    }
}
