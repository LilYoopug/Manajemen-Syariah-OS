<?php

namespace Tests\Feature\Security;

use App\Models\Category;
use App\Models\DirectoryItem;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MultiUserIsolationTest extends TestCase
{
    use RefreshDatabase;

    private User $user1;
    private User $user2;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user1 = User::factory()->create();
        $this->user2 = User::factory()->create();
    }

    // ==========================================
    // TASK ISOLATION TESTS
    // ==========================================

    public function test_user_cannot_see_other_users_tasks(): void
    {
        // User 1 creates a task
        $task1 = Task::create([
            'user_id' => $this->user1->id,
            'text' => 'User 1 Task',
            'category' => 'SDM',
            'completed' => false,
        ]);

        // User 2 creates a task
        $task2 = Task::create([
            'user_id' => $this->user2->id,
            'text' => 'User 2 Task',
            'category' => 'SDM',
            'completed' => false,
        ]);

        // User 1 fetches tasks - should only see their own
        $response = $this->actingAs($this->user1)
            ->getJson('/api/tasks');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.text', 'User 1 Task');
    }

    public function test_user_cannot_access_other_users_task(): void
    {
        $task = Task::create([
            'user_id' => $this->user2->id,
            'text' => 'User 2 Secret Task',
            'category' => 'SDM',
            'completed' => false,
        ]);

        // User 1 tries to access User 2's task
        $response = $this->actingAs($this->user1)
            ->getJson("/api/tasks/{$task->id}");

        $response->assertStatus(404);
    }

    public function test_user_cannot_update_other_users_task(): void
    {
        $task = Task::create([
            'user_id' => $this->user2->id,
            'text' => 'User 2 Task',
            'category' => 'SDM',
            'completed' => false,
        ]);

        $response = $this->actingAs($this->user1)
            ->putJson("/api/tasks/{$task->id}", [
                'text' => 'Hacked Task',
            ]);

        $response->assertStatus(404);

        // Verify task was not modified
        $task->refresh();
        $this->assertEquals('User 2 Task', $task->text);
    }

    public function test_user_cannot_delete_other_users_task(): void
    {
        $task = Task::create([
            'user_id' => $this->user2->id,
            'text' => 'User 2 Task',
            'category' => 'SDM',
            'completed' => false,
        ]);

        $response = $this->actingAs($this->user1)
            ->deleteJson("/api/tasks/{$task->id}");

        $response->assertStatus(404);

        // Verify task still exists
        $this->assertDatabaseHas('tasks', ['id' => $task->id]);
    }

    // ==========================================
    // CATEGORY ISOLATION TESTS
    // ==========================================

    public function test_user_cannot_see_other_users_categories(): void
    {
        // User 1 creates a custom category (has 6 default + 1 custom = 7)
        Category::create([
            'user_id' => $this->user1->id,
            'name' => 'User 1 Custom Category',
        ]);

        // User 2 creates a custom category (has 6 default + 1 custom = 7)
        Category::create([
            'user_id' => $this->user2->id,
            'name' => 'User 2 Custom Category',
        ]);

        // User 1 fetches categories - should only see their own (6 default + 1 custom = 7)
        $response = $this->actingAs($this->user1)
            ->getJson('/api/categories');

        $response->assertStatus(200)
            ->assertJsonCount(7, 'data');

        $names = collect($response->json('data'))->pluck('name');
        $this->assertContains('User 1 Custom Category', $names);
        $this->assertNotContains('User 2 Custom Category', $names);
    }

    // ==========================================
    // DIRECTORY (WAWASAN) ISOLATION TESTS
    // ==========================================

    public function test_user_cannot_see_other_users_directory_items(): void
    {
        // User 1 creates a directory item
        DirectoryItem::create([
            'user_id' => $this->user1->id,
            'title' => 'User 1 Wawasan',
            'type' => 'item',
            'content' => json_encode(['explanation' => 'Secret data']),
        ]);

        // User 2 creates a directory item
        DirectoryItem::create([
            'user_id' => $this->user2->id,
            'title' => 'User 2 Wawasan',
            'type' => 'item',
            'content' => json_encode(['explanation' => 'Private data']),
        ]);

        // User 1 fetches directory - should only see their own
        $response = $this->actingAs($this->user1)
            ->getJson('/api/directory');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');

        $titles = collect($response->json('data'))->pluck('title');
        $this->assertContains('User 1 Wawasan', $titles);
        $this->assertNotContains('User 2 Wawasan', $titles);
    }

    public function test_user_cannot_update_other_users_directory_item(): void
    {
        $item = DirectoryItem::create([
            'user_id' => $this->user2->id,
            'title' => 'User 2 Wawasan',
            'type' => 'item',
            'content' => json_encode(['explanation' => 'Original']),
        ]);

        $response = $this->actingAs($this->user1)
            ->putJson("/api/directory/{$item->id}", [
                'title' => 'Hacked Title',
            ]);

        $response->assertStatus(404);

        // Verify item was not modified
        $item->refresh();
        $this->assertEquals('User 2 Wawasan', $item->title);
    }

    public function test_user_cannot_delete_other_users_directory_item(): void
    {
        $item = DirectoryItem::create([
            'user_id' => $this->user2->id,
            'title' => 'User 2 Wawasan',
            'type' => 'item',
        ]);

        $response = $this->actingAs($this->user1)
            ->deleteJson("/api/directory/{$item->id}");

        $response->assertStatus(404);

        // Verify item still exists
        $this->assertDatabaseHas('directory_items', ['id' => $item->id]);
    }

    public function test_user_cannot_move_item_to_other_users_folder(): void
    {
        // User 1 creates a folder
        $folder1 = DirectoryItem::create([
            'user_id' => $this->user1->id,
            'title' => 'User 1 Folder',
            'type' => 'folder',
        ]);

        // User 2 creates an item
        $item2 = DirectoryItem::create([
            'user_id' => $this->user2->id,
            'title' => 'User 2 Item',
            'type' => 'item',
        ]);

        // User 2 tries to move their item to User 1's folder
        $response = $this->actingAs($this->user2)
            ->putJson("/api/directory/{$item2->id}", [
                'parentId' => $folder1->id,
            ]);

        // Should fail because parent doesn't belong to user 2
        $response->assertStatus(404);
    }

    // ==========================================
    // DASHBOARD ISOLATION TESTS
    // ==========================================

    public function test_dashboard_only_shows_own_tasks(): void
    {
        // User 1 has completed tasks
        Task::create([
            'user_id' => $this->user1->id,
            'text' => 'User 1 Task',
            'category' => 'SDM',
            'completed' => true,
        ]);

        // User 2 has incomplete tasks
        Task::create([
            'user_id' => $this->user2->id,
            'text' => 'User 2 Task',
            'category' => 'SDM',
            'completed' => false,
        ]);

        // User 1 fetches dashboard
        $response = $this->actingAs($this->user1)
            ->getJson('/api/dashboard');

        $response->assertStatus(200)
            ->assertJsonPath('data.kpi.totalTasks', 1)
            ->assertJsonPath('data.kpi.completedTasks', 1);
    }

    // ==========================================
    // PROFILE ISOLATION TESTS
    // ==========================================

    public function test_user_can_only_export_own_data(): void
    {
        // User 1 creates data
        Task::create([
            'user_id' => $this->user1->id,
            'text' => 'User 1 Task',
            'category' => 'SDM',
            'completed' => false,
        ]);

        // User 2 creates data
        Task::create([
            'user_id' => $this->user2->id,
            'text' => 'User 2 Secret Task',
            'category' => 'SDM',
            'completed' => false,
        ]);

        // User 1 exports data
        $response = $this->actingAs($this->user1)
            ->postJson('/api/profile/export');

        $response->assertStatus(200);

        $data = $response->json();

        // Should only contain User 1's data
        $this->assertCount(1, $data['tasks']);
        $this->assertEquals('User 1 Task', $data['tasks'][0]['text']);
    }

    public function test_user_can_only_reset_own_data(): void
    {
        // User 1 creates data
        $task1 = Task::create([
            'user_id' => $this->user1->id,
            'text' => 'User 1 Task',
            'category' => 'SDM',
            'completed' => false,
        ]);

        // User 2 creates data
        $task2 = Task::create([
            'user_id' => $this->user2->id,
            'text' => 'User 2 Task',
            'category' => 'SDM',
            'completed' => false,
        ]);

        // User 1 resets their data
        $response = $this->actingAs($this->user1)
            ->postJson('/api/profile/reset');

        $response->assertStatus(200);

        // User 1's task should be deleted
        $this->assertDatabaseMissing('tasks', ['id' => $task1->id]);

        // User 2's task should remain
        $this->assertDatabaseHas('tasks', ['id' => $task2->id]);
    }
}
