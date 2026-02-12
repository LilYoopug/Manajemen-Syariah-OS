<?php

namespace Tests\Feature\Task;

use App\Models\Task;
use App\Models\TaskHistory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TaskHistoryUpdateTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test user can update history entry.
     */
    public function test_user_can_update_history_entry(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create(['has_limit' => true]);
        $history = TaskHistory::create([
            'task_id' => $task->id,
            'value' => 10,
            'timestamp' => now(),
        ]);

        Sanctum::actingAs($user);

        $response = $this->putJson("/api/tasks/{$task->id}/history/{$history->id}", [
            'value' => 20,
            'note' => 'Corrected value',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'History entry updated successfully',
                'data' => [
                    'id' => $history->id,
                    'value' => 20,
                    'note' => 'Corrected value',
                ],
            ]);

        $this->assertDatabaseHas('task_histories', [
            'id' => $history->id,
            'value' => 20,
            'note' => 'Corrected value',
        ]);
    }

    /**
     * Test update history triggers task recalculation.
     */
    public function test_update_history_triggers_task_recalculation(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create([
            'has_limit' => true,
            'target_value' => 100,
            'current_value' => 10,
            'progress' => 10,
        ]);
        $history = TaskHistory::create([
            'task_id' => $task->id,
            'value' => 10,
            'timestamp' => now(),
        ]);

        Sanctum::actingAs($user);

        $this->putJson("/api/tasks/{$task->id}/history/{$history->id}", [
            'value' => 50,
        ]);

        // Task current_value should be recalculated to 50
        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'current_value' => 50,
            'progress' => 50,
        ]);
    }

    /**
     * Test user cannot update other user's history.
     */
    public function test_user_cannot_update_other_users_history(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $otherTask = Task::factory()->for($otherUser)->create();
        $otherHistory = TaskHistory::create([
            'task_id' => $otherTask->id,
            'value' => 10,
            'timestamp' => now(),
        ]);

        Sanctum::actingAs($user);

        $response = $this->putJson("/api/tasks/{$otherTask->id}/history/{$otherHistory->id}", [
            'value' => 20,
        ]);

        $response->assertStatus(404);
    }

    /**
     * Test validation error for negative value.
     */
    public function test_validation_error_for_negative_value(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create();
        $history = TaskHistory::create([
            'task_id' => $task->id,
            'value' => 10,
            'timestamp' => now(),
        ]);

        Sanctum::actingAs($user);

        $response = $this->putJson("/api/tasks/{$task->id}/history/{$history->id}", [
            'value' => -5,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['value']);
    }

    /**
     * Test unauthenticated request returns 401.
     */
    public function test_unauthenticated_request_returns_401(): void
    {
        $task = Task::factory()->create();
        $history = TaskHistory::create([
            'task_id' => $task->id,
            'value' => 10,
            'timestamp' => now(),
        ]);

        $response = $this->putJson("/api/tasks/{$task->id}/history/{$history->id}", [
            'value' => 20,
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'message' => 'Unauthenticated.',
            ]);
    }

    /**
     * Test update non-existent history returns 404.
     */
    public function test_update_non_existent_history_returns_404(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create();

        Sanctum::actingAs($user);

        $response = $this->putJson("/api/tasks/{$task->id}/history/999", [
            'value' => 20,
        ]);

        $response->assertStatus(404);
    }

    /**
     * Test partial update (only note).
     */
    public function test_partial_update_only_note(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create();
        $history = TaskHistory::create([
            'task_id' => $task->id,
            'value' => 10,
            'timestamp' => now(),
        ]);

        Sanctum::actingAs($user);

        $response = $this->putJson("/api/tasks/{$task->id}/history/{$history->id}", [
            'note' => 'Added a note',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'value' => 10, // unchanged
                    'note' => 'Added a note',
                ],
            ]);
    }

    /**
     * Test update history on non-existent task returns 404.
     */
    public function test_update_history_on_non_existent_task_returns_404(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->putJson('/api/tasks/999/history/1', [
            'value' => 20,
        ]);

        $response->assertStatus(404);
    }
}
