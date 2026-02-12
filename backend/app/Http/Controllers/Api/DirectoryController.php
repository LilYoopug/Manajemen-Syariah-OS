<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DirectoryResource;
use App\Models\DirectoryItem;
use Illuminate\Http\JsonResponse;

class DirectoryController extends Controller
{
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
}
