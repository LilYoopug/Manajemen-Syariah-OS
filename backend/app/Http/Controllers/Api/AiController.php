<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Ai\ChatRequest;
use App\Services\AiProxyService;
use Illuminate\Http\JsonResponse;

class AiController extends Controller
{
    /**
     * @var AiProxyService
     */
    protected AiProxyService $aiProxyService;

    /**
     * Create a new AiController instance.
     */
    public function __construct(AiProxyService $aiProxyService)
    {
        $this->aiProxyService = $aiProxyService;
    }

    /**
     * Handle chat requests to the AI assistant.
     *
     * @param ChatRequest $request
     * @return JsonResponse
     */
    public function chat(ChatRequest $request): JsonResponse
    {
        try {
            $result = $this->aiProxyService->chat($request->input('message'));

            return response()->json([
                'data' => $result,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 503);
        }
    }
}
