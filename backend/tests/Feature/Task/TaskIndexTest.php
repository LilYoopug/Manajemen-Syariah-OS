<?php

namespace Tests\Feature\Task;

use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TaskIndexTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test authenticated user gets their tasks only.
     */
    public function test_authenticated_user_gets_their_tasks_only(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        // Create tasks for both users
        Task::factory()->count(3)->for($user)->create();
        Task::factory()->count(2)->for($otherUser)->create();

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/tasks');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
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
                        'perCheckEnabled',
                        'incrementValue',
                        'lastResetAt',
                        'createdAt',
                        'updatedAt',
                    ],
                ],
            ]);

        // Should only return 3 tasks (user's tasks)
        $this->assertCount(3, $response->json('data'));
    }

    /**
     * Test filter by category.
     */
    public function test_filter_by_category(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        // Create tasks in different categories
        Task::factory()->for($user)->create(['category' => 'Keuangan', 'text' => 'Task 1']);
        Task::factory()->for($user)->create(['category' => 'Keuangan', 'text' => 'Task 2']);
        Task::factory()->for($user)->create(['category' => 'SDM', 'text' => 'Task 3']);

        $response = $this->getJson('/api/tasks?category=Keuangan');

        $response->assertStatus(200);

        // Should only return 2 tasks in Keuangan category
        $this->assertCount(2, $response->json('data'));

        foreach ($response->json('data') as $task) {
            $this->assertEquals('Keuangan', $task['category']);
        }
    }

    /**
     * Test search by text.
     */
    public function test_search_by_text(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        // Create tasks with different text
        Task::factory()->for($user)->create(['text' => 'Bayar Zakat Mal']);
        Task::factory()->for($user)->create(['text' => 'Hitung Zakat Penghasilan']);
        Task::factory()->for($user)->create(['text' => 'Review Laporan Keuangan']);

        $response = $this->getJson('/api/tasks?search=zakat');

        $response->assertStatus(200);

        // Should only return 2 tasks containing 'zakat'
        $this->assertCount(2, $response->json('data'));

        foreach ($response->json('data') as $task) {
            $this->assertStringContainsStringIgnoringCase('zakat', $task['text']);
        }
    }

    /**
     * Test filter by reset cycle.
     */
    public function test_filter_by_reset_cycle(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        // Create tasks with different reset cycles
        Task::factory()->for($user)->create(['reset_cycle' => 'daily', 'text' => 'Task 1']);
        Task::factory()->for($user)->create(['reset_cycle' => 'daily', 'text' => 'Task 2']);
        Task::factory()->for($user)->create(['reset_cycle' => 'monthly', 'text' => 'Task 3']);
        Task::factory()->for($user)->create(['reset_cycle' => null, 'text' => 'Task 4']);

        $response = $this->getJson('/api/tasks?cycle=daily');

        $response->assertStatus(200);

        // Should only return 2 tasks with daily cycle
        $this->assertCount(2, $response->json('data'));

        foreach ($response->json('data') as $task) {
            $this->assertEquals('daily', $task['resetCycle']);
        }
    }

    /**
     * Test combined filters.
     */
    public function test_combined_filters(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        // Create tasks with various combinations
        Task::factory()->for($user)->create([
            'category' => 'Keuangan',
            'text' => 'Bayar Zakat Mal',
            'reset_cycle' => 'monthly',
        ]);
        Task::factory()->for($user)->create([
            'category' => 'Keuangan',
            'text' => 'Review Zakat',
            'reset_cycle' => 'daily',
        ]);
        Task::factory()->for($user)->create([
            'category' => 'Keuangan',
            'text' => 'Investasi Halal',
            'reset_cycle' => 'monthly',
        ]);
        Task::factory()->for($user)->create([
            'category' => 'SDM',
            'text' => 'Zakat Fitrah',
            'reset_cycle' => 'yearly',
        ]);

        // Filter by category and search
        $response = $this->getJson('/api/tasks?category=Keuangan&search=zakat');

        $response->assertStatus(200);

        // Should only return 2 tasks (Keuangan + contains 'zakat')
        $this->assertCount(2, $response->json('data'));

        foreach ($response->json('data') as $task) {
            $this->assertEquals('Keuangan', $task['category']);
            $this->assertStringContainsStringIgnoringCase('zakat', $task['text']);
        }
    }

    /**
     * Test user cannot see other user's tasks.
     */
    public function test_user_cannot_see_other_users_tasks(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        $otherUserTask = Task::factory()->for($otherUser)->create(['text' => 'Other User Task']);
        Task::factory()->for($user)->create(['text' => 'My Task']);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/tasks');

        $response->assertStatus(200);

        $taskIds = collect($response->json('data'))->pluck('id')->toArray();

        // Should not include other user's task
        $this->assertNotContains($otherUserTask->id, $taskIds);
        $this->assertCount(1, $taskIds);
    }

    /**
     * Test unauthenticated request returns 401.
     */
    public function test_unauthenticated_request_returns_401(): void
    {
        $response = $this->getJson('/api/tasks');

        $response->assertStatus(401)
            ->assertJson([
                'message' => 'Unauthenticated.',
            ]);
    }

    /**
     * Test empty response when user has no tasks.
     */
    public function test_empty_response_when_no_tasks(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/tasks');

        $response->assertStatus(200)
            ->assertJson([
                'data' => [],
            ]);
    }

    /**
     * Test search is case insensitive.
     */
    public function test_search_is_case_insensitive(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        Task::factory()->for($user)->create(['text' => 'ZAKAT MAL']);
        Task::factory()->for($user)->create(['text' => 'zakat fitrah']);

        $response = $this->getJson('/api/tasks?search=ZakAt');

        $response->assertStatus(200);

        // Should return both tasks (case insensitive)
        $this->assertCount(2, $response->json('data'));
    }

    /**
     * Test tasks are ordered by created_at descending.
     */
    public function test_tasks_are_ordered_by_created_at_descending(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $task1 = Task::factory()->for($user)->create(['text' => 'First Task']);
        $task2 = Task::factory()->for($user)->create(['text' => 'Second Task']);
        $task3 = Task::factory()->for($user)->create(['text' => 'Third Task']);

        $response = $this->getJson('/api/tasks');

        $response->assertStatus(200);

        $tasks = $response->json('data');

        // Most recent task should be first
        $this->assertEquals('Third Task', $tasks[0]['text']);
        $this->assertEquals('Second Task', $tasks[1]['text']);
        $this->assertEquals('First Task', $tasks[2]['text']);
    }
}
