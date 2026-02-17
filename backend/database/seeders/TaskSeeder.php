<?php

namespace Database\Seeders;

use App\Models\Task;
use App\Models\TaskHistory;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TaskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::where('role', 'user')->get();

        foreach ($users as $user) {
            $profile = $this->getUserProfile($user->email);
            $this->seedTasksForUser($user, $profile);
        }

        $this->command->info('Tasks seeded: ' . Task::count());
        $this->command->info('Task histories seeded: ' . TaskHistory::count());
    }

    /**
     * Determine user profile based on email.
     */
    private function getUserProfile(string $email): string
    {
        $profiles = [
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
     * Seed tasks based on user profile.
     */
    private function seedTasksForUser(User $user, string $profile): void
    {
        $taskConfigs = $this->getTaskConfigs($profile);

        foreach ($taskConfigs as $config) {
            $this->createTasksWithConfig($user, $config);
        }
    }

    /**
     * Get task configurations for each profile.
     */
    private function getTaskConfigs(string $profile): array
    {
        return match ($profile) {
            'active_business' => [
                ['count' => 8, 'category' => 'SDM', 'completed_rate' => 0.6],
                ['count' => 10, 'category' => 'Keuangan', 'completed_rate' => 0.7],
                ['count' => 6, 'category' => 'Kepatuhan', 'completed_rate' => 0.9],
                ['count' => 5, 'category' => 'Pemasaran', 'completed_rate' => 0.5],
                ['count' => 7, 'category' => 'Operasional', 'completed_rate' => 0.6],
                ['count' => 4, 'category' => 'Teknologi', 'completed_rate' => 0.4],
            ],
            'medium_active' => [
                ['count' => 5, 'category' => 'SDM', 'completed_rate' => 0.5],
                ['count' => 6, 'category' => 'Keuangan', 'completed_rate' => 0.6],
                ['count' => 4, 'category' => 'Kepatuhan', 'completed_rate' => 0.7],
                ['count' => 3, 'category' => 'Pemasaran', 'completed_rate' => 0.4],
                ['count' => 4, 'category' => 'Operasional', 'completed_rate' => 0.5],
                ['count' => 2, 'category' => 'Teknologi', 'completed_rate' => 0.3],
            ],
            'light_user' => [
                ['count' => 2, 'category' => 'SDM', 'completed_rate' => 0.5],
                ['count' => 3, 'category' => 'Keuangan', 'completed_rate' => 0.6],
                ['count' => 2, 'category' => 'Kepatuhan', 'completed_rate' => 0.8],
                ['count' => 1, 'category' => 'Operasional', 'completed_rate' => 0.3],
            ],
            'new_user' => [
                ['count' => 1, 'category' => 'SDM', 'completed_rate' => 0.0],
                ['count' => 1, 'category' => 'Keuangan', 'completed_rate' => 0.0],
                ['count' => 1, 'category' => 'Kepatuhan', 'completed_rate' => 0.0],
            ],
            'compliance_focused' => [
                ['count' => 3, 'category' => 'SDM', 'completed_rate' => 0.5],
                ['count' => 4, 'category' => 'Keuangan', 'completed_rate' => 0.6],
                ['count' => 12, 'category' => 'Kepatuhan', 'completed_rate' => 0.85],
                ['count' => 2, 'category' => 'Operasional', 'completed_rate' => 0.4],
            ],
            'finance_focused' => [
                ['count' => 2, 'category' => 'SDM', 'completed_rate' => 0.3],
                ['count' => 15, 'category' => 'Keuangan', 'completed_rate' => 0.75],
                ['count' => 3, 'category' => 'Kepatuhan', 'completed_rate' => 0.7],
                ['count' => 2, 'category' => 'Operasional', 'completed_rate' => 0.4],
            ],
            'tech_focused' => [
                ['count' => 2, 'category' => 'SDM', 'completed_rate' => 0.4],
                ['count' => 3, 'category' => 'Keuangan', 'completed_rate' => 0.5],
                ['count' => 2, 'category' => 'Kepatuhan', 'completed_rate' => 0.6],
                ['count' => 1, 'category' => 'Pemasaran', 'completed_rate' => 0.3],
                ['count' => 10, 'category' => 'Teknologi', 'completed_rate' => 0.7],
            ],
            'inactive' => [
                ['count' => 1, 'category' => 'SDM', 'completed_rate' => 0.0],
                ['count' => 1, 'category' => 'Keuangan', 'completed_rate' => 0.0],
            ],
            'marketing_focused' => [
                ['count' => 2, 'category' => 'SDM', 'completed_rate' => 0.4],
                ['count' => 3, 'category' => 'Keuangan', 'completed_rate' => 0.5],
                ['count' => 2, 'category' => 'Kepatuhan', 'completed_rate' => 0.6],
                ['count' => 12, 'category' => 'Pemasaran', 'completed_rate' => 0.7],
                ['count' => 2, 'category' => 'Operasional', 'completed_rate' => 0.4],
            ],
            'sdm_focused' => [
                ['count' => 15, 'category' => 'SDM', 'completed_rate' => 0.75],
                ['count' => 3, 'category' => 'Keuangan', 'completed_rate' => 0.5],
                ['count' => 3, 'category' => 'Kepatuhan', 'completed_rate' => 0.6],
                ['count' => 2, 'category' => 'Operasional', 'completed_rate' => 0.4],
            ],
            'operational' => [
                ['count' => 2, 'category' => 'SDM', 'completed_rate' => 0.4],
                ['count' => 3, 'category' => 'Keuangan', 'completed_rate' => 0.5],
                ['count' => 2, 'category' => 'Kepatuhan', 'completed_rate' => 0.6],
                ['count' => 12, 'category' => 'Operasional', 'completed_rate' => 0.7],
            ],
            default => [
                ['count' => 3, 'category' => 'SDM', 'completed_rate' => 0.4],
                ['count' => 3, 'category' => 'Keuangan', 'completed_rate' => 0.5],
                ['count' => 2, 'category' => 'Kepatuhan', 'completed_rate' => 0.6],
            ],
        };
    }

    /**
     * Create tasks with specific configuration.
     */
    private function createTasksWithConfig(User $user, array $config): void
    {
        $taskTemplates = $this->getTaskTemplates($config['category']);

        for ($i = 0; $i < $config['count']; $i++) {
            $template = $taskTemplates[$i % count($taskTemplates)];
            $completed = rand(1, 100) / 100 <= $config['completed_rate'];

            // Determine if this task has a target/limit
            $hasLimit = rand(1, 10) <= 3; // 30% chance of having a limit
            $targetValue = $hasLimit ? rand(10, 100) : null;
            $currentValue = $hasLimit ? ($completed ? $targetValue : rand(0, (int) ($targetValue * 0.7))) : 0;

            $taskData = [
                'user_id' => $user->id,
                'text' => $template['text'],
                'category' => $config['category'],
                'completed' => $completed,
                'progress' => $completed ? 100 : ($hasLimit && $targetValue > 0 ? (int) (($currentValue / $targetValue) * 100) : 0),
                'has_limit' => $hasLimit,
                'current_value' => $currentValue,
                'reset_cycle' => $template['cycle'] ?? null,
                'per_check_enabled' => $hasLimit && rand(1, 2) === 1,
            ];

            // Only add these fields if they have values
            if ($hasLimit) {
                $taskData['target_value'] = $targetValue;
                $taskData['unit'] = $template['unit'] ?? 'kali';
                $taskData['increment_value'] = 1;
            }

            $task = Task::create($taskData);

            // Create history entries for completed tasks
            if ($completed || ($hasLimit && $currentValue > 0)) {
                $this->createTaskHistory($task, $hasLimit ? $currentValue : 1);
            }
        }
    }

    /**
     * Get task templates for each category.
     */
    private function getTaskTemplates(string $category): array
    {
        return match ($category) {
            'SDM' => [
                ['text' => 'Review penilaian kinerja karyawan bulanan'],
                ['text' => 'Update database karyawan dan data kehadiran'],
                ['text' => 'Siapkan materi pelatihan syariah untuk tim'],
                ['text' => 'Evaluasi kompensasi dan benefit karyawan'],
                ['text' => 'Rekrutmen staf kepatuhan syariah baru'],
                ['text' => 'Buat SOP onboarding karyawan baru'],
                ['text' => 'Analisis kebutuhan pengembangan SDM'],
                ['text' => 'Review kontrak kerja yang akan berakhir'],
                ['text' => 'Koordinasi jadwal cuti karyawan'],
                ['text' => 'Siapkan laporan HR bulanan'],
            ],
            'Keuangan' => [
                ['text' => 'Hitung dan setor zakat profesi bulanan'],
                ['text' => 'Rekonsiliasi akun bank syariah'],
                ['text' => 'Buat laporan keuangan syariah bulanan'],
                ['text' => 'Review dan approval pembayaran vendor'],
                ['text' => 'Monitoring cash flow dan proyeksi'],
                ['text' => 'Evaluasi portofolio investasi halal'],
                ['text' => 'Audit internal sistem keuangan'],
                ['text' => 'Siapkan dokumen pajak bulanan'],
                ['text' => 'Analisis profit margin per produk'],
                ['text' => 'Review penggunaan dana operasional'],
                ['text' => 'Hitung bagi hasil deposito mudharabah'],
                ['text' => 'Evaluasi kinerja reksadana syariah'],
                ['text' => 'Buat proyeksi anggaran tahun depan'],
                ['text' => 'Review neraca bulanan'],
                ['text' => 'Koordinasi dengan DPS untuk audit keuangan'],
            ],
            'Kepatuhan' => [
                ['text' => 'Review produk baru untuk kesesuaian syariah'],
                ['text' => 'Audit kepatuhan syariah internal'],
                ['text' => 'Update manual prosedur syariah'],
                ['text' => 'Koordinasi meeting bulanan dengan DPS'],
                ['text' => 'Review kontrak akad murabahah'],
                ['text' => 'Verifikasi sertifikasi halal supplier'],
                ['text' => 'Evaluasi penerapan prinsip syariah'],
                ['text' => 'Buat laporan kepatuhan triwulanan'],
                ['text' => 'Review dokumen akad ijarah'],
                ['text' => 'Training kepatuhan syariah untuk staf'],
                ['text' => 'Audit dokumen transaksi harian'],
                ['text' => 'Review dan update fatwa DSN-MUI'],
            ],
            'Pemasaran' => [
                ['text' => 'Buat konten edukasi keuangan syariah'],
                ['text' => 'Analisis kampanye marketing bulanan'],
                ['text' => 'Review materi promosi produk halal'],
                ['text' => 'Koordinasi dengan agency marketing'],
                ['text' => 'Update website dan social media'],
                ['text' => 'Analisis customer journey'],
                ['text' => 'Buat proposal kerjasama mitra'],
                ['text' => 'Review feedback pelanggan'],
                ['text' => 'Siapkan materi event Islamic finance'],
                ['text' => 'Analisis kompetitor produk syariah'],
                ['text' => 'Optimasi SEO konten syariah'],
                ['text' => 'Buat newsletter bulanan nasabah'],
            ],
            'Operasional' => [
                ['text' => 'Review SOP operasional harian'],
                ['text' => 'Monitoring kinerja sistem core banking'],
                ['text' => 'Koordinasi tim operasional cabang'],
                ['text' => 'Update prosedur layanan nasabah'],
                ['text' => 'Evaluasi SLA layanan pelanggan'],
                ['text' => 'Review kapasitas dan resource sistem'],
                ['text' => 'Analisis bottleneck operasional'],
                ['text' => 'Buat laporan operasional mingguan'],
                ['text' => 'Koordinasi maintenance sistem'],
                ['text' => 'Review backup dan recovery procedure'],
                ['text' => 'Evaluasi vendor operasional'],
                ['text' => 'Update dokumentasi proses bisnis'],
            ],
            'Teknologi' => [
                ['text' => 'Review security audit sistem'],
                ['text' => 'Update aplikasi mobile banking'],
                ['text' => 'Monitoring server uptime dan performa'],
                ['text' => 'Review dan patch vulnerability'],
                ['text' => 'Koordinasi dengan vendor IT'],
                ['text' => 'Update API dokumentasi'],
                ['text' => 'Review backup database'],
                ['text' => 'Testing fitur baru sistem'],
                ['text' => 'Optimasi query database'],
                ['text' => 'Review log aktivitas sistem'],
            ],
            default => [
                ['text' => 'Review tugas harian'],
                ['text' => 'Update laporan mingguan'],
                ['text' => 'Koordinasi dengan tim'],
            ],
        };
    }

    /**
     * Create task history entries.
     */
    private function createTaskHistory(Task $task, int $entries): void
    {
        for ($i = 0; $i < min($entries, 5); $i++) {
            TaskHistory::create([
                'task_id' => $task->id,
                'value' => rand(1, 3),
                'note' => rand(1, 3) === 1 ? 'Progress update otomatis' : null,
                'timestamp' => now()->subDays(rand(1, 30)),
            ]);
        }
    }
}
