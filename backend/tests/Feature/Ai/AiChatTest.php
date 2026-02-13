<?php

namespace Tests\Feature\Ai;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class AiChatTest extends TestCase
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

    /**
     * Test authenticated user can chat with AI.
     */
    public function test_user_can_chat_with_ai(): void
    {
        $user = User::factory()->create();

        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response([
                'candidates' => [
                    [
                        'content' => [
                            'parts' => [
                                ['text' => 'This is a mock AI response about muamalah.'],
                            ],
                        ],
                    ],
                ],
            ], 200),
        ]);

        $response = $this->actingAs($user)
            ->postJson('/api/ai/chat', [
                'message' => 'What is murabahah?',
            ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'reply',
                ],
            ])
            ->assertJson([
                'data' => [
                    'reply' => 'This is a mock AI response about muamalah.',
                ],
            ]);
    }

    /**
     * Test AI chat returns error when message is empty.
     */
    public function test_chat_requires_message(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/ai/chat', [
                'message' => '',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['message']);
    }

    /**
     * Test AI chat returns error when message is missing.
     */
    public function test_chat_requires_message_field(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/ai/chat', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['message']);
    }

    /**
     * Test AI chat returns error when message exceeds max length.
     */
    public function test_chat_message_max_length(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/ai/chat', [
                'message' => str_repeat('a', 4001),
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['message']);
    }

    /**
     * Test AI chat handles API error gracefully.
     */
    public function test_chat_handles_api_error(): void
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
            ->postJson('/api/ai/chat', [
                'message' => 'Test message',
            ]);

        $response->assertStatus(503)
            ->assertJsonStructure(['message']);
    }

    /**
     * Test AI chat handles connection error gracefully.
     */
    public function test_chat_handles_connection_error(): void
    {
        $user = User::factory()->create();

        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::failedConnection('Connection refused'),
        ]);

        $response = $this->actingAs($user)
            ->postJson('/api/ai/chat', [
                'message' => 'Test message',
            ]);

        $response->assertStatus(503)
            ->assertJsonStructure(['message']);
    }

    /**
     * Test AI chat handles missing API key gracefully.
     */
    public function test_chat_handles_missing_api_key(): void
    {
        $user = User::factory()->create();

        // Temporarily set API key to empty
        config(['services.gemini.api_key' => '']);

        $response = $this->actingAs($user)
            ->postJson('/api/ai/chat', [
                'message' => 'Test message',
            ]);

        $response->assertStatus(503)
            ->assertJson([
                'message' => 'AI service is not configured',
            ]);
    }

    /**
     * Test unauthenticated user cannot access AI chat.
     */
    public function test_unauthenticated_cannot_chat(): void
    {
        $response = $this->postJson('/api/ai/chat', [
            'message' => 'Test message',
        ]);

        $response->assertStatus(401);
    }

    /**
     * Test AI chat with long message is accepted.
     */
    public function test_chat_accepts_max_length_message(): void
    {
        $user = User::factory()->create();

        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response([
                'candidates' => [
                    [
                        'content' => [
                            'parts' => [
                                ['text' => 'Response'],
                            ],
                        ],
                    ],
                ],
            ], 200),
        ]);

        $response = $this->actingAs($user)
            ->postJson('/api/ai/chat', [
                'message' => str_repeat('a', 4000),
            ]);

        $response->assertStatus(200);
    }

    /**
     * Test AI chat handles empty response from API.
     */
    public function test_chat_handles_empty_api_response(): void
    {
        $user = User::factory()->create();

        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response([
                'candidates' => [],
            ], 200),
        ]);

        $response = $this->actingAs($user)
            ->postJson('/api/ai/chat', [
                'message' => 'Test message',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'reply' => '',
                ],
            ]);
    }
}
