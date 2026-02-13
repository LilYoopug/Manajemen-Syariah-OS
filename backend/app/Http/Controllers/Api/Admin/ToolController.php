<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreToolRequest;
use App\Http\Requests\Admin\UpdateToolRequest;
use App\Http\Resources\ToolResource;
use App\Models\Tool;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;

class ToolController extends Controller
{
    protected ActivityLogService $activityLogService;

    /**
     * Create a new ToolController instance.
     */
    public function __construct(ActivityLogService $activityLogService)
    {
        $this->activityLogService = $activityLogService;
    }

    /**
     * Get all tools.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $tools = Tool::all();

        return ToolResource::collection($tools)
            ->response()
            ->setStatusCode(200);
    }

    /**
     * Create a new tool.
     *
     * @param StoreToolRequest $request
     * @return JsonResponse
     */
    public function store(StoreToolRequest $request): JsonResponse
    {
        $tool = Tool::create($request->validated());

        $this->activityLogService->logAdmin('admin.tool_created', $tool);

        return (new ToolResource($tool))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Update an existing tool.
     *
     * @param UpdateToolRequest $request
     * @param Tool $tool
     * @return JsonResponse
     */
    public function update(UpdateToolRequest $request, Tool $tool): JsonResponse
    {
        $tool->update($request->validated());

        $this->activityLogService->logAdmin('admin.tool_updated', $tool);

        return (new ToolResource($tool))
            ->response()
            ->setStatusCode(200);
    }

    /**
     * Delete a tool.
     *
     * @param Tool $tool
     * @return JsonResponse
     */
    public function destroy(Tool $tool): JsonResponse
    {
        $this->activityLogService->logAdmin('admin.tool_deleted', $tool);

        $tool->delete();

        return response()->json([
            'message' => 'Tool deleted successfully.',
        ]);
    }
}
