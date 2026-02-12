<?php

namespace App\Services;

use App\Models\Task;

class TaskResetService
{
    /**
     * Reset all eligible tasks based on their reset cycle.
     *
     * @return int Number of tasks reset
     */
    public function resetEligibleTasks(): int
    {
        $now = now();
        $resetCount = 0;

        $cycles = [
            'daily' => 1,
            'weekly' => 7,
            'monthly' => 30,
            'yearly' => 365,
        ];

        foreach ($cycles as $cycle => $days) {
            $cutoff = $now->copy()->subDays($days);

            $tasks = Task::where('reset_cycle', $cycle)
                ->where(function ($query) use ($cutoff) {
                    $query->whereNull('last_reset_at')
                        ->orWhere('last_reset_at', '<', $cutoff);
                })
                ->get();

            foreach ($tasks as $task) {
                $task->update([
                    'completed' => false,
                    'current_value' => 0,
                    'progress' => 0,
                    'last_reset_at' => $now,
                ]);
                $resetCount++;
            }
        }

        return $resetCount;
    }

    /**
     * Check if a task should be reset based on its cycle.
     *
     * @param Task $task
     * @return bool
     */
    public function shouldReset(Task $task): bool
    {
        if (!$task->reset_cycle) {
            return false;
        }

        $cycles = [
            'daily' => 1,
            'weekly' => 7,
            'monthly' => 30,
            'yearly' => 365,
        ];

        if (!isset($cycles[$task->reset_cycle])) {
            return false;
        }

        $days = $cycles[$task->reset_cycle];
        $cutoff = now()->copy()->subDays($days);

        if (!$task->last_reset_at) {
            return true;
        }

        return $task->last_reset_at->lt($cutoff);
    }

    /**
     * Reset a single task.
     *
     * @param Task $task
     * @return void
     */
    public function resetTask(Task $task): void
    {
        $task->update([
            'completed' => false,
            'current_value' => 0,
            'progress' => 0,
            'last_reset_at' => now(),
        ]);
    }
}
