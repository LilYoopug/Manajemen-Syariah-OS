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
            'kpi' => [
                'totalTasks' => $this->kpi['totalTasks'] ?? 0,
                'completedTasks' => $this->kpi['completedTasks'] ?? 0,
                'completionPercentage' => $this->kpi['completionPercentage'] ?? 0,
                'tasksByCategory' => $this->kpi['tasksByCategory'] ?? [],
                'kepatuhanSyariahScore' => $this->kpi['kepatuhanSyariahScore'] ?? 0,
            ],
            'goals' => $this->goals ?? [],
            'overallProgress' => $this->overallProgress ?? 0,
            'chartTrend' => [
                'labels' => $this->chartTrend['labels'] ?? [],
                'values' => $this->chartTrend['values'] ?? [],
            ],
        ];
    }
}
