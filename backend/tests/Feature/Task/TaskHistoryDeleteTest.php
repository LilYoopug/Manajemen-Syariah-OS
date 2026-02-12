<?php

namespace Tests\Feature\Task;

use App\Models\Task;
use App\Models\TaskHistory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TaskHistoryDeleteTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test user can delete history entry.
     */
    public function test_user_can_delete_history_entry(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create();
        $history = TaskHistory::create([
            'task_id' => $task->id,
            'value' => 10,
            'timestamp' => now(),
        ]);

        Sanctum::actingAs($user);

        $response = $this->deleteJson("/api/tasks/{$task->id}/history/{$history->id}");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'History entry deleted successfully',
            ]);

        $this->assertDatabaseMissing('task_histories', [
            'id' => $history->id,
        ]);
    }

    /**
     * Test delete history triggers task recalculation.
     */
    public function test_delete_history_triggers_task_recalculation(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create([
            'has_limit' => true,
            'target_value' => 100,
            'current_value' => 30,
            'progress' => 30,
        ]);

        // Create multiple history entries
        $history1 = TaskHistory::create([
            'task_id' => $task->id,
            'value' => 10,
            'timestamp' => now(),
        ]);
        TaskHistory::create([
            'task_id' => $task->id,
            'value' => 20,
            'timestamp' => now(),
        ]);

        Sanctum::actingAs($user);

        // Delete first history entry
        $this->deleteJson("/api/tasks/{$task->id}/history/{$history1->id}");

        // Task current_value should be recalculated to 20
        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'current_value' => 20,
            'progress' => 20,
        ]);
    }

    /**
     * Test delete last history entry resets task.
     */
    public function test_delete_last_history_entry_resets_task(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create([
            'has_limit' => true,
            'target_value' => 100,
            'current_value' => 10,
            'progress' => 10,
            'completed' => false,
        ]);
        $history = TaskHistory::create([
            'task_id' => $task->id,
            'value' => 10,
            'timestamp' => now(),
        ]);

        Sanctum::actingAs($user);

        $this->deleteJson("/api/tasks/{$task->id}/history/{$history->id}");

        // Task should be reset
        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'current_value' => 0,
            'progress' => 0,
            'completed' => false,
        ]);
    }

    /**
     * Test user cannot delete other user's history.
     */
    public function test_user_cannot_delete_other_users_history(): void
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

        $response = $this->deleteJson("/api/tasks/{$otherTask->id}/history/{$otherHistory->id}");

        $response->assertStatus(404);

        // Verify history still exists
        $this->assertDatabaseHas('task_histories', [
            'id' => $otherHistory->id,
        ]);
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

        $response = $this->deleteJson("/api/tasks/{$task->id}/history/{$history->id}");

        $response->assertStatus(401)
            ->assertJson([
                'message' => 'Unauthenticated.',
            ]);
    }

    /**
     * Test delete non-existent history returns 404.
     */
    public function test_delete_non_existent_history_returns_404(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create();

        Sanctum::actingAs($user);

        $response = $this->deleteJson("/api/tasks/{$task->id}/history/999");

        $response->assertStatus(404);
    }

    /**
     * Test delete history on non-existent task returns 404.
     */
    public function test_delete_history_on_non_existent_task_returns_404(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->deleteJson('/api/tasks/999/history/1');

        $response->assertStatus(404);
    }

    /**
     * Test delete history from completed task uncompletes it.
     */
    public function test_delete_history_from_completed_task_uncompletes_it(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create([
            'has_limit' => true,
            'target_value' => 100,
            'current_value' => 100,
            'progress' => 100,
            'completed' => true,
        ]);
        $history = TaskHistory::create([
            'task_id' => $task->id,
            'value' => 100,
            'timestamp' => now(),
        ]);

        Sanctum::actingAs($user);

        $this->deleteJson("/api/tasks/{$task->id}/history/{$history->id}");

        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'completed' => false,
            'progress' => 0,
            'current_value' => 0,
        ]);
    }

    /**
     * Test deleting history removes it from task's history list.
     */
    public function test_deleting_history_removes_from_task_history_list(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create();

        $history1 = TaskHistory::create([
            'task_id' => $task->id,
            'value' => 10,
            'timestamp' => now(),
        ]);
        TaskHistory::create([
            'task_id' => $task->id,
            'value' => 20,
            'timestamp' => now(),
        ]);

        Sanctum::actingAs($user);

        // Delete first history
        $this->deleteJson("/api/tasks/{$task->id}/history/{$history1->id}");

        // Check task has only one history entry
        $response = $this->getJson("/api/tasks/{$task->id}");

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data.history'));
    }
}
