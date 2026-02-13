<?php

namespace Tests\Feature\Admin;

use App\Models\Tool;
use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ToolManagementTest extends TestCase
{
    use RefreshDatabase;

    // ==========================================
    // List Tools Tests
    // ==========================================

    /**
     * Test admin can list all tools.
     */
    public function test_admin_can_list_tools(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Tool::factory()->count(5)->create();

        $response = $this->actingAs($admin)
            ->getJson('/api/admin/tools');

        $response->assertStatus(200)
            ->assertJsonCount(5, 'data');
    }

    // ==========================================
    // Create Tool Tests
    // ==========================================

    /**
     * Test admin can create tool.
     */
    public function test_admin_can_create_tool(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $toolData = [
            'name' => 'Zakat Calculator',
            'category' => 'Financial',
            'description' => 'Calculate your zakat obligations',
            'inputs' => ['income', 'assets'],
            'outputs' => ['zakat_amount'],
            'benefits' => ['accurate calculation', 'time saving'],
            'sharia_basis' => 'Based on Quranic principles',
            'link' => 'https://example.com/zakat',
            'related_directory_ids' => [1, 2],
            'related_dalil_text' => 'Zakat is one of the five pillars',
            'related_dalil_source' => 'Quran 2:177',
        ];

        $response = $this->actingAs($admin)
            ->postJson('/api/admin/tools', $toolData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'category',
                    'description',
                ],
            ])
            ->assertJson([
                'data' => [
                    'name' => 'Zakat Calculator',
                    'category' => 'Financial',
                ],
            ]);

        $this->assertDatabaseHas('tools', [
            'name' => 'Zakat Calculator',
            'category' => 'Financial',
        ]);
    }

    /**
     * Test creating tool logs activity.
     */
    public function test_creating_tool_logs_activity(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->postJson('/api/admin/tools', [
                'name' => 'Test Tool',
                'category' => 'Test',
                'description' => 'Test description',
            ]);

        $this->assertDatabaseHas('activity_logs', [
            'action' => 'admin.tool_created',
        ]);
    }

    /**
     * Test create tool validates required fields.
     */
    public function test_create_tool_validates_required_fields(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)
            ->postJson('/api/admin/tools', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'category', 'description']);
    }

    /**
     * Test create tool validates link as URL.
     */
    public function test_create_tool_validates_link_as_url(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)
            ->postJson('/api/admin/tools', [
                'name' => 'Test Tool',
                'category' => 'Test',
                'description' => 'Test description',
                'link' => 'not-a-url',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['link']);
    }

    // ==========================================
    // Update Tool Tests
    // ==========================================

    /**
     * Test admin can update tool.
     */
    public function test_admin_can_update_tool(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $tool = Tool::factory()->create(['name' => 'Old Name']);

        $response = $this->actingAs($admin)
            ->putJson("/api/admin/tools/{$tool->id}", [
                'name' => 'New Name',
                'category' => $tool->category,
                'description' => $tool->description,
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'name' => 'New Name',
                ],
            ]);

        $this->assertDatabaseHas('tools', [
            'id' => $tool->id,
            'name' => 'New Name',
        ]);
    }

    /**
     * Test updating tool logs activity.
     */
    public function test_updating_tool_logs_activity(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $tool = Tool::factory()->create();

        $this->actingAs($admin)
            ->putJson("/api/admin/tools/{$tool->id}", [
                'name' => 'Updated Name',
                'category' => $tool->category,
                'description' => $tool->description,
            ]);

        $this->assertDatabaseHas('activity_logs', [
            'action' => 'admin.tool_updated',
            'subject_id' => $tool->id,
        ]);
    }

    /**
     * Test update tool with partial data.
     */
    public function test_update_tool_with_partial_data(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $tool = Tool::factory()->create(['description' => 'Old description']);

        $response = $this->actingAs($admin)
            ->putJson("/api/admin/tools/{$tool->id}", [
                'description' => 'New description',
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('tools', [
            'id' => $tool->id,
            'description' => 'New description',
        ]);
    }

    // ==========================================
    // Delete Tool Tests
    // ==========================================

    /**
     * Test admin can delete tool.
     */
    public function test_admin_can_delete_tool(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $tool = Tool::factory()->create();

        $response = $this->actingAs($admin)
            ->deleteJson("/api/admin/tools/{$tool->id}");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Tool deleted successfully.',
            ]);

        $this->assertDatabaseMissing('tools', [
            'id' => $tool->id,
        ]);
    }

    /**
     * Test deleting tool logs activity.
     */
    public function test_deleting_tool_logs_activity(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $tool = Tool::factory()->create();

        $this->actingAs($admin)
            ->deleteJson("/api/admin/tools/{$tool->id}");

        $this->assertDatabaseHas('activity_logs', [
            'action' => 'admin.tool_deleted',
        ]);
    }

    // ==========================================
    // Authorization Tests
    // ==========================================

    /**
     * Test non-admin cannot list tools.
     */
    public function test_non_admin_cannot_list_tools(): void
    {
        $user = User::factory()->create(['role' => 'user']);

        $response = $this->actingAs($user)
            ->getJson('/api/admin/tools');

        $response->assertStatus(403);
    }

    /**
     * Test non-admin cannot create tool.
     */
    public function test_non_admin_cannot_create_tool(): void
    {
        $user = User::factory()->create(['role' => 'user']);

        $response = $this->actingAs($user)
            ->postJson('/api/admin/tools', [
                'name' => 'Test',
                'category' => 'Test',
                'description' => 'Test',
            ]);

        $response->assertStatus(403);
    }

    /**
     * Test non-admin cannot update tool.
     */
    public function test_non_admin_cannot_update_tool(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $tool = Tool::factory()->create();

        $response = $this->actingAs($user)
            ->putJson("/api/admin/tools/{$tool->id}", [
                'name' => 'Updated',
            ]);

        $response->assertStatus(403);
    }

    /**
     * Test non-admin cannot delete tool.
     */
    public function test_non_admin_cannot_delete_tool(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $tool = Tool::factory()->create();

        $response = $this->actingAs($user)
            ->deleteJson("/api/admin/tools/{$tool->id}");

        $response->assertStatus(403);
    }

    /**
     * Test unauthenticated cannot access tool management.
     */
    public function test_unauthenticated_cannot_access_tool_management(): void
    {
        $tool = Tool::factory()->create();

        $this->getJson('/api/admin/tools')->assertStatus(401);
        $this->postJson('/api/admin/tools', [])->assertStatus(401);
        $this->putJson("/api/admin/tools/{$tool->id}", [])->assertStatus(401);
        $this->deleteJson("/api/admin/tools/{$tool->id}")->assertStatus(401);
    }
}
