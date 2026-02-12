<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ToolResource;
use App\Models\Tool;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ToolController extends Controller
{
    /**
     * Get all tools with optional category filter.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $query = Tool::query();

        if ($request->has('category') && $request->input('category') !== '') {
            $query->where('category', $request->input('category'));
        }

        $tools = $query->get();

        return response()->json([
            'data' => ToolResource::collection($tools),
        ]);
    }

    /**
     * Get a single tool by ID.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $tool = Tool::findOrFail($id);

        return response()->json([
            'data' => new ToolResource($tool),
        ]);
    }
}
