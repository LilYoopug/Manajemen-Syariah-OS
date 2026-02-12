<?php

namespace Tests\Feature\Task;

use App\Models\Task;
use App\Models\TaskHistory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TaskToggleTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test binary toggle completes task.
     */
    public function test_binary_toggle_completes_task(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create([
            'has_limit' => false,
            'completed' => false,
            'progress' => 0,
        ]);

        Sanctum::actingAs($user);

        $response = $this->patchJson("/api/tasks/{$task->id}/toggle");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Task toggled successfully',
                'data' => [
                    'id' => $task->id,
                    'completed' => true,
                    'progress' => 100,
                ],
            ]);

        // Verify database was updated
        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'completed' => true,
            'progress' => 100,
        ]);
    }

    /**
     * Test binary toggle uncompletes task.
     */
    public function test_binary_toggle_uncompletes_task(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create([
            'has_limit' => false,
            'completed' => true,
            'progress' => 100,
        ]);

        Sanctum::actingAs($user);

        $response = $this->patchJson("/api/tasks/{$task->id}/toggle");

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'completed' => false,
                    'progress' => 0,
                ],
            ]);

        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'completed' => false,
            'progress' => 0,
        ]);
    }

    /**
     * Test incremental progress updates current value.
     */
    public function test_incremental_progress_updates_current_value(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create([
            'has_limit' => true,
            'current_value' => 0,
            'target_value' => 100,
            'increment_value' => 10,
            'completed' => false,
            'progress' => 0,
        ]);

        Sanctum::actingAs($user);

        $response = $this->patchJson("/api/tasks/{$task->id}/toggle");

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'currentValue' => 10,
                    'progress' => 10,
                    'completed' => false,
                ],
            ]);

        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'current_value' => 10,
            'progress' => 10,
        ]);
    }

    /**
     * Test auto complete when target reached.
     */
    public function test_auto_complete_when_target_reached(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create([
            'has_limit' => true,
            'current_value' => 90,
            'target_value' => 100,
            'increment_value' => 10,
            'completed' => false,
            'progress' => 90,
        ]);

        Sanctum::actingAs($user);

        $response = $this->patchJson("/api/tasks/{$task->id}/toggle");

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'currentValue' => 100,
                    'progress' => 100,
                    'completed' => true,
                ],
            ]);

        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'completed' => true,
        ]);
    }

    /**
     * Test progress calculation caps at 100.
     */
    public function test_progress_calculation_caps_at_100(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create([
            'has_limit' => true,
            'current_value' => 95,
            'target_value' => 100,
            'increment_value' => 10,
            'completed' => false,
            'progress' => 95,
        ]);

        Sanctum::actingAs($user);

        $response = $this->patchJson("/api/tasks/{$task->id}/toggle");

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'currentValue' => 105,
                    'progress' => 100,
                    'completed' => true,
                ],
            ]);
    }

    /**
     * Test history entry is created on toggle.
     */
    public function test_history_entry_is_created_on_toggle(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create([
            'has_limit' => false,
            'completed' => false,
        ]);

        Sanctum::actingAs($user);

        $this->patchJson("/api/tasks/{$task->id}/toggle");

        $this->assertDatabaseHas('task_histories', [
            'task_id' => $task->id,
            'value' => 1,
        ]);
    }

    /**
     * Test history entry for incremental progress.
     */
    public function test_history_entry_for_incremental_progress(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create([
            'has_limit' => true,
            'increment_value' => 5,
            'target_value' => 100,
            'current_value' => 0,
        ]);

        Sanctum::actingAs($user);

        $this->patchJson("/api/tasks/{$task->id}/toggle");

        $this->assertDatabaseHas('task_histories', [
            'task_id' => $task->id,
            'value' => 5,
        ]);
    }

    /**
     * Test user cannot toggle other user's task.
     */
    public function test_user_cannot_toggle_other_users_task(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $otherUserTask = Task::factory()->for($otherUser)->create();

        Sanctum::actingAs($user);

        $response = $this->patchJson("/api/tasks/{$otherUserTask->id}/toggle");

        $response->assertStatus(404);
    }

    /**
     * Test unauthenticated request returns 401.
     */
    public function test_unauthenticated_request_returns_401(): void
    {
        $task = Task::factory()->create();

        $response = $this->patchJson("/api/tasks/{$task->id}/toggle");

        $response->assertStatus(401)
            ->assertJson([
                'message' => 'Unauthenticated.',
            ]);
    }

    /**
     * Test toggle non-existent task returns 404.
     */
    public function test_toggle_non_existent_task_returns_404(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->patchJson('/api/tasks/999/toggle');

        $response->assertStatus(404);
    }

    /**
     * Test toggle includes history in response.
     */
    public function test_toggle_includes_history_in_response(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create([
            'has_limit' => false,
        ]);

        Sanctum::actingAs($user);

        $response = $this->patchJson("/api/tasks/{$task->id}/toggle");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'history' => [
                        '*' => ['id', 'value', 'note', 'timestamp', 'createdAt', 'updatedAt'],
                    ],
                ],
            ]);
    }

    /**
     * Test multiple toggles create multiple history entries.
     */
    public function test_multiple_toggles_create_multiple_history_entries(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create([
            'has_limit' => false,
        ]);

        Sanctum::actingAs($user);

        // Toggle twice
        $this->patchJson("/api/tasks/{$task->id}/toggle");
        $this->patchJson("/api/tasks/{$task->id}/toggle");

        $this->assertEquals(2, TaskHistory::where('task_id', $task->id)->count());
    }
}
