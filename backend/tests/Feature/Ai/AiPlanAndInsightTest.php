<?php

namespace Tests\Feature\Ai;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class AiPlanAndInsightTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Set up the test environment.
     */
    protected function setUp(): void
    {
        parent::setUp();
        // Set a fake API key for tests that need it
        config(['services.gemini.api_key' => 'test-api-key']);
    }

    // ==========================================
    // Generate Plan Tests
    // ==========================================

    /**
     * Test authenticated user can generate a plan.
     */
    public function test_user_can_generate_plan(): void
    {
        $user = User::factory()->create();

        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response([
                'candidates' => [
                    [
                        'content' => [
                            'parts' => [
                                ['text' => 'This is a mock strategic plan.'],
                            ],
                        ],
                    ],
                ],
            ], 200),
        ]);

        $response = $this->actingAs($user)
            ->postJson('/api/ai/generate-plan', [
                'goals' => 'Increase task completion and improve consistency',
                'context' => 'Small business owner focusing on daily habits',
            ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'plan',
                ],
            ])
            ->assertJson([
                'data' => [
                    'plan' => 'This is a mock strategic plan.',
                ],
            ]);
    }

    /**
     * Test generate plan with minimal data (no context).
     */
    public function test_generate_plan_without_context(): void
    {
        $user = User::factory()->create();

        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response([
                'candidates' => [
                    [
                        'content' => [
                            'parts' => [
                                ['text' => 'Plan generated.'],
                            ],
                        ],
                    ],
                ],
            ], 200),
        ]);

        $response = $this->actingAs($user)
            ->postJson('/api/ai/generate-plan', [
                'goals' => 'Goal 1 description',
            ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'plan',
                ],
            ]);
    }

    /**
     * Test generate plan requires goals array.
     */
    public function test_generate_plan_requires_goals(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/ai/generate-plan', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['goals']);
    }

    /**
     * Test generate plan goals must be string.
     */
    public function test_generate_plan_goals_must_be_string(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/ai/generate-plan', [
                'goals' => ['an', 'array'],
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['goals']);
    }

    /**
     * Test generate plan handles API error gracefully.
     */
    public function test_generate_plan_handles_api_error(): void
    {
        $user = User::factory()->create();

        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response([
                'error' => [
                    'message' => 'API error',
                ],
            ], 500),
        ]);

        $response = $this->actingAs($user)
            ->postJson('/api/ai/generate-plan', [
                'goals' => 'Goal 1 description',
            ]);

        $response->assertStatus(503)
            ->assertJsonStructure(['message']);
    }

    /**
     * Test generate plan handles connection error gracefully.
     */
    public function test_generate_plan_handles_connection_error(): void
    {
        $user = User::factory()->create();

        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::failedConnection('Connection refused'),
        ]);

        $response = $this->actingAs($user)
            ->postJson('/api/ai/generate-plan', [
                'goals' => 'Goal 1 description',
            ]);

        $response->assertStatus(503)
            ->assertJsonStructure(['message']);
    }

    /**
     * Test unauthenticated user cannot generate plan.
     */
    public function test_unauthenticated_cannot_generate_plan(): void
    {
        $response = $this->postJson('/api/ai/generate-plan', [
            'goals' => 'Goal 1 description',
        ]);

        $response->assertStatus(401);
    }

    // ==========================================
    // Insight Tests
    // ==========================================

    /**
     * Test authenticated user can generate insights.
     */
    public function test_user_can_generate_insights(): void
    {
        $user = User::factory()->create();

        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response([
                'candidates' => [
                    [
                        'content' => [
                            'parts' => [
                                ['text' => 'This is a mock insight response.'],
                            ],
                        ],
                    ],
                ],
            ], 200),
        ]);

        $response = $this->actingAs($user)
            ->postJson('/api/ai/insight', [
                'kpiData' => [
                    'totalTasks' => 10,
                    'completedTasks' => 7,
                    'completionRate' => 0.7,
                ],
            ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'insights',
                ],
            ])
            ->assertJson([
                'data' => [
                    'insights' => 'This is a mock insight response.',
                ],
            ]);
    }

    /**
     * Test insight with categories data.
     */
    public function test_insight_with_categories(): void
    {
        $user = User::factory()->create();

        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response([
                'candidates' => [
                    [
                        'content' => [
                            'parts' => [
                                ['text' => 'Insight with categories.'],
                            ],
                        ],
                    ],
                ],
            ], 200),
        ]);

        $response = $this->actingAs($user)
            ->postJson('/api/ai/insight', [
                'kpiData' => [
                    'totalTasks' => ['value' => 10, 'change' => '+2'],
                    'completedTasks' => ['value' => 7, 'change' => '+1'],
                    'completionRate' => ['value' => '70%', 'change' => '+5%'],
                ],
            ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'insights',
                ],
            ]);
    }

    /**
     * Test insight requires kpiData array.
     */
    public function test_insight_requires_kpi_data(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/ai/insight', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['kpiData']);
    }

    /**
     * Test insight kpiData must be array.
     */
    public function test_insight_kpi_data_must_be_array(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/ai/insight', [
                'kpiData' => 'not an array',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['kpiData']);
    }

    /**
     * Test insight handles API error gracefully.
     */
    public function test_insight_handles_api_error(): void
    {
        $user = User::factory()->create();

        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response([
                'error' => [
                    'message' => 'API error',
                ],
            ], 500),
        ]);

        $response = $this->actingAs($user)
            ->postJson('/api/ai/insight', [
                'kpiData' => [
                    'totalTasks' => 10,
                ],
            ]);

        $response->assertStatus(503)
            ->assertJsonStructure(['message']);
    }

    /**
     * Test insight handles connection error gracefully.
     */
    public function test_insight_handles_connection_error(): void
    {
        $user = User::factory()->create();

        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::failedConnection('Connection refused'),
        ]);

        $response = $this->actingAs($user)
            ->postJson('/api/ai/insight', [
                'kpiData' => [
                    'totalTasks' => 10,
                ],
            ]);

        $response->assertStatus(503)
            ->assertJsonStructure(['message']);
    }

    /**
     * Test insight handles missing API key gracefully.
     */
    public function test_insight_handles_missing_api_key(): void
    {
        $user = User::factory()->create();

        config(['services.gemini.api_key' => '']);

        $response = $this->actingAs($user)
            ->postJson('/api/ai/insight', [
                'kpiData' => [
                    'totalTasks' => 10,
                ],
            ]);

        $response->assertStatus(503)
            ->assertJson([
                'message' => 'Layanan AI belum dikonfigurasi. Silakan tambahkan API key.',
            ]);
    }

    /**
     * Test generate plan handles missing API key gracefully.
     */
    public function test_generate_plan_handles_missing_api_key(): void
    {
        $user = User::factory()->create();

        config(['services.gemini.api_key' => '']);

        $response = $this->actingAs($user)
            ->postJson('/api/ai/generate-plan', [
                'goals' => 'Goal 1 description',
            ]);

        $response->assertStatus(503)
            ->assertJson([
                'message' => 'Layanan AI belum dikonfigurasi. Silakan tambahkan API key.',
            ]);
    }

    /**
     * Test unauthenticated user cannot generate insights.
     */
    public function test_unauthenticated_cannot_generate_insights(): void
    {
        $response = $this->postJson('/api/ai/insight', [
            'kpiData' => [
                'totalTasks' => 10,
            ],
        ]);

        $response->assertStatus(401);
    }

    /**
     * Test insight handles empty response from API.
     */
    public function test_insight_handles_empty_api_response(): void
    {
        $user = User::factory()->create();

        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response([
                'candidates' => [],
            ], 200),
        ]);

        $response = $this->actingAs($user)
            ->postJson('/api/ai/insight', [
                'kpiData' => [
                    'totalTasks' => 10,
                ],
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'insights' => '',
                ],
            ]);
    }

    /**
     * Test generate plan handles empty response from API.
     */
    public function test_generate_plan_handles_empty_api_response(): void
    {
        $user = User::factory()->create();

        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response([
                'candidates' => [],
            ], 200),
        ]);

        $response = $this->actingAs($user)
            ->postJson('/api/ai/generate-plan', [
                'goals' => 'Goal 1 description',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'plan' => '',
                ],
            ]);
    }
}
