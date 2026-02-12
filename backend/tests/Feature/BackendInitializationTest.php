<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Support\Facades\Schema;

class BackendInitializationTest extends TestCase
{
    /**
     * Test that the users table has all required columns.
     */
    public function test_users_table_has_required_columns(): void
    {
        $columns = [
            'id',
            'name',
            'email',
            'email_verified_at',
            'password',
            'role',
            'theme',
            'profile_picture',
            'zakat_rate',
            'preferred_akad',
            'calculation_method',
            'remember_token',
            'created_at',
            'updated_at',
        ];

        foreach ($columns as $column) {
            $this->assertTrue(
                Schema::hasColumn('users', $column),
                "Users table is missing column: {$column}"
            );
        }
    }

    /**
     * Test that the activity_logs table has all required columns.
     */
    public function test_activity_logs_table_has_required_columns(): void
    {
        $columns = [
            'id',
            'user_id',
            'action',
            'subject_type',
            'subject_id',
            'metadata',
            'created_at',
        ];

        foreach ($columns as $column) {
            $this->assertTrue(
                Schema::hasColumn('activity_logs', $column),
                "Activity logs table is missing column: {$column}"
            );
        }
    }

    /**
     * Test that the personal_access_tokens table exists.
     */
    public function test_personal_access_tokens_table_exists(): void
    {
        $this->assertTrue(
            Schema::hasTable('personal_access_tokens'),
            'Personal access tokens table does not exist'
        );
    }

    /**
     * Test user model has required fillable attributes.
     */
    public function test_user_model_has_required_fillable_attributes(): void
    {
        $user = new \App\Models\User();
        $fillable = $user->getFillable();

        $requiredFillable = [
            'name',
            'email',
            'password',
            'role',
            'theme',
            'profile_picture',
            'zakat_rate',
            'preferred_akad',
            'calculation_method',
        ];

        foreach ($requiredFillable as $attribute) {
            $this->assertContains(
                $attribute,
                $fillable,
                "User model is missing fillable attribute: {$attribute}"
            );
        }
    }

    /**
     * Test user model has default role.
     */
    public function test_user_model_has_default_role(): void
    {
        $user = new \App\Models\User();

        $this->assertEquals(
            'user',
            $user->getAttribute('role'),
            'User model should have default role of "user"'
        );
    }

    /**
     * Test user model has default theme.
     */
    public function test_user_model_has_default_theme(): void
    {
        $user = new \App\Models\User();

        $this->assertEquals(
            'light',
            $user->getAttribute('theme'),
            'User model should have default theme of "light"'
        );
    }
}
