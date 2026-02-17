<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ToolResource extends JsonResource
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
            'name' => $this->name,
            'category' => $this->category,
            'description' => $this->description,
            'inputs' => $this->inputs,
            'outputs' => $this->outputs,
            'benefits' => $this->benefits,
            'shariaBasis' => $this->sharia_basis,
            'link' => $this->link,
            'relatedDirectoryIds' => $this->related_directory_ids,
            'relatedDalilText' => $this->related_dalil_text,
            'relatedDalilSource' => $this->related_dalil_source,
            'sources' => $this->sources,
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
