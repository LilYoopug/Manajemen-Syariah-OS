<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserExportTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test admin can export users as JSON.
     */
    public function test_admin_can_export_users(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        User::factory()->count(5)->create();

        $response = $this->actingAs($admin)
            ->getJson('/api/admin/users/export');

        $response->assertStatus(200)
            ->assertHeader('Content-Type', 'application/json')
            ->assertHeader('Content-Disposition');

        // Verify the content is valid JSON
        $content = $response->streamedContent();
        $data = json_decode($content, true);

        $this->assertIsArray($data);
        $this->assertCount(6, $data); // 5 users + admin
    }

    /**
     * Test export excludes passwords.
     */
    public function test_export_excludes_passwords(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)
            ->getJson('/api/admin/users/export');

        $content = $response->streamedContent();
        $data = json_decode($content, true);

        foreach ($data as $user) {
            $this->assertArrayNotHasKey('password', $user);
        }
    }

    /**
     * Test export includes user profile data.
     */
    public function test_export_includes_profile_data(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'name' => 'Admin User',
            'email' => 'admin@example.com',
        ]);

        $response = $this->actingAs($admin)
            ->getJson('/api/admin/users/export');

        $content = $response->streamedContent();
        $data = json_decode($content, true);

        $adminUser = collect($data)->firstWhere('email', 'admin@example.com');

        $this->assertEquals('Admin User', $adminUser['name']);
        $this->assertEquals('admin', $adminUser['role']);
        $this->assertArrayHasKey('id', $adminUser);
        $this->assertArrayHasKey('created_at', $adminUser);
    }

    /**
     * Test export filename has correct format.
     */
    public function test_export_filename_has_correct_format(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)
            ->getJson('/api/admin/users/export');

        $response->assertStatus(200);

        $disposition = $response->headers->get('Content-Disposition');
        $this->assertStringContainsString('users_export_', $disposition);
        $this->assertStringContainsString('.json', $disposition);
    }

    /**
     * Test non-admin cannot export users.
     */
    public function test_non_admin_cannot_export_users(): void
    {
        $user = User::factory()->create(['role' => 'user']);

        $response = $this->actingAs($user)
            ->getJson('/api/admin/users/export');

        $response->assertStatus(403);
    }

    /**
     * Test unauthenticated cannot export users.
     */
    public function test_unauthenticated_cannot_export_users(): void
    {
        $response = $this->getJson('/api/admin/users/export');

        $response->assertStatus(401);
    }
}
