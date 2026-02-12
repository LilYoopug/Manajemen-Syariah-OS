<?php

namespace Tests\Feature\Task;

use App\Models\Task;
use App\Models\TaskHistory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TaskShowTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test user can view their own task with history.
     */
    public function test_user_can_view_their_own_task_with_history(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create();

        // Create some history entries
        TaskHistory::create([
            'task_id' => $task->id,
            'value' => 1,
            'timestamp' => now(),
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/tasks/{$task->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
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
                    'history' => [
                        '*' => ['id', 'value', 'note', 'timestamp', 'createdAt', 'updatedAt'],
                    ],
                ],
            ]);
    }

    /**
     * Test user cannot view other user's task.
     */
    public function test_user_cannot_view_other_users_task(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $otherUserTask = Task::factory()->for($otherUser)->create();

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/tasks/{$otherUserTask->id}");

        $response->assertStatus(404);
    }

    /**
     * Test unauthenticated request returns 401.
     */
    public function test_unauthenticated_request_returns_401(): void
    {
        $task = Task::factory()->create();

        $response = $this->getJson("/api/tasks/{$task->id}");

        $response->assertStatus(401)
            ->assertJson([
                'message' => 'Unauthenticated.',
            ]);
    }

    /**
     * Test show non-existent task returns 404.
     */
    public function test_show_non_existent_task_returns_404(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/tasks/999');

        $response->assertStatus(404);
    }

    /**
     * Test task with no history returns empty history array.
     */
    public function test_task_with_no_history_returns_empty_history_array(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create();

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/tasks/{$task->id}");

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'history' => [],
                ],
            ]);
    }

    /**
     * Test task with multiple history entries.
     */
    public function test_task_with_multiple_history_entries(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create();

        // Create multiple history entries
        TaskHistory::create(['task_id' => $task->id, 'value' => 1, 'timestamp' => now()]);
        TaskHistory::create(['task_id' => $task->id, 'value' => 1, 'timestamp' => now()]);
        TaskHistory::create(['task_id' => $task->id, 'value' => 1, 'timestamp' => now()]);

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/tasks/{$task->id}");

        $response->assertStatus(200);
        $this->assertCount(3, $response->json('data.history'));
    }
}
