<?php

namespace Tests\Feature\Dashboard;

use App\Models\Task;
use App\Models\TaskHistory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test dashboard returns KPI data.
     */
    public function test_dashboard_returns_kpi_data(): void
    {
        $user = User::factory()->create();
        Task::factory()->for($user)->count(5)->create(['completed' => true]);
        Task::factory()->for($user)->count(5)->create(['completed' => false]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/dashboard');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'kpi' => [
                        'totalTasks',
                        'completedTasks',
                        'completionPercentage',
                        'tasksByCategory',
                        'kepatuhanSyariahScore',
                    ],
                    'goals',
                    'overallProgress',
                    'chartTrend' => [
                        'labels',
                        'values',
                    ],
                ],
            ]);

        $this->assertEquals(10, $response->json('data.kpi.totalTasks'));
        $this->assertEquals(5, $response->json('data.kpi.completedTasks'));
        $this->assertEquals(50, $response->json('data.kpi.completionPercentage'));
    }

    /**
     * Test dashboard calculates tasks by category.
     */
    public function test_dashboard_calculates_tasks_by_category(): void
    {
        $user = User::factory()->create();
        Task::factory()->for($user)->count(3)->create(['category' => 'Keuangan', 'completed' => true]);
        Task::factory()->for($user)->count(2)->create(['category' => 'Keuangan', 'completed' => false]);
        Task::factory()->for($user)->count(4)->create(['category' => 'SDM', 'completed' => true]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/dashboard');

        $tasksByCategory = collect($response->json('data.kpi.tasksByCategory'));

        $keuangan = $tasksByCategory->firstWhere('category', 'Keuangan');
        $this->assertEquals(5, $keuangan['total']);
        $this->assertEquals(3, $keuangan['completed']);
        $this->assertEquals(60, $keuangan['rate']);

        $sdm = $tasksByCategory->firstWhere('category', 'SDM');
        $this->assertEquals(4, $sdm['total']);
        $this->assertEquals(4, $sdm['completed']);
        $this->assertEquals(100, $sdm['rate']);
    }

    /**
     * Test dashboard calculates Kepatuhan Syariah score.
     */
    public function test_dashboard_calculates_kepatuhan_syariah_score(): void
    {
        $user = User::factory()->create();
        Task::factory()->for($user)->count(4)->create(['category' => 'Kepatuhan', 'completed' => true]);
        Task::factory()->for($user)->count(6)->create(['category' => 'Kepatuhan', 'completed' => false]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/dashboard');

        // 4 out of 10 Kepatuhan tasks completed = 40%
        $this->assertEquals(40, $response->json('data.kpi.kepatuhanSyariahScore'));
    }

    /**
     * Test dashboard returns goal progress.
     */
    public function test_dashboard_returns_goal_progress(): void
    {
        $user = User::factory()->create();
        Task::factory()->for($user)->create([
            'category' => 'Keuangan',
            'has_limit' => true,
            'current_value' => 5000000,
            'target_value' => 10000000,
        ]);
        Task::factory()->for($user)->create([
            'category' => 'Keuangan',
            'has_limit' => true,
            'current_value' => 3000000,
            'target_value' => 10000000,
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/dashboard');

        $goals = collect($response->json('data.goals'));
        $keuanganGoal = $goals->firstWhere('category', 'Keuangan');

        $this->assertEquals(8000000, $keuanganGoal['currentValue']);
        $this->assertEquals(20000000, $keuanganGoal['targetValue']);
        $this->assertEquals(40, $keuanganGoal['progress']);
    }

    /**
     * Test dashboard returns overall progress.
     */
    public function test_dashboard_returns_overall_progress(): void
    {
        $user = User::factory()->create();
        Task::factory()->for($user)->create([
            'has_limit' => true,
            'current_value' => 5000000,
            'target_value' => 10000000,
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/dashboard');

        $this->assertEquals(50, $response->json('data.overallProgress'));
    }

    /**
     * Test dashboard returns empty data for user with no tasks.
     */
    public function test_dashboard_returns_empty_data_for_user_with_no_tasks(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/dashboard');

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'kpi' => [
                        'totalTasks' => 0,
                        'completedTasks' => 0,
                        'completionPercentage' => 0,
                        'tasksByCategory' => [],
                        'kepatuhanSyariahScore' => 0,
                    ],
                    'goals' => [],
                    'overallProgress' => 0,
                ],
            ]);
    }

    /**
     * Test dashboard only shows user's own tasks.
     */
    public function test_dashboard_only_shows_users_own_tasks(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        Task::factory()->for($user)->count(3)->create();
        Task::factory()->for($otherUser)->count(5)->create();

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/dashboard');

        $this->assertEquals(3, $response->json('data.kpi.totalTasks'));
    }

    /**
     * Test unauthenticated request returns 401.
     */
    public function test_unauthenticated_request_returns_401(): void
    {
        $response = $this->getJson('/api/dashboard');

        $response->assertStatus(401)
            ->assertJson([
                'message' => 'Unauthenticated.',
            ]);
    }

    /**
     * Test chart trend data.
     */
    public function test_chart_trend_data(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create();

        // Create history entries
        TaskHistory::create([
            'task_id' => $task->id,
            'value' => 1,
            'timestamp' => now()->subWeek(),
        ]);
        TaskHistory::create([
            'task_id' => $task->id,
            'value' => 1,
            'timestamp' => now()->subDays(3),
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/dashboard');

        $response->assertStatus(200);
        $this->assertCount(8, $response->json('data.chartTrend.labels'));
        $this->assertCount(8, $response->json('data.chartTrend.values'));
    }

    /**
     * Test progress caps at 100.
     */
    public function test_progress_caps_at_100(): void
    {
        $user = User::factory()->create();
        Task::factory()->for($user)->create([
            'has_limit' => true,
            'current_value' => 15000000,
            'target_value' => 10000000,
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/dashboard');

        $this->assertEquals(100, $response->json('data.overallProgress'));
    }
}
