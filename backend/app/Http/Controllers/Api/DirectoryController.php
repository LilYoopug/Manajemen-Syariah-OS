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
     * Get the directory tree for the authenticated user.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $userId = request()->user()?->id;

        // Load items scoped to user (includes system-wide items with null user_id)
        $allItems = DirectoryItem::forUser($userId)->get();

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
        $userId = $request->user()->id;

        // Prepare content as JSON string for items
        $content = null;
        if ($validated['type'] === 'item' && isset($validated['content'])) {
            $content = json_encode($validated['content']);
        }

        // Validate parent belongs to user if specified
        if (isset($validated['parentId'])) {
            $parent = DirectoryItem::forUser($userId)->find($validated['parentId']);
            if (!$parent) {
                return response()->json([
                    'message' => 'Parent item not found or access denied.',
                ], 404);
            }
        }

        $item = DirectoryItem::create([
            'user_id' => $userId,
            'title' => $validated['title'],
            'type' => $validated['type'],
            'parent_id' => $validated['parentId'] ?? null,
            'content' => $content,
        ]);

        // Log activity
        $this->activityLogService->log('directory.item_created', $userId);

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
        $userId = $request->user()->id;

        // Find item scoped to user (IDOR protection)
        $item = DirectoryItem::forUser($userId)->find($id);

        if (!$item) {
            return response()->json([
                'message' => 'Item not found or access denied.',
            ], 404);
        }

        // Only allow editing own items (not system-wide items)
        if ($item->user_id !== $userId) {
            return response()->json([
                'message' => 'You can only edit your own items.',
            ], 403);
        }

        $validated = $request->validated();

        // SECURITY: Validate parent belongs to user if specified (IDOR protection)
        if (isset($validated['parentId'])) {
            $parent = DirectoryItem::forUser($userId)->find($validated['parentId']);
            if (!$parent) {
                return response()->json([
                    'message' => 'Parent item not found or access denied.',
                ], 404);
            }
            // Prevent setting item as its own parent (circular reference)
            if ($validated['parentId'] === $id) {
                return response()->json([
                    'message' => 'Cannot set item as its own parent.',
                ], 422);
            }
        }

        DB::transaction(function () use ($item, $validated, $userId): void {
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
            $this->activityLogService->log('directory.item_updated', $userId);
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
        $userId = request()->user()->id;

        // Find item scoped to user (IDOR protection)
        $item = DirectoryItem::forUser($userId)->find($id);

        if (!$item) {
            return response()->json([
                'message' => 'Item not found or access denied.',
            ], 404);
        }

        // Only allow deleting own items (not system-wide items)
        if ($item->user_id !== $userId) {
            return response()->json([
                'message' => 'You can only delete your own items.',
            ], 403);
        }

        DB::transaction(function () use ($item, $userId): void {
            // Delete item (cascade handles children via FK)
            $item->delete();

            // Log activity
            $this->activityLogService->log('directory.item_deleted', $userId);
        });

        return response()->json([
            'message' => 'Directory item deleted successfully',
        ]);
    }
}
