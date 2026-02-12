<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    /**
     * Get the authenticated user's categories.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $categories = request()->user()->categories()->get();

        return response()->json([
            'data' => CategoryResource::collection($categories),
        ]);
    }
}
