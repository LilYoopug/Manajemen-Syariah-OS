<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Directory\StoreDirectoryRequest;
use App\Http\Requests\Directory\UpdateDirectoryRequest;
use App\Http\Resources\DirectoryResource;
use App\Models\DirectoryItem;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DirectoryController extends Controller
{
    /**
     * @var ActivityLogService
     */
    protected ActivityLogService $activityLogService;

    /**
     * Create a new DirectoryController instance.
     */
    public function __construct(ActivityLogService $activityLogService)
    {
        $this->activityLogService = $activityLogService;
    }

    /**
     * Get the complete directory tree.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        // Load all items in a single query for optimal performance
        $allItems = DirectoryItem::all();

        // Build tree structure from flat collection
        $tree = DirectoryResource::buildTree($allItems);

        return response()->json([
            'data' => $tree,
        ]);
    }

    /**
     * Create a new directory item.
     *
     * @param StoreDirectoryRequest $request
     * @return JsonResponse
     */
    public function store(StoreDirectoryRequest $request): JsonResponse
    {
        $validated = $request->validated();

        // Prepare content as JSON string for items
        $content = null;
        if ($validated['type'] === 'item' && isset($validated['content'])) {
            $content = json_encode($validated['content']);
        }

        $item = DirectoryItem::create([
            'title' => $validated['title'],
            'type' => $validated['type'],
            'parent_id' => $validated['parentId'] ?? null,
            'content' => $content,
        ]);

        // Log activity
        $this->activityLogService->log('directory.item_created', request()->user()->id);

        return response()->json([
            'data' => new DirectoryResource($item),
        ], 201);
    }

    /**
     * Update a directory item.
     *
     * @param UpdateDirectoryRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(UpdateDirectoryRequest $request, int $id): JsonResponse
    {
        $item = DirectoryItem::findOrFail($id);

        $validated = $request->validated();

        DB::transaction(function () use ($item, $validated): void {
            $updateData = [];

            if (isset($validated['title'])) {
                $updateData['title'] = $validated['title'];
            }

            if (array_key_exists('parentId', $validated)) {
                $updateData['parent_id'] = $validated['parentId'];
            }

            if (array_key_exists('content', $validated)) {
                $updateData['content'] = $validated['content'] ? json_encode($validated['content']) : null;
            }

            if (!empty($updateData)) {
                $item->update($updateData);
            }

            // Log activity
            $this->activityLogService->log('directory.item_updated', request()->user()->id);
        });

        return response()->json([
            'data' => new DirectoryResource($item->fresh()),
        ]);
    }

    /**
     * Delete a directory item.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        $item = DirectoryItem::findOrFail($id);

        DB::transaction(function () use ($item): void {
            // Delete item (cascade handles children via FK)
            $item->delete();

            // Log activity
            $this->activityLogService->log('directory.item_deleted', request()->user()->id);
        });

        return response()->json([
            'message' => 'Directory item deleted successfully',
        ]);
    }
}
