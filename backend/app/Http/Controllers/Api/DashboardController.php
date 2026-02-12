<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DashboardResource;
use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * @var DashboardService
     */
    protected DashboardService $dashboardService;

    /**
     * Create a new DashboardController instance.
     */
    public function __construct(DashboardService $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    /**
     * Get the authenticated user's dashboard data.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $dashboardData = $this->dashboardService->getDashboardData($user);

        return response()->json([
            'data' => new DashboardResource((object) $dashboardData),
        ]);
    }
}
