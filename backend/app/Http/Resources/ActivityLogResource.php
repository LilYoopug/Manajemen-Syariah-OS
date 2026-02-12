<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActivityLogResource extends JsonResource
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
            'userId' => $this->user_id,
            'user' => $this->whenLoaded('user', fn() => [
                'name' => $this->user->name,
                'email' => $this->user->email,
            ]),
            'action' => $this->action,
            'subjectType' => $this->subject_type,
            'subjectId' => $this->subject_id,
            'metadata' => $this->metadata,
            'createdAt' => $this->created_at?->toISOString(),
        ];
    }
}
