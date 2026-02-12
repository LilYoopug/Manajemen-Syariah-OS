<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LoginTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test successful login returns token and user data.
     */
    public function test_user_can_login_successfully(): void
    {
        // Create a user with known password
        $user = User::factory()->create([
            'email' => 'john@example.com',
            'password' => bcrypt('password123'),
        ]);

        $loginData = [
            'email' => 'john@example.com',
            'password' => 'password123',
        ];

        $response = $this->postJson('/api/auth/login', $loginData);

        $response->assertStatus(200)
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
                'message' => 'Login successful',
                'data' => [
                    'email' => 'john@example.com',
                    'name' => $user->name,
                ],
            ]);

        // Verify token is present
        $this->assertNotEmpty($response->json('token'));
    }

    /**
     * Test activity log is created on login.
     */
    public function test_activity_log_is_created_on_login(): void
    {
        $user = User::factory()->create([
            'email' => 'jane@example.com',
            'password' => bcrypt('password123'),
        ]);

        $loginData = [
            'email' => 'jane@example.com',
            'password' => 'password123',
        ];

        $response = $this->postJson('/api/auth/login', $loginData);

        $response->assertStatus(200);

        // Verify activity log was created
        $this->assertDatabaseHas('activity_logs', [
            'user_id' => $user->id,
            'action' => 'user.login',
        ]);
    }

    /**
     * Test login fails with invalid password.
     */
    public function test_login_fails_with_wrong_password(): void
    {
        User::factory()->create([
            'email' => 'user@example.com',
            'password' => bcrypt('correctpassword'),
        ]);

        $loginData = [
            'email' => 'user@example.com',
            'password' => 'wrongpassword',
        ];

        $response = $this->postJson('/api/auth/login', $loginData);

        $response->assertStatus(401)
            ->assertJson([
                'message' => 'Invalid credentials',
            ]);
    }

    /**
     * Test login fails with non-existent email.
     */
    public function test_login_fails_with_nonexistent_email(): void
    {
        $loginData = [
            'email' => 'nonexistent@example.com',
            'password' => 'password123',
        ];

        $response = $this->postJson('/api/auth/login', $loginData);

        $response->assertStatus(401)
            ->assertJson([
                'message' => 'Invalid credentials',
            ]);
    }

    /**
     * Test validation error for missing email.
     */
    public function test_login_fails_with_missing_email(): void
    {
        $loginData = [
            'password' => 'password123',
        ];

        $response = $this->postJson('/api/auth/login', $loginData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email'])
            ->assertJson([
                'message' => 'Email is required.',
            ]);
    }

    /**
     * Test validation error for missing password.
     */
    public function test_login_fails_with_missing_password(): void
    {
        $loginData = [
            'email' => 'test@example.com',
        ];

        $response = $this->postJson('/api/auth/login', $loginData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password'])
            ->assertJson([
                'message' => 'Password is required.',
            ]);
    }

    /**
     * Test validation error for invalid email format.
     */
    public function test_login_fails_with_invalid_email_format(): void
    {
        $loginData = [
            'email' => 'invalid-email',
            'password' => 'password123',
        ];

        $response = $this->postJson('/api/auth/login', $loginData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /**
     * Test login returns generic error for wrong credentials (no user enumeration).
     */
    public function test_login_returns_same_error_for_wrong_email_and_wrong_password(): void
    {
        // Create a user
        User::factory()->create([
            'email' => 'existing@example.com',
            'password' => bcrypt('correctpassword'),
        ]);

        // Wrong password for existing user
        $response1 = $this->postJson('/api/auth/login', [
            'email' => 'existing@example.com',
            'password' => 'wrongpassword',
        ]);

        // Non-existent user
        $response2 = $this->postJson('/api/auth/login', [
            'email' => 'nonexistent@example.com',
            'password' => 'anypassword',
        ]);

        // Both should return same error message and status
        $this->assertEquals(401, $response1->status());
        $this->assertEquals(401, $response2->status());
        $this->assertEquals(
            $response1->json('message'),
            $response2->json('message')
        );
    }
}
