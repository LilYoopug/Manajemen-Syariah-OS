<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Task;
use App\Models\TaskHistory;
use App\Models\DirectoryItem;
use App\Models\ActivityLog;
use App\Models\Tool;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->command->info('🚀 Starting database seeding...');
        $this->command->newLine();

        // 1. Seed users first (creates user accounts)
        $this->command->info('1/5 Seeding users...');
        $this->call(UserSeeder::class);

        // 2. Seed tasks (requires users)
        $this->command->info('2/5 Seeding tasks...');
        $this->call(TaskSeeder::class);

        // 3. Seed directory items (requires users)
        $this->command->info('3/5 Seeding directory items...');
        $this->call(DirectorySeeder::class);

        // 4. Seed activity logs (requires users)
        $this->command->info('4/5 Seeding activity logs...');
        $this->call(ActivityLogSeeder::class);

        // 5. Seed tools (independent, system-wide)
        $this->command->info('5/5 Seeding tools...');
        $this->call(ToolSeeder::class);

        $this->command->newLine();
        $this->command->info('✅ Database seeding completed!');
        $this->command->newLine();

        // Summary of seeded data
        $this->command->info('📊 Seeding Summary:');
        $this->command->info('─────────────────────────────────────────');
        $this->command->info(sprintf('  👥 Users:          %d total (%d admins, %d regular users)',
            User::count(),
            User::where('role', 'admin')->count(),
            User::where('role', 'user')->count()
        ));
        $this->command->info(sprintf('  ✅ Tasks:          %d total', Task::count()));
        $this->command->info(sprintf('  📜 Task Histories: %d total', TaskHistory::count()));
        $this->command->info(sprintf('  📁 Directory:      %d items', DirectoryItem::count()));
        $this->command->info(sprintf('  📝 Activity Logs:  %d total', ActivityLog::count()));
        $this->command->info(sprintf('  🔧 Tools:          %d total', Tool::count()));
        $this->command->info('─────────────────────────────────────────');
        $this->command->newLine();

        // Development login credentials
        $adminPassword = env('SEED_ADMIN_PASSWORD', 'Admin123!');
        $userPassword = env('SEED_USER_PASSWORD', 'User123!');
        $this->command->info('🔐 Dev Login Credentials:');
        $this->command->info('─────────────────────────────────────────');
        $this->command->info('  🛡️  Admin Account:');
        $this->command->info(sprintf('      Email:    admin@syariahos.com'));
        $this->command->info(sprintf('      Password: %s', $adminPassword));
        $this->command->newLine();
        $this->command->info('  👤 User Account:');
        $this->command->info(sprintf('      Email:    budi.santoso@email.com'));
        $this->command->info(sprintf('      Password: %s', $userPassword));
        $this->command->info('─────────────────────────────────────────');
    }
}
