<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Collection;
use App\Services\IslamicSourceService;

class DirectoryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = [
            'id' => $this->id,
            'title' => $this->title,
        ];

        // Parse content JSON for items
        if ($this->type === 'item' && $this->content) {
            $content = json_decode($this->content, true);
            if ($content) {
                // New structure with sources array
                if (isset($content['sources']) && is_array($content['sources'])) {
                    $data['sources'] = $content['sources'];
                }
                // Explanation
                if (isset($content['explanation'])) {
                    $data['explanation'] = $content['explanation'];
                }
            }
        }

        // Include children for folders
        if ($this->type === 'folder' && $this->relationLoaded('children')) {
            $data['children'] = DirectoryResource::collection($this->children);
        }

        return $data;
    }

    /**
     * Build a tree structure from a flat collection.
     *
     * @param Collection $allItems All directory items
     * @return Collection
     */
    public static function buildTree(Collection $allItems): Collection
    {
        // Group items by parent_id
        $grouped = $allItems->groupBy('parent_id');

        // Get root items (no parent)
        $rootItems = $allItems->whereNull('parent_id')->values();

        return $rootItems->map(function ($item) use ($grouped) {
            return self::buildItemWithChildren($item, $grouped);
        });
    }

    /**
     * Recursively build an item with its children.
     *
     * @param mixed $item
     * @param Collection $grouped
     * @return array
     */
    private static function buildItemWithChildren($item, Collection $grouped): array
    {
        $data = [
            'id' => $item->id,
            'title' => $item->title,
        ];

        // Parse content JSON for items
        if ($item->type === 'item' && $item->content) {
            $content = json_decode($item->content, true);
            if ($content) {
                // New structure with sources array
                if (isset($content['sources']) && is_array($content['sources'])) {
                    $data['sources'] = $content['sources'];
                }
                // Explanation
                if (isset($content['explanation'])) {
                    $data['explanation'] = $content['explanation'];
                }
            }
        }

        // Add children for folders
        if ($item->type === 'folder') {
            $children = $grouped->get($item->id, collect());
            if ($children->isNotEmpty()) {
                $data['children'] = $children->map(fn ($child) => self::buildItemWithChildren($child, $grouped))->values()->toArray();
            }
        }

        return $data;
    }
}
