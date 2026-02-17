<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // For SQLite, we need to recreate the table
        if (DB::getDriverName() === 'sqlite') {
            // Create a temporary table with the new schema
            Schema::create('users_new', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('email')->unique();
                $table->timestamp('email_verified_at')->nullable();
                $table->string('password');
                $table->string('role')->default('user');
                $table->string('theme')->default('light');
                $table->text('profile_picture')->nullable();
                $table->decimal('zakat_rate', 5, 2)->nullable();
                $table->string('preferred_akad')->nullable();
                $table->string('calculation_method')->nullable();
                $table->rememberToken();
                $table->timestamps();
            });

            // Copy data from old table to new
            DB::statement('INSERT INTO users_new SELECT * FROM users');

            // Drop old table
            Schema::drop('users');

            // Rename new table
            Schema::rename('users_new', 'users');
        } else {
            Schema::table('users', function (Blueprint $table) {
                $table->text('profile_picture')->nullable()->change();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            Schema::create('users_old', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('email')->unique();
                $table->timestamp('email_verified_at')->nullable();
                $table->string('password');
                $table->string('role')->default('user');
                $table->string('theme')->default('light');
                $table->string('profile_picture')->nullable();
                $table->decimal('zakat_rate', 5, 2)->nullable();
                $table->string('preferred_akad')->nullable();
                $table->string('calculation_method')->nullable();
                $table->rememberToken();
                $table->timestamps();
            });

            // Copy data (truncating profile_picture if too long)
            DB::statement('INSERT INTO users_old SELECT id, name, email, email_verified_at, password, role, theme, CASE WHEN LENGTH(profile_picture) > 255 THEN NULL ELSE profile_picture END, zakat_rate, preferred_akad, calculation_method, remember_token, created_at, updated_at FROM users');

            Schema::drop('users');
            Schema::rename('users_old', 'users');
        } else {
            Schema::table('users', function (Blueprint $table) {
                $table->string('profile_picture')->nullable()->change();
            });
        }
    }
};
