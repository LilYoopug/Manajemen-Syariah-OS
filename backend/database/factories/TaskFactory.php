<?php

namespace Database\Factories;

use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Task>
 */
class TaskFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Task::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'text' => fake()->sentence(4),
            'completed' => false,
            'category' => fake()->randomElement(['SDM', 'Keuangan', 'Kepatuhan', 'Pemasaran', 'Operasional', 'Teknologi']),
            'progress' => 0,
            'has_limit' => false,
            'current_value' => 0,
            'target_value' => null,
            'unit' => null,
            'reset_cycle' => null,
            'per_check_enabled' => false,
            'increment_value' => 1,
            'last_reset_at' => null,
        ];
    }

    /**
     * Indicate that the task has a numeric target.
     */
    public function withLimit(int $targetValue = 100, string $unit = 'items'): static
    {
        return $this->state(fn (array $attributes) => [
            'has_limit' => true,
            'target_value' => $targetValue,
            'unit' => $unit,
            'increment_value' => 10,
        ]);
    }

    /**
     * Indicate that the task is completed.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'completed' => true,
            'progress' => 100,
        ]);
    }

    /**
     * Indicate that the task has a reset cycle.
     */
    public function withResetCycle(string $cycle = 'daily'): static
    {
        return $this->state(fn (array $attributes) => [
            'reset_cycle' => $cycle,
        ]);
    }
}
