<?php

namespace Database\Factories;

use App\Models\Tool;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Tool>
 */
class ToolFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Tool::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $categories = ['Keuangan', 'SDM', 'Operasional', 'Pemasaran', 'Kepatuhan'];

        return [
            'name' => fake()->words(3, true),
            'category' => fake()->randomElement($categories),
            'description' => fake()->sentence(),
            'inputs' => [fake()->word(), fake()->word()],
            'outputs' => [fake()->word()],
            'benefits' => [fake()->sentence(), fake()->sentence()],
            'sharia_basis' => fake()->sentence(),
            'link' => fake()->url(),
            'related_directory_ids' => null,
            'related_dalil_text' => null,
            'related_dalil_source' => null,
        ];
    }
}
