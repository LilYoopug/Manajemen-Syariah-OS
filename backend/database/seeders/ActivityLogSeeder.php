<?php

namespace Database\Seeders;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Database\Seeder;

class ActivityLogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();

        foreach ($users as $user) {
            $profile = $this->getUserProfile($user->email);
            $this->seedActivityLogsForUser($user, $profile);
        }

        $this->command->info('Activity logs seeded: ' . ActivityLog::count());
    }

    /**
     * Determine user profile based on email.
     */
    private function getUserProfile(string $email): string
    {
        $profiles = [
            'admin@syariahos.com' => 'admin',
            'superadmin@syariahos.com' => 'admin',
            'budi.santoso@email.com' => 'active_business',
            'dewi.lestari@email.com' => 'active_business',
            'eko.prasetyo@email.com' => 'active_business',
            'fitri.handayani@email.com' => 'medium_active',
            'gunawan.wibowo@email.com' => 'medium_active',
            'hani.susanti@email.com' => 'medium_active',
            'irwan.setiawan@email.com' => 'light_user',
            'julia.putri@email.com' => 'light_user',
            'kevin.halim@email.com' => 'new_user',
            'linda.kusuma@email.com' => 'new_user',
            'mira.azizah@email.com' => 'compliance_focused',
            'nasir.rahman@email.com' => 'compliance_focused',
            'olga.wijaya@email.com' => 'finance_focused',
            'putra.mahendra@email.com' => 'finance_focused',
            'qori.ammir@email.com' => 'tech_focused',
            'rina.agustina@email.com' => 'tech_focused',
            'sari.indah@email.com' => 'inactive',
            'tomi.hidayat@email.com' => 'inactive',
            'ulia.nurul@email.com' => 'marketing_focused',
            'viqi.rahayu@email.com' => 'marketing_focused',
            'wawan.hermawan@email.com' => 'sdm_focused',
            'xena.pratiwi@email.com' => 'sdm_focused',
            'yusuf.rahman@email.com' => 'operational',
            'zahra.amalia@email.com' => 'operational',
        ];

        return $profiles[$email] ?? 'medium_active';
    }

    /**
     * Seed activity logs for a user based on their profile.
     */
    private function seedActivityLogsForUser(User $user, string $profile): void
    {
        $activityConfigs = $this->getActivityConfig($profile);

        foreach ($activityConfigs as $config) {
            for ($i = 0; $i < $config['count']; $i++) {
                ActivityLog::create([
                    'user_id' => $user->id,
                    'action' => $config['action'],
                    'subject_type' => $config['subject_type'] ?? null,
                    'subject_id' => $config['subject_id'] ?? null,
                    'metadata' => $config['metadata'] ?? null,
                    'created_at' => now()->subDays(rand(1, 60))->subHours(rand(0, 23)),
                ]);
            }
        }
    }

    /**
     * Get activity configuration based on profile.
     */
    private function getActivityConfig(string $profile): array
    {
        $baseActivities = [
            ['action' => 'user.login', 'count' => 1],
            ['action' => 'user.profile_updated', 'count' => 1],
        ];

        $adminActivities = [
            ['action' => 'user.login', 'count' => 15],
            ['action' => 'user.profile_updated', 'count' => 2],
            ['action' => 'admin.user_created', 'count' => 3],
            ['action' => 'admin.user_updated', 'count' => 5],
            ['action' => 'admin.user_deleted', 'count' => 1],
            ['action' => 'admin.tool_created', 'count' => 2],
            ['action' => 'admin.tool_updated', 'count' => 4],
        ];

        $activeBusinessActivities = [
            ['action' => 'user.login', 'count' => 20],
            ['action' => 'user.profile_updated', 'count' => 3],
            ['action' => 'task.created', 'count' => 12],
            ['action' => 'task.updated', 'count' => 8],
            ['action' => 'task.completed', 'count' => 15],
            ['action' => 'task.deleted', 'count' => 2],
            ['action' => 'directory.item_created', 'count' => 5],
            ['action' => 'directory.item_updated', 'count' => 3],
            ['action' => 'user.data_exported', 'count' => 2],
        ];

        $mediumActiveActivities = [
            ['action' => 'user.login', 'count' => 10],
            ['action' => 'user.profile_updated', 'count' => 2],
            ['action' => 'task.created', 'count' => 6],
            ['action' => 'task.updated', 'count' => 4],
            ['action' => 'task.completed', 'count' => 8],
            ['action' => 'directory.item_created', 'count' => 3],
        ];

        $lightUserActivities = [
            ['action' => 'user.login', 'count' => 3],
            ['action' => 'user.profile_updated', 'count' => 1],
            ['action' => 'task.created', 'count' => 2],
            ['action' => 'task.completed', 'count' => 1],
        ];

        $newUserActivities = [
            ['action' => 'user.registered', 'count' => 1],
            ['action' => 'user.login', 'count' => 2],
            ['action' => 'task.created', 'count' => 1],
        ];

        $complianceFocusedActivities = [
            ['action' => 'user.login', 'count' => 15],
            ['action' => 'user.profile_updated', 'count' => 2],
            ['action' => 'task.created', 'count' => 8],
            ['action' => 'task.updated', 'count' => 6],
            ['action' => 'task.completed', 'count' => 12],
            ['action' => 'directory.item_created', 'count' => 6],
            ['action' => 'directory.item_updated', 'count' => 4],
            ['action' => 'user.data_exported', 'count' => 1],
        ];

        $financeFocusedActivities = [
            ['action' => 'user.login', 'count' => 18],
            ['action' => 'user.profile_updated', 'count' => 3],
            ['action' => 'task.created', 'count' => 10],
            ['action' => 'task.updated', 'count' => 7],
            ['action' => 'task.completed', 'count' => 14],
            ['action' => 'directory.item_created', 'count' => 5],
            ['action' => 'user.data_exported', 'count' => 3],
        ];

        $techFocusedActivities = [
            ['action' => 'user.login', 'count' => 12],
            ['action' => 'user.profile_updated', 'count' => 2],
            ['action' => 'task.created', 'count' => 7],
            ['action' => 'task.completed', 'count' => 5],
            ['action' => 'directory.item_created', 'count' => 3],
        ];

        $inactiveActivities = [
            ['action' => 'user.registered', 'count' => 1],
            ['action' => 'user.login', 'count' => 1],
        ];

        $marketingFocusedActivities = [
            ['action' => 'user.login', 'count' => 12],
            ['action' => 'user.profile_updated', 'count' => 2],
            ['action' => 'task.created', 'count' => 8],
            ['action' => 'task.completed', 'count' => 6],
            ['action' => 'directory.item_created', 'count' => 4],
        ];

        $sdmFocusedActivities = [
            ['action' => 'user.login', 'count' => 14],
            ['action' => 'user.profile_updated', 'count' => 3],
            ['action' => 'task.created', 'count' => 10],
            ['action' => 'task.completed', 'count' => 8],
            ['action' => 'directory.item_created', 'count' => 5],
            ['action' => 'user.data_exported', 'count' => 2],
        ];

        $operationalActivities = [
            ['action' => 'user.login', 'count' => 13],
            ['action' => 'user.profile_updated', 'count' => 2],
            ['action' => 'task.created', 'count' => 9],
            ['action' => 'task.completed', 'count' => 7],
            ['action' => 'directory.item_created', 'count' => 4],
        ];

        return match ($profile) {
            'admin' => $adminActivities,
            'active_business' => $activeBusinessActivities,
            'medium_active' => $mediumActiveActivities,
            'light_user' => $lightUserActivities,
            'new_user' => $newUserActivities,
            'compliance_focused' => $complianceFocusedActivities,
            'finance_focused' => $financeFocusedActivities,
            'tech_focused' => $techFocusedActivities,
            'inactive' => $inactiveActivities,
            'marketing_focused' => $marketingFocusedActivities,
            'sdm_focused' => $sdmFocusedActivities,
            'operational' => $operationalActivities,
            default => $baseActivities,
        };
    }
}
