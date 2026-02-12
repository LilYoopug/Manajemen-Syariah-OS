<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seeders will be called here as they are created
        $this->call([
            CategorySeeder::class,
            DirectorySeeder::class,
            ToolSeeder::class,
        ]);
    }
}
