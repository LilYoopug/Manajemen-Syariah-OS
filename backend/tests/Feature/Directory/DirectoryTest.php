<?php

namespace Tests\Feature\Directory;

use App\Models\DirectoryItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DirectoryTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test authenticated user can get directory tree.
     */
    public function test_user_can_get_directory_tree(): void
    {
        $user = User::factory()->create();

        // Create sample directory structure
        $folder = DirectoryItem::create([
            'title' => 'Test Folder',
            'type' => 'folder',
            'parent_id' => null,
            'content' => null,
        ]);

        $item = DirectoryItem::create([
            'title' => 'Test Item',
            'type' => 'item',
            'parent_id' => $folder->id,
            'content' => json_encode([
                'dalil' => 'Test dalil',
                'source' => 'Test source',
                'explanation' => 'Test explanation',
            ]),
        ]);

        $response = $this->actingAs($user)
            ->getJson('/api/directory');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'title',
                        'children' => [
                            '*' => [
                                'id',
                                'title',
                                'dalil',
                                'source',
                                'explanation',
                            ],
                        ],
                    ],
                ],
            ])
            ->assertJson([
                'data' => [
                    [
                        'id' => $folder->id,
                        'title' => 'Test Folder',
                        'children' => [
                            [
                                'id' => $item->id,
                                'title' => 'Test Item',
                                'dalil' => 'Test dalil',
                                'source' => 'Test source',
                                'explanation' => 'Test explanation',
                            ],
                        ],
                    ],
                ],
            ]);
    }

    /**
     * Test directory tree with empty data.
     */
    public function test_directory_tree_with_empty_data(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->getJson('/api/directory');

        $response->assertStatus(200)
            ->assertJson([
                'data' => [],
            ]);
    }

    /**
     * Test unauthenticated user cannot get directory.
     */
    public function test_unauthenticated_user_cannot_get_directory(): void
    {
        $response = $this->getJson('/api/directory');

        $response->assertStatus(401);
    }

    /**
     * Test folder without children has no children key.
     */
    public function test_folder_without_children(): void
    {
        $user = User::factory()->create();

        DirectoryItem::create([
            'title' => 'Empty Folder',
            'type' => 'folder',
            'parent_id' => null,
            'content' => null,
        ]);

        $response = $this->actingAs($user)
            ->getJson('/api/directory');

        $response->assertStatus(200);

        // Folder without children should not have children key
        $folder = $response->json('data.0');
        $this->assertEquals('Empty Folder', $folder['title']);
        $this->assertArrayNotHasKey('children', $folder);
    }

    /**
     * Test item without content fields.
     */
    public function test_item_without_content(): void
    {
        $user = User::factory()->create();

        $folder = DirectoryItem::create([
            'title' => 'Folder',
            'type' => 'folder',
            'parent_id' => null,
            'content' => null,
        ]);

        DirectoryItem::create([
            'title' => 'Item No Content',
            'type' => 'item',
            'parent_id' => $folder->id,
            'content' => null,
        ]);

        $response = $this->actingAs($user)
            ->getJson('/api/directory');

        $response->assertStatus(200);

        $item = $response->json('data.0.children.0');
        $this->assertEquals('Item No Content', $item['title']);
        $this->assertArrayNotHasKey('dalil', $item);
        $this->assertArrayNotHasKey('source', $item);
        $this->assertArrayNotHasKey('explanation', $item);
    }

    /**
     * Test nested folder structure.
     */
    public function test_nested_folder_structure(): void
    {
        $user = User::factory()->create();

        // Create nested structure: parent_folder > child_folder > item
        $parentFolder = DirectoryItem::create([
            'title' => 'Parent Folder',
            'type' => 'folder',
            'parent_id' => null,
            'content' => null,
        ]);

        $childFolder = DirectoryItem::create([
            'title' => 'Child Folder',
            'type' => 'folder',
            'parent_id' => $parentFolder->id,
            'content' => null,
        ]);

        DirectoryItem::create([
            'title' => 'Nested Item',
            'type' => 'item',
            'parent_id' => $childFolder->id,
            'content' => json_encode(['explanation' => 'Nested explanation']),
        ]);

        $response = $this->actingAs($user)
            ->getJson('/api/directory');

        $response->assertStatus(200);

        // Verify nested structure
        $parent = $response->json('data.0');
        $this->assertEquals('Parent Folder', $parent['title']);
        $this->assertArrayHasKey('children', $parent);

        $child = $parent['children'][0];
        $this->assertEquals('Child Folder', $child['title']);
        $this->assertArrayHasKey('children', $child);

        $item = $child['children'][0];
        $this->assertEquals('Nested Item', $item['title']);
        $this->assertEquals('Nested explanation', $item['explanation']);
    }

    /**
     * Test multiple root folders.
     */
    public function test_multiple_root_folders(): void
    {
        $user = User::factory()->create();

        DirectoryItem::create([
            'title' => 'Folder 1',
            'type' => 'folder',
            'parent_id' => null,
            'content' => null,
        ]);

        DirectoryItem::create([
            'title' => 'Folder 2',
            'type' => 'folder',
            'parent_id' => null,
            'content' => null,
        ]);

        DirectoryItem::create([
            'title' => 'Folder 3',
            'type' => 'folder',
            'parent_id' => null,
            'content' => null,
        ]);

        $response = $this->actingAs($user)
            ->getJson('/api/directory');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    /**
     * Test directory seeder creates expected structure.
     */
    public function test_directory_seeder(): void
    {
        // Run the seeder
        $this->seed(\Database\Seeders\DirectorySeeder::class);

        // Verify 4 root folders
        $this->assertEquals(4, DirectoryItem::whereNull('parent_id')->count());

        // Verify total items (4 folders + 14 items)
        $this->assertEquals(18, DirectoryItem::count());

        // Verify specific folders exist
        $this->assertDatabaseHas('directory_items', [
            'title' => "Al-Qur'an",
            'type' => 'folder',
            'parent_id' => null,
        ]);

        $this->assertDatabaseHas('directory_items', [
            'title' => 'As-Sunnah',
            'type' => 'folder',
            'parent_id' => null,
        ]);

        $this->assertDatabaseHas('directory_items', [
            'title' => 'Maqasid Syariah',
            'type' => 'folder',
            'parent_id' => null,
        ]);

        $this->assertDatabaseHas('directory_items', [
            'title' => 'Prinsip POAC Islami',
            'type' => 'folder',
            'parent_id' => null,
        ]);

        // Verify children count per folder
        $quranFolder = DirectoryItem::where('title', "Al-Qur'an")->first();
        $this->assertEquals(3, DirectoryItem::where('parent_id', $quranFolder->id)->count());

        $sunnahFolder = DirectoryItem::where('title', 'As-Sunnah')->first();
        $this->assertEquals(2, DirectoryItem::where('parent_id', $sunnahFolder->id)->count());

        $maqasidFolder = DirectoryItem::where('title', 'Maqasid Syariah')->first();
        $this->assertEquals(5, DirectoryItem::where('parent_id', $maqasidFolder->id)->count());

        $poacFolder = DirectoryItem::where('title', 'Prinsip POAC Islami')->first();
        $this->assertEquals(4, DirectoryItem::where('parent_id', $poacFolder->id)->count());
    }

    /**
     * Test seeder data with dalil and source.
     */
    public function test_seeder_item_has_dalil_and_source(): void
    {
        $this->seed(\Database\Seeders\DirectorySeeder::class);

        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->getJson('/api/directory');

        $response->assertStatus(200);

        // Find Amanah item in Al-Qur'an folder
        $data = collect($response->json('data'));
        $quranFolder = $data->firstWhere('title', "Al-Qur'an");

        $amanahItem = collect($quranFolder['children'])->firstWhere('title', 'Amanah (QS. An-Nisa: 58)');

        $this->assertNotNull($amanahItem);
        $this->assertArrayHasKey('dalil', $amanahItem);
        $this->assertArrayHasKey('source', $amanahItem);
        $this->assertArrayHasKey('explanation', $amanahItem);
        $this->assertEquals('QS. An-Nisa: 58', $amanahItem['source']);
    }
}
