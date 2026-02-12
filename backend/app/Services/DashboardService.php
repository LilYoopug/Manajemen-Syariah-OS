<?php

namespace App\Services;

use App\Models\Task;
use Illuminate\Support\Collection;

class DashboardService
{
    /**
     * Get KPI data for the user's dashboard.
     *
     * @param Collection $tasks
     * @return array
     */
    public function getKpiData(Collection $tasks): array
    {
        $totalTasks = $tasks->count();
        $completedTasks = $tasks->where('completed', true)->count();
        $completionPercentage = $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100) : 0;

        // Group tasks by category
        $tasksByCategory = $tasks->groupBy('category')->map(function ($categoryTasks, $category) {
            $total = $categoryTasks->count();
            $completed = $categoryTasks->where('completed', true)->count();
            return [
                'category' => $category,
                'total' => $total,
                'completed' => $completed,
                'rate' => $total > 0 ? round(($completed / $total) * 100) : 0,
            ];
        })->values()->toArray();

        // Calculate Kepatuhan Syariah score (tasks in "Kepatuhan" category)
        $kepatuhanTasks = $tasks->where('category', 'Kepatuhan');
        $kepatuhanTotal = $kepatuhanTasks->count();
        $kepatuhanCompleted = $kepatuhanTasks->where('completed', true)->count();
        $kepatuhanSyariahScore = $kepatuhanTotal > 0 ? round(($kepatuhanCompleted / $kepatuhanTotal) * 100) : 0;

        return [
            'totalTasks' => $totalTasks,
            'completedTasks' => $completedTasks,
            'completionPercentage' => $completionPercentage,
            'tasksByCategory' => $tasksByCategory,
            'kepatuhanSyariahScore' => $kepatuhanSyariahScore,
        ];
    }

    /**
     * Get goal progress data from tasks with numeric targets.
     *
     * @param Collection $tasks
     * @return array
     */
    public function getGoalProgress(Collection $tasks): array
    {
        // Filter tasks with limits/targets
        $tasksWithTargets = $tasks->where('has_limit', true)
            ->where('target_value', '>', 0);

        $goals = $tasksWithTargets->groupBy('category')->map(function ($categoryTasks, $category) {
            $totalCurrentValue = $categoryTasks->sum('current_value');
            $totalTargetValue = $categoryTasks->sum('target_value');
            $progress = $totalTargetValue > 0 ? round(($totalCurrentValue / $totalTargetValue) * 100) : 0;

            return [
                'category' => $category,
                'currentValue' => $totalCurrentValue,
                'targetValue' => $totalTargetValue,
                'progress' => min(100, $progress),
            ];
        })->values()->toArray();

        // Calculate overall progress
        $overallCurrentValue = $tasksWithTargets->sum('current_value');
        $overallTargetValue = $tasksWithTargets->sum('target_value');
        $overallProgress = $overallTargetValue > 0 ? round(($overallCurrentValue / $overallTargetValue) * 100) : 0;

        return [
            'goals' => $goals,
            'overallProgress' => min(100, $overallProgress),
        ];
    }

    /**
     * Get chart trend data from task history.
     *
     * @param Collection $tasks
     * @param int $weeks Number of weeks to include
     * @return array
     */
    public function getChartTrendData(Collection $tasks, int $weeks = 8): array
    {
        $labels = [];
        $values = [];

        // Generate labels for the last N weeks
        for ($i = $weeks - 1; $i >= 0; $i--) {
            $weekStart = now()->subWeeks($i)->startOfWeek();
            $weekEnd = now()->subWeeks($i)->endOfWeek();

            $labels[] = $weekStart->format('M d') . ' - ' . $weekEnd->format('M d');

            // Count history entries created in this week
            $count = 0;
            foreach ($tasks as $task) {
                $count += $task->history()
                    ->whereBetween('timestamp', [$weekStart, $weekEnd])
                    ->count();
            }
            $values[] = $count;
        }

        return [
            'labels' => $labels,
            'values' => $values,
        ];
    }

    /**
     * Get complete dashboard data for a user.
     *
     * @param mixed $user
     * @return array
     */
    public function getDashboardData($user): array
    {
        $tasks = $user->tasks()->with('history')->get();

        return [
            'kpi' => $this->getKpiData($tasks),
            'goals' => $this->getGoalProgress($tasks)['goals'],
            'overallProgress' => $this->getGoalProgress($tasks)['overallProgress'],
            'chartTrend' => $this->getChartTrendData($tasks),
        ];
    }
}
