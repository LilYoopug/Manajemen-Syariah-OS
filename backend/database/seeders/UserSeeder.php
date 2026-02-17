<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $password = env('SEED_ADMIN_PASSWORD', 'Admin123!');

        // ==========================================
        // ADMIN USERS
        // ==========================================
        $admins = [
            [
                'email' => 'admin@syariahos.com',
                'name' => 'Ahmad Fauzan',
                'role' => 'admin',
                'theme' => 'light',  // Default to light for consistency with landing page
                'zakat_rate' => 2.5,
                'preferred_akad' => 'Murabahah',
                'calculation_method' => 'Masehi',
            ],
            [
                'email' => 'superadmin@syariahos.com',
                'name' => 'Siti Nurhaliza',
                'role' => 'admin',
                'theme' => 'light',
                'zakat_rate' => 2.5,
                'preferred_akad' => 'Ijarah',
                'calculation_method' => 'Hijriyah',
            ],
        ];

        foreach ($admins as $admin) {
            User::updateOrCreate(
                ['email' => $admin['email']],
                array_merge($admin, ['password' => $password])
            );
        }

        // ==========================================
        // REGULAR USERS - Varied Profiles
        // ==========================================
        $users = [
            // Active Business Users
            [
                'email' => 'budi.santoso@email.com',
                'name' => 'Budi Santoso',
                'theme' => 'light',
                'zakat_rate' => 2.5,
                'preferred_akad' => 'Murabahah',
                'calculation_method' => 'Masehi',
                'profile' => 'active_business',
            ],
            [
                'email' => 'dewi.lestari@email.com',
                'name' => 'Dewi Lestari',
                'theme' => 'dark',
                'zakat_rate' => 2.5,
                'preferred_akad' => 'Mudharabah',
                'calculation_method' => 'Masehi',
                'profile' => 'active_business',
            ],
            [
                'email' => 'eko.prasetyo@email.com',
                'name' => 'Eko Prasetyo',
                'theme' => 'light',
                'zakat_rate' => 2.5,
                'preferred_akad' => 'Musyarakah',
                'calculation_method' => 'Masehi',
                'profile' => 'active_business',
            ],

            // Medium Active Users
            [
                'email' => 'fitri.handayani@email.com',
                'name' => 'Fitri Handayani',
                'theme' => 'light',
                'zakat_rate' => 2.5,
                'preferred_akad' => 'Murabahah',
                'calculation_method' => 'Masehi',
                'profile' => 'medium_active',
            ],
            [
                'email' => 'gunawan.wibowo@email.com',
                'name' => 'Gunawan Wibowo',
                'theme' => 'dark',
                'zakat_rate' => 2.5,
                'preferred_akad' => 'Ijarah',
                'calculation_method' => 'Hijriyah',
                'profile' => 'medium_active',
            ],
            [
                'email' => 'hani.susanti@email.com',
                'name' => 'Hani Susanti',
                'theme' => 'light',
                'zakat_rate' => 2.5,
                'preferred_akad' => 'Murabahah',
                'calculation_method' => 'Masehi',
                'profile' => 'medium_active',
            ],

            // Light Users
            [
                'email' => 'irwan.setiawan@email.com',
                'name' => 'Irwan Setiawan',
                'theme' => 'light',
                'zakat_rate' => 2.5,
                'preferred_akad' => 'Murabahah',
                'calculation_method' => 'Masehi',
                'profile' => 'light_user',
            ],
            [
                'email' => 'julia.putri@email.com',
                'name' => 'Julia Putri',
                'theme' => 'light',
                'zakat_rate' => 2.5,
                'preferred_akad' => 'Wakalah',
                'calculation_method' => 'Masehi',
                'profile' => 'light_user',
            ],

            // New Users (recently joined)
            [
                'email' => 'kevin.halim@email.com',
                'name' => 'Kevin Halim',
                'theme' => 'light',
                'zakat_rate' => null,
                'preferred_akad' => null,
                'calculation_method' => null,
                'profile' => 'new_user',
            ],
            [
                'email' => 'linda.kusuma@email.com',
                'name' => 'Linda Kusuma',
                'theme' => 'light',
                'zakat_rate' => null,
                'preferred_akad' => null,
                'calculation_method' => null,
                'profile' => 'new_user',
            ],

            // Compliance-focused Users
            [
                'email' => 'mira.azizah@email.com',
                'name' => 'Mira Azizah',
                'theme' => 'dark',
                'zakat_rate' => 2.5,
                'preferred_akad' => 'Murabahah',
                'calculation_method' => 'Hijriyah',
                'profile' => 'compliance_focused',
            ],
            [
                'email' => 'nasir.rahman@email.com',
                'name' => 'Nasir Rahman',
                'theme' => 'light',
                'zakat_rate' => 2.5,
                'preferred_akad' => 'Musyarakah',
                'calculation_method' => 'Masehi',
                'profile' => 'compliance_focused',
            ],

            // Finance-focused Users
            [
                'email' => 'olga.wijaya@email.com',
                'name' => 'Olga Wijaya',
                'theme' => 'dark',
                'zakat_rate' => 2.5,
                'preferred_akad' => 'Mudharabah',
                'calculation_method' => 'Masehi',
                'profile' => 'finance_focused',
            ],
            [
                'email' => 'putra.mahendra@email.com',
                'name' => 'Putra Mahendra',
                'theme' => 'light',
                'zakat_rate' => 2.5,
                'preferred_akad' => 'Ijarah',
                'calculation_method' => 'Masehi',
                'profile' => 'finance_focused',
            ],

            // Technology-focused Users
            [
                'email' => 'qori.ammir@email.com',
                'name' => 'Qori Ammir',
                'theme' => 'dark',
                'zakat_rate' => 2.5,
                'preferred_akad' => 'Murabahah',
                'calculation_method' => 'Masehi',
                'profile' => 'tech_focused',
            ],
            [
                'email' => 'rina.agustina@email.com',
                'name' => 'Rina Agustina',
                'theme' => 'light',
                'zakat_rate' => 2.5,
                'preferred_akad' => 'Wakalah',
                'calculation_method' => 'Masehi',
                'profile' => 'tech_focused',
            ],

            // Inactive/Dormant Users
            [
                'email' => 'sari.indah@email.com',
                'name' => 'Sari Indah',
                'theme' => 'light',
                'zakat_rate' => null,
                'preferred_akad' => null,
                'calculation_method' => null,
                'profile' => 'inactive',
            ],
            [
                'email' => 'tomi.hidayat@email.com',
                'name' => 'Tomi Hidayat',
                'theme' => 'light',
                'zakat_rate' => null,
                'preferred_akad' => null,
                'calculation_method' => null,
                'profile' => 'inactive',
            ],

            // Marketing-focused Users
            [
                'email' => 'ulia.nurul@email.com',
                'name' => 'Ulia Nurul',
                'theme' => 'light',
                'zakat_rate' => 2.5,
                'preferred_akad' => 'Murabahah',
                'calculation_method' => 'Masehi',
                'profile' => 'marketing_focused',
            ],
            [
                'email' => 'viqi.rahayu@email.com',
                'name' => 'Viqi Rahayu',
                'theme' => 'dark',
                'zakat_rate' => 2.5,
                'preferred_akad' => 'Ijarah',
                'calculation_method' => 'Masehi',
                'profile' => 'marketing_focused',
            ],

            // SDM/HR-focused Users
            [
                'email' => 'wawan.hermawan@email.com',
                'name' => 'Wawan Hermawan',
                'theme' => 'light',
                'zakat_rate' => 2.5,
                'preferred_akad' => 'Murabahah',
                'calculation_method' => 'Masehi',
                'profile' => 'sdm_focused',
            ],
            [
                'email' => 'xena.pratiwi@email.com',
                'name' => 'Xena Pratiwi',
                'theme' => 'light',
                'zakat_rate' => 2.5,
                'preferred_akad' => 'Wakalah',
                'calculation_method' => 'Masehi',
                'profile' => 'sdm_focused',
            ],

            // Operational Users
            [
                'email' => 'yusuf.rahman@email.com',
                'name' => 'Yusuf Rahman',
                'theme' => 'dark',
                'zakat_rate' => 2.5,
                'preferred_akad' => 'Murabahah',
                'calculation_method' => 'Masehi',
                'profile' => 'operational',
            ],
            [
                'email' => 'zahra.amalia@email.com',
                'name' => 'Zahra Amalia',
                'theme' => 'light',
                'zakat_rate' => 2.5,
                'preferred_akad' => 'Musyarakah',
                'calculation_method' => 'Hijriyah',
                'profile' => 'operational',
            ],
        ];

        $userPassword = env('SEED_USER_PASSWORD', 'User123!');
        $createdUsers = [];

        foreach ($users as $userData) {
            $profile = $userData['profile'];
            unset($userData['profile']);

            $user = User::updateOrCreate(
                ['email' => $userData['email']],
                array_merge($userData, [
                    'password' => $userPassword,
                    'role' => 'user',
                ])
            );
            $createdUsers[$profile][] = $user;
        }

        // Output credentials in development
        if (app()->environment('local')) {
            $this->command->info('Seeded Users:');
            $this->command->info("Admin: admin@syariahos.com / {$password}");
            $this->command->info("User: budi.santoso@email.com / {$userPassword}");
            $this->command->info("Total users: " . User::count());
        }

        // Store user profiles for other seeders
        $this->command->info('User profiles created for task/directory seeding.');
    }
}
