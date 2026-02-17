<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Ai\ChatRequest;
use App\Http\Requests\Ai\GeneratePlanRequest;
use App\Http\Requests\Ai\InsightRequest;
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

    /**
     * Generate a strategic plan based on user goals.
     *
     * @param GeneratePlanRequest $request
     * @return JsonResponse
     */
    public function generatePlan(GeneratePlanRequest $request): JsonResponse
    {
        try {
            $goals = $request->input('goals');
            $context = $request->input('context');

            $result = $this->aiProxyService->generatePlan($goals, $context);

            return response()->json([
                'data' => $result,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 503);
        }
    }

    /**
     * Generate insights based on KPI data.
     *
     * @param InsightRequest $request
     * @return JsonResponse
     */
    public function insight(InsightRequest $request): JsonResponse
    {
        try {
            $kpiData = $request->input('kpiData');
            $goalData = $request->input('goalData', []);

            $result = $this->aiProxyService->insight([
                'kpiData' => $kpiData,
                'goalData' => $goalData,
            ]);

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
