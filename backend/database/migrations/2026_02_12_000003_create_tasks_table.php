<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('text');
            $table->boolean('completed')->default(false);
            $table->string('category');
            $table->integer('progress')->default(0);
            $table->boolean('has_limit')->default(false);
            $table->integer('current_value')->default(0);
            $table->integer('target_value')->nullable();
            $table->string('unit')->nullable();
            $table->string('reset_cycle')->nullable(); // daily, weekly, monthly, yearly
            $table->boolean('per_check_enabled')->default(false);
            $table->integer('increment_value')->default(1);
            $table->timestamp('last_reset_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'category']);
            $table->index(['user_id', 'reset_cycle']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
