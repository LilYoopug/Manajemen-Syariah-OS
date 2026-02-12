<?php

namespace Tests\Feature\Task;

use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TaskDeleteTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test successful task deletion.
     */
    public function test_user_can_delete_their_own_task(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create();

        Sanctum::actingAs($user);

        $response = $this->deleteJson("/api/tasks/{$task->id}");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Task deleted successfully',
            ]);

        // Verify task was deleted from database
        $this->assertDatabaseMissing('tasks', [
            'id' => $task->id,
        ]);
    }

    /**
     * Test user cannot delete another user's task.
     */
    public function test_user_cannot_delete_other_users_task(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $otherUserTask = Task::factory()->for($otherUser)->create();

        Sanctum::actingAs($user);

        $response = $this->deleteJson("/api/tasks/{$otherUserTask->id}");

        $response->assertStatus(404);

        // Verify task still exists
        $this->assertDatabaseHas('tasks', [
            'id' => $otherUserTask->id,
        ]);
    }

    /**
     * Test activity log is created on delete.
     */
    public function test_activity_log_is_created_on_delete(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create();

        Sanctum::actingAs($user);

        $this->deleteJson("/api/tasks/{$task->id}");

        $this->assertDatabaseHas('activity_logs', [
            'user_id' => $user->id,
            'action' => 'task.deleted',
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

        $response = $this->deleteJson("/api/tasks/{$task->id}");

        $response->assertStatus(401)
            ->assertJson([
                'message' => 'Unauthenticated.',
            ]);
    }

    /**
     * Test delete non-existent task returns 404.
     */
    public function test_delete_non_existent_task_returns_404(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->deleteJson('/api/tasks/999');

        $response->assertStatus(404);
    }

    /**
     * Test delete task removes it from user's task list.
     */
    public function test_delete_task_removes_from_users_task_list(): void
    {
        $user = User::factory()->create();
        $task1 = Task::factory()->for($user)->create(['text' => 'Task 1']);
        $task2 = Task::factory()->for($user)->create(['text' => 'Task 2']);

        Sanctum::actingAs($user);

        // Delete task1
        $this->deleteJson("/api/tasks/{$task1->id}");

        // Verify only task2 remains in the list
        $response = $this->getJson('/api/tasks');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
        $this->assertEquals('Task 2', $response->json('data.0.text'));
    }

    /**
     * Test delete task with numeric target.
     */
    public function test_delete_task_with_numeric_target(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create([
            'has_limit' => true,
            'target_value' => 10000000,
            'unit' => 'IDR',
        ]);

        Sanctum::actingAs($user);

        $response = $this->deleteJson("/api/tasks/{$task->id}");

        $response->assertStatus(200);

        $this->assertDatabaseMissing('tasks', [
            'id' => $task->id,
        ]);
    }

    /**
     * Test delete task with reset cycle.
     */
    public function test_delete_task_with_reset_cycle(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create([
            'reset_cycle' => 'daily',
        ]);

        Sanctum::actingAs($user);

        $response = $this->deleteJson("/api/tasks/{$task->id}");

        $response->assertStatus(200);

        $this->assertDatabaseMissing('tasks', [
            'id' => $task->id,
        ]);
    }

    /**
     * Test admin can delete their own task.
     */
    public function test_admin_can_delete_their_own_task(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $task = Task::factory()->for($admin)->create();

        Sanctum::actingAs($admin);

        $response = $this->deleteJson("/api/tasks/{$task->id}");

        $response->assertStatus(200);

        $this->assertDatabaseMissing('tasks', [
            'id' => $task->id,
        ]);
    }
}
