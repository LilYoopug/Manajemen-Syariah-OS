<?php

namespace Tests\Feature;

use App\Models\Tool;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ToolTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test authenticated user can list all tools.
     */
    public function test_user_can_list_all_tools(): void
    {
        $user = User::factory()->create();

        // Create sample tools
        Tool::create([
            'name' => 'Test Tool 1',
            'category' => 'Individu/Keluarga',
            'description' => 'Test description 1',
            'inputs' => json_encode(['Input 1']),
            'outputs' => json_encode(['Output 1']),
            'benefits' => json_encode(['Benefit 1']),
        ]);

        Tool::create([
            'name' => 'Test Tool 2',
            'category' => 'Bisnis Islami',
            'description' => 'Test description 2',
            'inputs' => json_encode(['Input 2']),
            'outputs' => json_encode(['Output 2']),
            'benefits' => json_encode(['Benefit 2']),
        ]);

        $response = $this->actingAs($user)
            ->getJson('/api/tools');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'category',
                        'description',
                        'inputs',
                        'outputs',
                        'benefits',
                    ],
                ],
            ])
            ->assertJsonCount(2, 'data');
    }

    /**
     * Test authenticated user can filter tools by category.
     */
    public function test_user_can_filter_tools_by_category(): void
    {
        $user = User::factory()->create();

        Tool::create([
            'name' => 'Test Tool 1',
            'category' => 'Individu/Keluarga',
            'description' => 'Test description 1',
            'inputs' => json_encode(['Input 1']),
            'outputs' => json_encode(['Output 1']),
            'benefits' => json_encode(['Benefit 1']),
        ]);

        Tool::create([
            'name' => 'Test Tool 2',
            'category' => 'Bisnis Islami',
            'description' => 'Test description 2',
            'inputs' => json_encode(['Input 2']),
            'outputs' => json_encode(['Output 2']),
            'benefits' => json_encode(['Benefit 2']),
        ]);

        Tool::create([
            'name' => 'Test Tool 3',
            'category' => 'Individu/Keluarga',
            'description' => 'Test description 3',
            'inputs' => json_encode(['Input 3']),
            'outputs' => json_encode(['Output 3']),
            'benefits' => json_encode(['Benefit 3']),
        ]);

        $response = $this->actingAs($user)
            ->getJson('/api/tools?category=Individu/Keluarga');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');

        foreach ($response->json('data') as $tool) {
            $this->assertEquals('Individu/Keluarga', $tool['category']);
        }
    }

    /**
     * Test filter returns empty when no matching category.
     */
    public function test_filter_returns_empty_for_nonexistent_category(): void
    {
        $user = User::factory()->create();

        Tool::create([
            'name' => 'Test Tool',
            'category' => 'Individu/Keluarga',
            'description' => 'Test description',
            'inputs' => json_encode(['Input']),
            'outputs' => json_encode(['Output']),
            'benefits' => json_encode(['Benefit']),
        ]);

        $response = $this->actingAs($user)
            ->getJson('/api/tools?category=NonExistent');

        $response->assertStatus(200)
            ->assertJsonCount(0, 'data');
    }

    /**
     * Test authenticated user can view tool detail.
     */
    public function test_user_can_view_tool_detail(): void
    {
        $user = User::factory()->create();

        $tool = Tool::create([
            'name' => 'Test Tool',
            'category' => 'Keuangan/Investasi',
            'description' => 'Test description with detail',
            'inputs' => json_encode(['Input A', 'Input B']),
            'outputs' => json_encode(['Output A', 'Output B']),
            'benefits' => json_encode(['Benefit A']),
            'sharia_basis' => 'Test sharia basis',
            'link' => 'https://example.com/test',
            'related_directory_ids' => json_encode(['m5', 'q1']),
            'related_dalil_text' => 'Test dalil text',
            'related_dalil_source' => 'QS. Test: 1',
        ]);

        $response = $this->actingAs($user)
            ->getJson("/api/tools/{$tool->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'category',
                    'description',
                    'inputs',
                    'outputs',
                    'benefits',
                    'shariaBasis',
                    'link',
                    'relatedDirectoryIds',
                    'relatedDalilText',
                    'relatedDalilSource',
                    'createdAt',
                    'updatedAt',
                ],
            ])
            ->assertJson([
                'data' => [
                    'id' => $tool->id,
                    'name' => 'Test Tool',
                    'category' => 'Keuangan/Investasi',
                    'description' => 'Test description with detail',
                    'shariaBasis' => 'Test sharia basis',
                    'link' => 'https://example.com/test',
                    'relatedDalilText' => 'Test dalil text',
                    'relatedDalilSource' => 'QS. Test: 1',
                ],
            ]);
    }

    /**
     * Test tool not found returns 404.
     */
    public function test_tool_not_found_returns_404(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->getJson('/api/tools/9999');

        $response->assertStatus(404);
    }

    /**
     * Test unauthenticated user cannot list tools.
     */
    public function test_unauthenticated_cannot_list_tools(): void
    {
        $response = $this->getJson('/api/tools');

        $response->assertStatus(401);
    }

    /**
     * Test unauthenticated user cannot view tool detail.
     */
    public function test_unauthenticated_cannot_view_tool_detail(): void
    {
        $tool = Tool::create([
            'name' => 'Test Tool',
            'category' => 'Individu/Keluarga',
            'description' => 'Test description',
            'inputs' => json_encode(['Input']),
            'outputs' => json_encode(['Output']),
            'benefits' => json_encode(['Benefit']),
        ]);

        $response = $this->getJson("/api/tools/{$tool->id}");

        $response->assertStatus(401);
    }

    /**
     * Test tool seeder creates 25 tools.
     */
    public function test_tool_seeder_creates_25_tools(): void
    {
        $this->seed(\Database\Seeders\ToolSeeder::class);

        $this->assertEquals(25, Tool::count());
    }

    /**
     * Test tool seeder creates all expected categories.
     */
    public function test_tool_seeder_creates_all_categories(): void
    {
        $this->seed(\Database\Seeders\ToolSeeder::class);

        $categories = Tool::distinct('category')->pluck('category')->toArray();

        $expectedCategories = [
            'Individu/Keluarga',
            'Bisnis Islami',
            'Lembaga/Komunitas',
            'Keuangan/Investasi',
            'Edukasi',
            'Sosial/Umat',
        ];

        foreach ($expectedCategories as $category) {
            $this->assertContains($category, $categories);
        }
    }

    /**
     * Test tool with related dalil.
     */
    public function test_tool_with_related_dalil(): void
    {
        $user = User::factory()->create();

        $tool = Tool::create([
            'name' => 'Tool with Dalil',
            'category' => 'Bisnis Islami',
            'description' => 'Test description',
            'inputs' => json_encode(['Input']),
            'outputs' => json_encode(['Output']),
            'benefits' => json_encode(['Benefit']),
            'related_dalil_text' => 'Test dalil text',
            'related_dalil_source' => 'HR. Test',
        ]);

        $response = $this->actingAs($user)
            ->getJson("/api/tools/{$tool->id}");

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'relatedDalilText' => 'Test dalil text',
                    'relatedDalilSource' => 'HR. Test',
                ],
            ]);
    }

    /**
     * Test tool without optional fields.
     */
    public function test_tool_without_optional_fields(): void
    {
        $user = User::factory()->create();

        $tool = Tool::create([
            'name' => 'Minimal Tool',
            'category' => 'Edukasi',
            'description' => 'Minimal description',
            'inputs' => null,
            'outputs' => null,
            'benefits' => null,
        ]);

        $response = $this->actingAs($user)
            ->getJson("/api/tools/{$tool->id}");

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'name' => 'Minimal Tool',
                    'category' => 'Edukasi',
                    'description' => 'Minimal description',
                ],
            ]);
    }

    /**
     * Test tools ordered by creation.
     */
    public function test_tools_list_order(): void
    {
        $user = User::factory()->create();

        $tool1 = Tool::create([
            'name' => 'First Tool',
            'category' => 'Individu/Keluarga',
            'description' => 'First',
            'inputs' => json_encode(['Input']),
            'outputs' => json_encode(['Output']),
            'benefits' => json_encode(['Benefit']),
        ]);

        $tool2 = Tool::create([
            'name' => 'Second Tool',
            'category' => 'Individu/Keluarga',
            'description' => 'Second',
            'inputs' => json_encode(['Input']),
            'outputs' => json_encode(['Output']),
            'benefits' => json_encode(['Benefit']),
        ]);

        $response = $this->actingAs($user)
            ->getJson('/api/tools');

        $response->assertStatus(200);

        $data = $response->json('data');
        $this->assertEquals($tool1->id, $data[0]['id']);
        $this->assertEquals($tool2->id, $data[1]['id']);
    }
}
