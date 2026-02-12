<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DashboardResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'totalTasks' => $this->total_tasks ?? 0,
            'completedTasks' => $this->completed_tasks ?? 0,
            'completionPercentage' => $this->completion_percentage ?? 0,
            'tasksByCategory' => $this->tasks_by_category ?? [],
            'kepatuhanSyariahScore' => $this->kepatuhan_syariah_score ?? 0,
            'goalProgress' => $this->goal_progress ?? [],
            'overallGoalAchievement' => $this->overall_goal_achievement ?? 0,
            'chartData' => $this->chart_data ?? [],
        ];
    }
}
