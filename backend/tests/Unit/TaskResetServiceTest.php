<?php

namespace Tests\Unit;

use App\Models\Task;
use App\Models\User;
use App\Services\TaskResetService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskResetServiceTest extends TestCase
{
    use RefreshDatabase;

    protected TaskResetService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(TaskResetService::class);
    }

    /**
     * Test daily reset.
     */
    public function test_daily_reset(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create([
            'reset_cycle' => 'daily',
            'last_reset_at' => now()->subDays(2),
            'completed' => true,
            'current_value' => 100,
            'progress' => 100,
        ]);

        $resetCount = $this->service->resetEligibleTasks();

        $this->assertEquals(1, $resetCount);

        $task->refresh();
        $this->assertFalse($task->completed);
        $this->assertEquals(0, $task->current_value);
        $this->assertEquals(0, $task->progress);
        $this->assertNotNull($task->last_reset_at);
    }

    /**
     * Test weekly reset.
     */
    public function test_weekly_reset(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create([
            'reset_cycle' => 'weekly',
            'last_reset_at' => now()->subDays(8),
            'completed' => true,
            'current_value' => 50,
            'progress' => 50,
        ]);

        $resetCount = $this->service->resetEligibleTasks();

        $this->assertEquals(1, $resetCount);

        $task->refresh();
        $this->assertFalse($task->completed);
        $this->assertEquals(0, $task->current_value);
        $this->assertEquals(0, $task->progress);
    }

    /**
     * Test monthly reset.
     */
    public function test_monthly_reset(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create([
            'reset_cycle' => 'monthly',
            'last_reset_at' => now()->subDays(31),
            'completed' => true,
            'current_value' => 75,
            'progress' => 75,
        ]);

        $resetCount = $this->service->resetEligibleTasks();

        $this->assertEquals(1, $resetCount);

        $task->refresh();
        $this->assertFalse($task->completed);
        $this->assertEquals(0, $task->current_value);
        $this->assertEquals(0, $task->progress);
    }

    /**
     * Test yearly reset.
     */
    public function test_yearly_reset(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create([
            'reset_cycle' => 'yearly',
            'last_reset_at' => now()->subDays(366),
            'completed' => true,
            'current_value' => 100,
            'progress' => 100,
        ]);

        $resetCount = $this->service->resetEligibleTasks();

        $this->assertEquals(1, $resetCount);

        $task->refresh();
        $this->assertFalse($task->completed);
        $this->assertEquals(0, $task->current_value);
        $this->assertEquals(0, $task->progress);
    }

    /**
     * Test no reset if cycle not elapsed.
     */
    public function test_no_reset_if_cycle_not_elapsed(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create([
            'reset_cycle' => 'weekly',
            'last_reset_at' => now()->subDays(3),
            'completed' => true,
            'current_value' => 100,
            'progress' => 100,
        ]);

        $resetCount = $this->service->resetEligibleTasks();

        $this->assertEquals(0, $resetCount);

        $task->refresh();
        $this->assertTrue($task->completed);
        $this->assertEquals(100, $task->current_value);
        $this->assertEquals(100, $task->progress);
    }

    /**
     * Test only tasks with reset_cycle are processed.
     */
    public function test_only_tasks_with_reset_cycle_are_processed(): void
    {
        $user = User::factory()->create();

        // Task with no reset cycle
        Task::factory()->for($user)->create([
            'reset_cycle' => null,
            'completed' => true,
            'current_value' => 100,
            'progress' => 100,
        ]);

        // Task with reset cycle
        Task::factory()->for($user)->create([
            'reset_cycle' => 'daily',
            'last_reset_at' => now()->subDays(2),
            'completed' => true,
            'current_value' => 50,
            'progress' => 50,
        ]);

        $resetCount = $this->service->resetEligibleTasks();

        $this->assertEquals(1, $resetCount);
    }

    /**
     * Test task with null last_reset_at is reset.
     */
    public function test_task_with_null_last_reset_at_is_reset(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create([
            'reset_cycle' => 'daily',
            'last_reset_at' => null,
            'completed' => true,
            'current_value' => 100,
            'progress' => 100,
        ]);

        $resetCount = $this->service->resetEligibleTasks();

        $this->assertEquals(1, $resetCount);

        $task->refresh();
        $this->assertFalse($task->completed);
        $this->assertNotNull($task->last_reset_at);
    }

    /**
     * Test shouldReset method.
     */
    public function test_should_reset_method(): void
    {
        $user = User::factory()->create();

        // Task that should reset
        $task1 = Task::factory()->for($user)->create([
            'reset_cycle' => 'daily',
            'last_reset_at' => now()->subDays(2),
        ]);
        $this->assertTrue($this->service->shouldReset($task1));

        // Task that should not reset
        $task2 = Task::factory()->for($user)->create([
            'reset_cycle' => 'weekly',
            'last_reset_at' => now()->subDays(3),
        ]);
        $this->assertFalse($this->service->shouldReset($task2));

        // Task with no reset cycle
        $task3 = Task::factory()->for($user)->create([
            'reset_cycle' => null,
        ]);
        $this->assertFalse($this->service->shouldReset($task3));

        // Task with null last_reset_at
        $task4 = Task::factory()->for($user)->create([
            'reset_cycle' => 'daily',
            'last_reset_at' => null,
        ]);
        $this->assertTrue($this->service->shouldReset($task4));
    }

    /**
     * Test resetTask method.
     */
    public function test_reset_task_method(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create([
            'completed' => true,
            'current_value' => 100,
            'progress' => 100,
            'last_reset_at' => null,
        ]);

        $this->service->resetTask($task);

        $task->refresh();
        $this->assertFalse($task->completed);
        $this->assertEquals(0, $task->current_value);
        $this->assertEquals(0, $task->progress);
        $this->assertNotNull($task->last_reset_at);
    }

    /**
     * Test multiple tasks with different cycles.
     */
    public function test_multiple_tasks_with_different_cycles(): void
    {
        $user = User::factory()->create();

        // Daily task - should reset
        Task::factory()->for($user)->create([
            'reset_cycle' => 'daily',
            'last_reset_at' => now()->subDays(2),
        ]);

        // Weekly task - should not reset
        Task::factory()->for($user)->create([
            'reset_cycle' => 'weekly',
            'last_reset_at' => now()->subDays(3),
        ]);

        // Monthly task - should reset
        Task::factory()->for($user)->create([
            'reset_cycle' => 'monthly',
            'last_reset_at' => now()->subDays(35),
        ]);

        $resetCount = $this->service->resetEligibleTasks();

        $this->assertEquals(2, $resetCount);
    }
}
