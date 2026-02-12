<?php

namespace Tests\Feature\Category;

use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CategoryIndexTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test authenticated user gets their categories.
     */
    public function test_authenticated_user_gets_their_categories(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        // User should have default categories from observer
        $response = $this->getJson('/api/categories');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'createdAt',
                        'updatedAt',
                    ],
                ],
            ]);

        // Verify default categories are present
        $categories = $response->json('data');
        $categoryNames = collect($categories)->pluck('name')->toArray();

        $this->assertContains('SDM', $categoryNames);
        $this->assertContains('Keuangan', $categoryNames);
        $this->assertContains('Kepatuhan', $categoryNames);
        $this->assertContains('Pemasaran', $categoryNames);
        $this->assertContains('Operasional', $categoryNames);
        $this->assertContains('Teknologi', $categoryNames);
    }

    /**
     * Test user only sees their own categories.
     */
    public function test_user_only_sees_their_own_categories(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        Sanctum::actingAs($user1);

        $response = $this->getJson('/api/categories');

        $response->assertStatus(200);

        // All categories should belong to user1
        $categories = $response->json('data');
        foreach ($categories as $category) {
            $this->assertDatabaseHas('categories', [
                'id' => $category['id'],
                'user_id' => $user1->id,
            ]);
        }

        // Verify user2's categories are not visible
        $user2CategoryIds = Category::where('user_id', $user2->id)->pluck('id')->toArray();
        $responseCategoryIds = collect($categories)->pluck('id')->toArray();

        foreach ($user2CategoryIds as $user2CategoryId) {
            $this->assertNotContains($user2CategoryId, $responseCategoryIds);
        }
    }

    /**
     * Test unauthenticated request returns 401.
     */
    public function test_unauthenticated_request_returns_401(): void
    {
        $response = $this->getJson('/api/categories');

        $response->assertStatus(401)
            ->assertJson([
                'message' => 'Unauthenticated.',
            ]);
    }

    /**
     * Test new user gets default categories seeded.
     */
    public function test_new_user_gets_default_categories_seeded(): void
    {
        $user = User::factory()->create();

        // Verify categories were created
        $this->assertEquals(6, $user->categories()->count());

        // Verify specific categories exist
        $categoryNames = $user->categories()->pluck('name')->toArray();
        $this->assertContains('SDM', $categoryNames);
        $this->assertContains('Keuangan', $categoryNames);
        $this->assertContains('Kepatuhan', $categoryNames);
        $this->assertContains('Pemasaran', $categoryNames);
        $this->assertContains('Operasional', $categoryNames);
        $this->assertContains('Teknologi', $categoryNames);
    }

    /**
     * Test categories count matches expected default.
     */
    public function test_categories_count_matches_expected(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/categories');

        $response->assertStatus(200);
        $this->assertCount(6, $response->json('data'));
    }

    /**
     * Test category resource format.
     */
    public function test_category_resource_format(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/categories');

        $response->assertStatus(200);

        $firstCategory = $response->json('data.0');

        // Verify camelCase keys
        $this->assertArrayHasKey('id', $firstCategory);
        $this->assertArrayHasKey('name', $firstCategory);
        $this->assertArrayHasKey('createdAt', $firstCategory);
        $this->assertArrayHasKey('updatedAt', $firstCategory);

        // Verify snake_case keys are NOT present
        $this->assertArrayNotHasKey('created_at', $firstCategory);
        $this->assertArrayNotHasKey('updated_at', $firstCategory);
        $this->assertArrayNotHasKey('user_id', $firstCategory);
    }
}
