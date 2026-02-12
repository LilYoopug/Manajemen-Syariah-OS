<?php

namespace Tests\Feature\Directory;

use App\Models\DirectoryItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DirectoryCrudTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test authenticated user can create a folder.
     */
    public function test_user_can_create_folder(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/directory', [
                'title' => 'New Folder',
                'type' => 'folder',
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'title',
                ],
            ])
            ->assertJson([
                'data' => [
                    'title' => 'New Folder',
                ],
            ]);

        $this->assertDatabaseHas('directory_items', [
            'title' => 'New Folder',
            'type' => 'folder',
            'parent_id' => null,
            'content' => null,
        ]);
    }

    /**
     * Test authenticated user can create an item with content.
     */
    public function test_user_can_create_item_with_content(): void
    {
        $user = User::factory()->create();

        $folder = DirectoryItem::create([
            'title' => 'Parent Folder',
            'type' => 'folder',
            'parent_id' => null,
            'content' => null,
        ]);

        $response = $this->actingAs($user)
            ->postJson('/api/directory', [
                'title' => 'New Item',
                'type' => 'item',
                'parentId' => $folder->id,
                'content' => [
                    'dalil' => 'Test dalil content',
                    'source' => 'Test source',
                    'explanation' => 'Test explanation',
                ],
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'title',
                    'dalil',
                    'source',
                    'explanation',
                ],
            ])
            ->assertJson([
                'data' => [
                    'title' => 'New Item',
                    'dalil' => 'Test dalil content',
                    'source' => 'Test source',
                    'explanation' => 'Test explanation',
                ],
            ]);

        $this->assertDatabaseHas('directory_items', [
            'title' => 'New Item',
            'type' => 'item',
            'parent_id' => $folder->id,
        ]);

        $item = DirectoryItem::where('title', 'New Item')->first();
        $content = json_decode($item->content, true);
        $this->assertEquals('Test dalil content', $content['dalil']);
        $this->assertEquals('Test source', $content['source']);
        $this->assertEquals('Test explanation', $content['explanation']);
    }

    /**
     * Test authenticated user can create item without parent.
     */
    public function test_user_can_create_item_without_parent(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/directory', [
                'title' => 'Root Item',
                'type' => 'item',
                'content' => [
                    'explanation' => 'Root level item',
                ],
            ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('directory_items', [
            'title' => 'Root Item',
            'type' => 'item',
            'parent_id' => null,
        ]);
    }

    /**
     * Test authenticated user can update item title.
     */
    public function test_user_can_update_item_title(): void
    {
        $user = User::factory()->create();

        $item = DirectoryItem::create([
            'title' => 'Original Title',
            'type' => 'item',
            'parent_id' => null,
            'content' => json_encode(['explanation' => 'Original']),
        ]);

        $response = $this->actingAs($user)
            ->putJson("/api/directory/{$item->id}", [
                'title' => 'Updated Title',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'id' => $item->id,
                    'title' => 'Updated Title',
                ],
            ]);

        $this->assertDatabaseHas('directory_items', [
            'id' => $item->id,
            'title' => 'Updated Title',
        ]);
    }

    /**
     * Test authenticated user can update item content.
     */
    public function test_user_can_update_item_content(): void
    {
        $user = User::factory()->create();

        $item = DirectoryItem::create([
            'title' => 'Test Item',
            'type' => 'item',
            'parent_id' => null,
            'content' => json_encode(['dalil' => 'Old dalil']),
        ]);

        $response = $this->actingAs($user)
            ->putJson("/api/directory/{$item->id}", [
                'content' => [
                    'dalil' => 'New dalil',
                    'source' => 'New source',
                    'explanation' => 'New explanation',
                ],
            ]);

        $response->assertStatus(200);

        $item->refresh();
        $content = json_decode($item->content, true);
        $this->assertEquals('New dalil', $content['dalil']);
        $this->assertEquals('New source', $content['source']);
        $this->assertEquals('New explanation', $content['explanation']);
    }

    /**
     * Test authenticated user can update item parent.
     */
    public function test_user_can_update_item_parent(): void
    {
        $user = User::factory()->create();

        $folder1 = DirectoryItem::create([
            'title' => 'Folder 1',
            'type' => 'folder',
            'parent_id' => null,
            'content' => null,
        ]);

        $folder2 = DirectoryItem::create([
            'title' => 'Folder 2',
            'type' => 'folder',
            'parent_id' => null,
            'content' => null,
        ]);

        $item = DirectoryItem::create([
            'title' => 'Test Item',
            'type' => 'item',
            'parent_id' => $folder1->id,
            'content' => null,
        ]);

        $response = $this->actingAs($user)
            ->putJson("/api/directory/{$item->id}", [
                'parentId' => $folder2->id,
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('directory_items', [
            'id' => $item->id,
            'parent_id' => $folder2->id,
        ]);
    }

    /**
     * Test authenticated user can set parent to null.
     */
    public function test_user_can_set_parent_to_null(): void
    {
        $user = User::factory()->create();

        $folder = DirectoryItem::create([
            'title' => 'Parent Folder',
            'type' => 'folder',
            'parent_id' => null,
            'content' => null,
        ]);

        $item = DirectoryItem::create([
            'title' => 'Child Item',
            'type' => 'item',
            'parent_id' => $folder->id,
            'content' => null,
        ]);

        $response = $this->actingAs($user)
            ->putJson("/api/directory/{$item->id}", [
                'parentId' => null,
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('directory_items', [
            'id' => $item->id,
            'parent_id' => null,
        ]);
    }

    /**
     * Test authenticated user can delete item.
     */
    public function test_user_can_delete_item(): void
    {
        $user = User::factory()->create();

        $item = DirectoryItem::create([
            'title' => 'Item to Delete',
            'type' => 'item',
            'parent_id' => null,
            'content' => null,
        ]);

        $response = $this->actingAs($user)
            ->deleteJson("/api/directory/{$item->id}");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Directory item deleted successfully',
            ]);

        $this->assertDatabaseMissing('directory_items', [
            'id' => $item->id,
        ]);
    }

    /**
     * Test delete folder cascades to children.
     */
    public function test_delete_folder_cascades_to_children(): void
    {
        $user = User::factory()->create();

        $folder = DirectoryItem::create([
            'title' => 'Parent Folder',
            'type' => 'folder',
            'parent_id' => null,
            'content' => null,
        ]);

        $child1 = DirectoryItem::create([
            'title' => 'Child 1',
            'type' => 'item',
            'parent_id' => $folder->id,
            'content' => null,
        ]);

        $child2 = DirectoryItem::create([
            'title' => 'Child 2',
            'type' => 'item',
            'parent_id' => $folder->id,
            'content' => null,
        ]);

        $nestedFolder = DirectoryItem::create([
            'title' => 'Nested Folder',
            'type' => 'folder',
            'parent_id' => $folder->id,
            'content' => null,
        ]);

        $nestedItem = DirectoryItem::create([
            'title' => 'Nested Item',
            'type' => 'item',
            'parent_id' => $nestedFolder->id,
            'content' => null,
        ]);

        $response = $this->actingAs($user)
            ->deleteJson("/api/directory/{$folder->id}");

        $response->assertStatus(200);

        // Verify all items are deleted
        $this->assertDatabaseMissing('directory_items', ['id' => $folder->id]);
        $this->assertDatabaseMissing('directory_items', ['id' => $child1->id]);
        $this->assertDatabaseMissing('directory_items', ['id' => $child2->id]);
        $this->assertDatabaseMissing('directory_items', ['id' => $nestedFolder->id]);
        $this->assertDatabaseMissing('directory_items', ['id' => $nestedItem->id]);

        $this->assertEquals(0, DirectoryItem::count());
    }

    /**
     * Test validation error when creating item without title.
     */
    public function test_create_requires_title(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/directory', [
                'type' => 'folder',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['title']);
    }

    /**
     * Test validation error when creating item without type.
     */
    public function test_create_requires_type(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/directory', [
                'title' => 'Test',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['type']);
    }

    /**
     * Test validation error for invalid type.
     */
    public function test_create_invalid_type(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/directory', [
                'title' => 'Test',
                'type' => 'invalid',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['type']);
    }

    /**
     * Test validation error for non-existent parent.
     */
    public function test_create_nonexistent_parent(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/directory', [
                'title' => 'Test',
                'type' => 'item',
                'parentId' => 9999,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['parentId']);
    }

    /**
     * Test validation error for title exceeding max length.
     */
    public function test_create_title_too_long(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/directory', [
                'title' => str_repeat('a', 256),
                'type' => 'folder',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['title']);
    }

    /**
     * Test update validation error for non-existent parent.
     */
    public function test_update_nonexistent_parent(): void
    {
        $user = User::factory()->create();

        $item = DirectoryItem::create([
            'title' => 'Test',
            'type' => 'item',
            'parent_id' => null,
            'content' => null,
        ]);

        $response = $this->actingAs($user)
            ->putJson("/api/directory/{$item->id}", [
                'parentId' => 9999,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['parentId']);
    }

    /**
     * Test update returns 404 for non-existent item.
     */
    public function test_update_nonexistent_item(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->putJson('/api/directory/9999', [
                'title' => 'Updated',
            ]);

        $response->assertStatus(404);
    }

    /**
     * Test delete returns 404 for non-existent item.
     */
    public function test_delete_nonexistent_item(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->deleteJson('/api/directory/9999');

        $response->assertStatus(404);
    }

    /**
     * Test unauthenticated user cannot create item.
     */
    public function test_unauthenticated_cannot_create(): void
    {
        $response = $this->postJson('/api/directory', [
            'title' => 'Test',
            'type' => 'folder',
        ]);

        $response->assertStatus(401);
    }

    /**
     * Test unauthenticated user cannot update item.
     */
    public function test_unauthenticated_cannot_update(): void
    {
        $item = DirectoryItem::create([
            'title' => 'Test',
            'type' => 'item',
            'parent_id' => null,
            'content' => null,
        ]);

        $response = $this->putJson("/api/directory/{$item->id}", [
            'title' => 'Updated',
        ]);

        $response->assertStatus(401);
    }

    /**
     * Test unauthenticated user cannot delete item.
     */
    public function test_unauthenticated_cannot_delete(): void
    {
        $item = DirectoryItem::create([
            'title' => 'Test',
            'type' => 'item',
            'parent_id' => null,
            'content' => null,
        ]);

        $response = $this->deleteJson("/api/directory/{$item->id}");

        $response->assertStatus(401);
    }

    /**
     * Test content can be set to null on update.
     */
    public function test_update_can_set_content_to_null(): void
    {
        $user = User::factory()->create();

        $item = DirectoryItem::create([
            'title' => 'Test Item',
            'type' => 'item',
            'parent_id' => null,
            'content' => json_encode(['dalil' => 'Original content']),
        ]);

        $response = $this->actingAs($user)
            ->putJson("/api/directory/{$item->id}", [
                'content' => null,
            ]);

        $response->assertStatus(200);

        $item->refresh();
        $this->assertNull($item->content);
    }
}
