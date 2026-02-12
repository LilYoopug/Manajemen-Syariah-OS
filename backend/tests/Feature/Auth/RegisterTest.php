<?php

namespace Tests\Feature\Auth;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegisterTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test successful registration returns token and user data.
     */
    public function test_user_can_register_successfully(): void
    {
        $userData = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        $response = $this->postJson('/api/auth/register', $userData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'token',
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
                'message' => 'Registration successful',
                'data' => [
                    'name' => 'John Doe',
                    'email' => 'john@example.com',
                    'role' => 'user',
                    'theme' => 'light',
                ],
            ]);

        // Verify token is present
        $this->assertNotEmpty($response->json('token'));

        // Verify user was created in database
        $this->assertDatabaseHas('users', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'role' => 'user',
        ]);

        // Verify password is hashed (not stored as plain text)
        $user = User::where('email', 'john@example.com')->first();
        $this->assertNotEquals('password123', $user->password);
        $this->assertTrue(password_verify('password123', $user->password));
    }

    /**
     * Test activity log is created on registration.
     */
    public function test_activity_log_is_created_on_registration(): void
    {
        $userData = [
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        $response = $this->postJson('/api/auth/register', $userData);

        $response->assertStatus(201);

        // Verify activity log was created
        $user = User::where('email', 'jane@example.com')->first();
        $this->assertDatabaseHas('activity_logs', [
            'user_id' => $user->id,
            'action' => 'user.registered',
        ]);
    }

    /**
     * Test duplicate email returns 422 with error.
     */
    public function test_registration_fails_with_duplicate_email(): void
    {
        // Create existing user
        User::factory()->create([
            'email' => 'existing@example.com',
        ]);

        $userData = [
            'name' => 'New User',
            'email' => 'existing@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        $response = $this->postJson('/api/auth/register', $userData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email'])
            ->assertJson([
                'message' => 'This email is already registered.',
            ]);
    }

    /**
     * Test validation error for missing name.
     */
    public function test_registration_fails_with_missing_name(): void
    {
        $userData = [
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        $response = $this->postJson('/api/auth/register', $userData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name'])
            ->assertJson([
                'message' => 'Name is required.',
            ]);
    }

    /**
     * Test validation error for invalid email format.
     */
    public function test_registration_fails_with_invalid_email(): void
    {
        $userData = [
            'name' => 'Test User',
            'email' => 'invalid-email',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        $response = $this->postJson('/api/auth/register', $userData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /**
     * Test validation error for password less than 8 characters.
     */
    public function test_registration_fails_with_short_password(): void
    {
        $userData = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'short',
            'password_confirmation' => 'short',
        ];

        $response = $this->postJson('/api/auth/register', $userData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password'])
            ->assertJson([
                'message' => 'Password must be at least 8 characters.',
            ]);
    }

    /**
     * Test validation error for password confirmation mismatch.
     */
    public function test_registration_fails_with_password_mismatch(): void
    {
        $userData = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'different123',
        ];

        $response = $this->postJson('/api/auth/register', $userData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password'])
            ->assertJson([
                'message' => 'Password confirmation does not match.',
            ]);
    }

    /**
     * Test default role is 'user'.
     */
    public function test_registration_assigns_default_user_role(): void
    {
        $userData = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        $response = $this->postJson('/api/auth/register', $userData);

        $response->assertStatus(201)
            ->assertJson([
                'data' => [
                    'role' => 'user',
                ],
            ]);

        $user = User::where('email', 'test@example.com')->first();
        $this->assertEquals('user', $user->role);
    }

    /**
     * Test default theme is 'light'.
     */
    public function test_registration_assigns_default_light_theme(): void
    {
        $userData = [
            'name' => 'Test User',
            'email' => 'theme@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        $response = $this->postJson('/api/auth/register', $userData);

        $response->assertStatus(201)
            ->assertJson([
                'data' => [
                    'theme' => 'light',
                ],
            ]);

        $user = User::where('email', 'theme@example.com')->first();
        $this->assertEquals('light', $user->theme);
    }
}
