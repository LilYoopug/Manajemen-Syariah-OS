<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'text' => $this->text,
            'completed' => $this->completed,
            'category' => $this->category,
            'progress' => $this->progress,
            'hasLimit' => $this->has_limit,
            'currentValue' => $this->current_value,
            'targetValue' => $this->target_value,
            'unit' => $this->unit,
            'resetCycle' => $this->reset_cycle,
            'perCheckEnabled' => $this->per_check_enabled,
            'incrementValue' => $this->increment_value,
            'lastResetAt' => $this->last_reset_at?->toISOString(),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
            'history' => TaskHistoryResource::collection($this->whenLoaded('history')),
        ];
    }
}
