<?php

namespace Tests\Feature\Profile;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test authenticated user can view their profile.
     */
    public function test_user_can_view_their_profile(): void
    {
        $user = User::factory()->create([
            'name' => 'Ahmad',
            'email' => 'ahmad@example.com',
            'theme' => 'light',
            'zakat_rate' => 2.5,
            'preferred_akad' => 'Murabahah',
            'calculation_method' => 'Hijri',
        ]);

        $response = $this->actingAs($user)
            ->getJson('/api/profile');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'email',
                    'role',
                    'theme',
                    'profilePicture',
                    'zakatRate',
                    'preferredAkad',
                    'calculationMethod',
                    'createdAt',
                    'updatedAt',
                ],
            ])
            ->assertJson([
                'data' => [
                    'name' => 'Ahmad',
                    'email' => 'ahmad@example.com',
                    'theme' => 'light',
                    'zakatRate' => 2.5,
                    'preferredAkad' => 'Murabahah',
                    'calculationMethod' => 'Hijri',
                ],
            ]);
    }

    /**
     * Test profile response excludes sensitive fields.
     */
    public function test_profile_excludes_sensitive_fields(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->getJson('/api/profile');

        $response->assertStatus(200)
            ->assertJsonMissing(['password'])
            ->assertJsonMissing(['remember_token']);
    }

    /**
     * Test authenticated user can update their profile.
     */
    public function test_user_can_update_their_profile(): void
    {
        $user = User::factory()->create([
            'name' => 'Original Name',
            'theme' => 'light',
        ]);

        $updateData = [
            'name' => 'Updated Name',
            'theme' => 'dark',
            'zakatRate' => 3.0,
            'preferredAkad' => 'Mudharabah',
            'calculationMethod' => 'Masehi',
        ];

        $response = $this->actingAs($user)
            ->putJson('/api/profile', $updateData);

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'name' => 'Updated Name',
                    'theme' => 'dark',
                    'zakatRate' => 3.0,
                    'preferredAkad' => 'Mudharabah',
                    'calculationMethod' => 'Masehi',
                ],
            ]);

        // Verify database was updated
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Updated Name',
            'theme' => 'dark',
            'zakat_rate' => 3.0,
            'preferred_akad' => 'Mudharabah',
            'calculation_method' => 'Masehi',
        ]);
    }

    /**
     * Test partial profile update (only provided fields).
     */
    public function test_partial_profile_update(): void
    {
        $user = User::factory()->create([
            'name' => 'Original Name',
            'theme' => 'light',
            'preferred_akad' => 'Murabahah',
        ]);

        $updateData = [
            'name' => 'New Name',
        ];

        $response = $this->actingAs($user)
            ->putJson('/api/profile', $updateData);

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'name' => 'New Name',
                    'theme' => 'light', // Unchanged
                    'preferredAkad' => 'Murabahah', // Unchanged
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'New Name',
            'theme' => 'light',
            'preferred_akad' => 'Murabahah',
        ]);
    }

    /**
     * Test validation error for invalid theme value.
     */
    public function test_validation_error_for_invalid_theme(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->putJson('/api/profile', [
                'theme' => 'invalid-theme',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['theme']);
    }

    /**
     * Test validation error for negative zakatRate.
     */
    public function test_validation_error_for_negative_zakat_rate(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->putJson('/api/profile', [
                'zakatRate' => -5,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['zakatRate']);
    }

    /**
     * Test validation error for zakatRate above 100.
     */
    public function test_validation_error_for_zakat_rate_above_100(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->putJson('/api/profile', [
                'zakatRate' => 150,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['zakatRate']);
    }

    /**
     * Test validation error for invalid calculationMethod.
     */
    public function test_validation_error_for_invalid_calculation_method(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->putJson('/api/profile', [
                'calculationMethod' => 'Invalid',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['calculationMethod']);
    }

    /**
     * Test unauthenticated request to view profile.
     */
    public function test_unauthenticated_user_cannot_view_profile(): void
    {
        $response = $this->getJson('/api/profile');

        $response->assertStatus(401);
    }

    /**
     * Test unauthenticated request to update profile.
     */
    public function test_unauthenticated_user_cannot_update_profile(): void
    {
        $response = $this->putJson('/api/profile', [
            'name' => 'New Name',
        ]);

        $response->assertStatus(401);
    }

    /**
     * Test email cannot be changed through profile endpoint.
     */
    public function test_email_cannot_be_changed(): void
    {
        $user = User::factory()->create([
            'email' => 'original@example.com',
        ]);

        $response = $this->actingAs($user)
            ->putJson('/api/profile', [
                'email' => 'new@example.com',
                'name' => 'New Name',
            ]);

        // Email should be ignored, name should be updated
        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'email' => 'original@example.com',
                    'name' => 'New Name',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'email' => 'original@example.com',
            'name' => 'New Name',
        ]);
    }

    /**
     * Test role cannot be changed through profile endpoint.
     */
    public function test_role_cannot_be_changed(): void
    {
        $user = User::factory()->create([
            'role' => 'user',
        ]);

        $response = $this->actingAs($user)
            ->putJson('/api/profile', [
                'role' => 'admin',
                'name' => 'New Name',
            ]);

        // Role should be ignored, name should be updated
        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'role' => 'user',
                    'name' => 'New Name',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'role' => 'user',
            'name' => 'New Name',
        ]);
    }

    /**
     * Test profile update with profile picture URL.
     */
    public function test_profile_update_with_profile_picture(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->putJson('/api/profile', [
                'profilePicture' => 'https://example.com/avatar.jpg',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'profilePicture' => 'https://example.com/avatar.jpg',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'profile_picture' => 'https://example.com/avatar.jpg',
        ]);
    }

    /**
     * Test profile update with nullable fields.
     */
    public function test_profile_update_with_null_values(): void
    {
        $user = User::factory()->create([
            'zakat_rate' => 2.5,
            'preferred_akad' => 'Murabahah',
            'calculation_method' => 'Hijri',
        ]);

        $response = $this->actingAs($user)
            ->putJson('/api/profile', [
                'zakatRate' => null,
                'preferredAkad' => null,
                'calculationMethod' => null,
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'zakat_rate' => null,
            'preferred_akad' => null,
            'calculation_method' => null,
        ]);
    }

    /**
     * Test profile update with empty request body.
     */
    public function test_profile_update_with_empty_body(): void
    {
        $user = User::factory()->create([
            'name' => 'Original Name',
            'theme' => 'light',
        ]);

        $response = $this->actingAs($user)
            ->putJson('/api/profile', []);

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'name' => 'Original Name',
                    'theme' => 'light',
                ],
            ]);

        // Verify database was not changed
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Original Name',
            'theme' => 'light',
        ]);
    }

    /**
     * Test validation error for invalid profile picture URL.
     */
    public function test_validation_error_for_invalid_profile_picture_url(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->putJson('/api/profile', [
                'profilePicture' => 'not-a-valid-url',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['profilePicture']);
    }

    /**
     * Test activity log is created on profile update.
     */
    public function test_activity_log_is_created_on_profile_update(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->putJson('/api/profile', [
                'name' => 'New Name',
            ]);

        $response->assertStatus(200);

        // Verify activity log was created
        $this->assertDatabaseHas('activity_logs', [
            'user_id' => $user->id,
            'action' => 'user.profile_updated',
        ]);
    }
}
