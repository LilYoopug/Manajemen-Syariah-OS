<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class UserController extends Controller
{
    protected ActivityLogService $activityLogService;

    /**
     * Create a new UserController instance.
     */
    public function __construct(ActivityLogService $activityLogService)
    {
        $this->activityLogService = $activityLogService;
    }

    /**
     * Get list of users with optional search.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::query();

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'data' => UserResource::collection($users),
        ]);
    }

    /**
     * Create a new user.
     *
     * @param StoreUserRequest $request
     * @return JsonResponse
     */
    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = User::create($request->validated());

        $this->activityLogService->logAdmin('admin.user_created', $user);

        return (new UserResource($user))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Update an existing user.
     *
     * @param UpdateUserRequest $request
     * @param User $user
     * @return JsonResponse
     */
    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $user->update($request->validated());

        $this->activityLogService->logAdmin('admin.user_updated', $user);

        return (new UserResource($user))
            ->response()
            ->setStatusCode(200);
    }

    /**
     * Delete a user and all their data.
     *
     * @param User $user
     * @return JsonResponse
     */
    public function destroy(User $user): JsonResponse
    {
        // Check if this is the last admin
        if ($user->role === 'admin') {
            $adminCount = User::where('role', 'admin')->count();
            if ($adminCount <= 1) {
                return response()->json([
                    'message' => 'Tidak dapat menghapus admin terakhir. Sistem harus memiliki minimal 1 admin.',
                ], 422);
            }
        }

        $this->activityLogService->logAdmin('admin.user_deleted', $user);

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully.',
        ]);
    }

    /**
     * Export all users as PDF or XLSX with detailed task data.
     *
     * @param Request $request
     * @return StreamedResponse
     */
    public function export(Request $request): StreamedResponse
    {
        $format = $request->get('format', 'xlsx');

        // Load users with their tasks and task history
        $users = User::with(['tasks' => function ($query) {
            $query->with('history')->orderBy('created_at', 'desc');
        }])->orderBy('created_at', 'desc')->get();

        $timestamp = now()->format('Y_m_d_His');

        if ($format === 'pdf') {
            return $this->exportPdf($users, $timestamp);
        }

        return $this->exportXlsx($users, $timestamp);
    }

    /**
     * Get reset cycle label in Indonesian.
     */
    private function getResetCycleLabel(?string $cycle): string
    {
        return match ($cycle) {
            'one-time' => 'Sekali',
            'daily' => 'Harian',
            'weekly' => 'Mingguan',
            'monthly' => 'Bulanan',
            'yearly' => 'Tahunan',
            default => 'Sekali',
        };
    }

    /**
     * Export users as CSV (Excel compatible) with detailed task data.
     */
    private function exportXlsx($users, string $timestamp): StreamedResponse
    {
        $filename = "users_detail_export_{$timestamp}.csv";

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        return response()->streamDownload(function () use ($users) {
            $handle = fopen('php://output', 'w');

            // BOM for UTF-8
            fprintf($handle, chr(0xEF) . chr(0xBB) . chr(0xBF));

            // Summary header
            fputcsv($handle, ['=== LAPORAN DATA PENGGUNA SYARIKHOS ===']);
            fputcsv($handle, ['Tanggal Export', now()->format('d/m/Y H:i:s')]);
            fputcsv($handle, ['Total Pengguna', $users->count()]);
            fputcsv($handle, []);

            // Summary statistics
            $totalTasks = $users->sum(fn($u) => $u->tasks->count());
            $completedTasks = $users->sum(fn($u) => $u->tasks->where('completed', true)->count());
            $completionRate = $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100, 1) : 0;

            fputcsv($handle, ['=== RINGKASAN STATISTIK ===']);
            fputcsv($handle, ['Total Tugas', $totalTasks]);
            fputcsv($handle, ['Tugas Selesai', $completedTasks]);
            fputcsv($handle, ['Tugas Belum Selesai', $totalTasks - $completedTasks]);
            fputcsv($handle, ['Tingkat Penyelesaian', $completionRate . '%']);
            fputcsv($handle, []);

            // User summary table
            fputcsv($handle, ['=== DAFTAR PENGGUNA ===']);
            fputcsv($handle, [
                'ID', 'Nama', 'Email', 'Role', 'Theme',
                'Total Tugas', 'Tugas Selesai', 'Tugas Belum Selesai', 'Tingkat Penyelesaian (%)',
                'Tanggal Daftar', 'Terakhir Update'
            ]);

            foreach ($users as $user) {
                $totalUserTasks = $user->tasks->count();
                $completedUserTasks = $user->tasks->where('completed', true)->count();
                $userCompletionRate = $totalUserTasks > 0 ? round(($completedUserTasks / $totalUserTasks) * 100, 1) : 0;

                fputcsv($handle, [
                    $user->id,
                    $user->name,
                    $user->email,
                    $user->role,
                    $user->theme ?? 'light',
                    $totalUserTasks,
                    $completedUserTasks,
                    $totalUserTasks - $completedUserTasks,
                    $userCompletionRate,
                    $user->created_at?->format('d/m/Y H:i'),
                    $user->updated_at?->format('d/m/Y H:i'),
                ]);
            }

            fputcsv($handle, []);

            // Detailed task data per user
            fputcsv($handle, ['=== DETAIL TUGAS PER PENGGUNA ===']);

            foreach ($users as $user) {
                if ($user->tasks->isEmpty()) {
                    continue;
                }

                fputcsv($handle, []);
                fputcsv($handle, ['PENGGUNA: ' . $user->name . ' (' . $user->email . ')']);
                fputcsv($handle, [
                    'Task ID', 'Nama Tugas', 'Kategori', 'Status',
                    'Periode', 'Target Aktif', 'Target', 'Progres Saat Ini', 'Satuan', 'Persentase',
                    'Dibuat', 'Terakhir Update'
                ]);

                foreach ($user->tasks as $task) {
                    $percentage = $task->has_limit && $task->target_value > 0
                        ? round(($task->current_value / $task->target_value) * 100, 1)
                        : 0;

                    fputcsv($handle, [
                        $task->id,
                        $task->text,
                        $task->category ?? 'Umum',
                        $task->completed ? 'SELESAI' : 'BELUM SELESAI',
                        $this->getResetCycleLabel($task->reset_cycle),
                        $task->has_limit ? 'YA' : 'TIDAK',
                        $task->target_value ?? '-',
                        $task->current_value ?? 0,
                        $task->unit ?? '-',
                        $task->has_limit ? $percentage . '%' : '-',
                        $task->created_at?->format('d/m/Y H:i'),
                        $task->updated_at?->format('d/m/Y H:i'),
                    ]);
                }

                // Task history per user
                $tasksWithHistory = $user->tasks->filter(fn($t) => $t->history->isNotEmpty());
                if ($tasksWithHistory->isNotEmpty()) {
                    fputcsv($handle, []);
                    fputcsv($handle, ['RIWAYAT PROGRES:']);
                    fputcsv($handle, ['Task ID', 'Nama Tugas', 'Nilai', 'Catatan', 'Waktu']);

                    foreach ($tasksWithHistory as $task) {
                        foreach ($task->history as $history) {
                            fputcsv($handle, [
                                $task->id,
                                $task->text,
                                $history->value,
                                $history->note ?? '-',
                                $history->timestamp?->format('d/m/Y H:i'),
                            ]);
                        }
                    }
                }
            }

            fputcsv($handle, []);
            fputcsv($handle, ['=== AKHIR LAPORAN ===']);
            fputcsv($handle, ['Dokumen ini digenerate oleh sistem SyariahOS']);

            fclose($handle);
        }, $filename, $headers);
    }

    /**
     * Export users as PDF (HTML-based) with detailed task data.
     */
    private function exportPdf($users, string $timestamp): StreamedResponse
    {
        $filename = "users_detail_export_{$timestamp}.html";

        return response()->streamDownload(function () use ($users) {
            // Calculate summary statistics
            $totalTasks = $users->sum(fn($u) => $u->tasks->count());
            $completedTasks = $users->sum(fn($u) => $u->tasks->where('completed', true)->count());
            $completionRate = $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100, 1) : 0;

            echo '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Laporan Data Pengguna - SyariahOS</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; max-width: 1200px; margin: 0 auto; }
        h1 { color: #4F46E5; margin-bottom: 10px; border-bottom: 3px solid #4F46E5; padding-bottom: 10px; }
        h2 { color: #4F46E5; margin-top: 30px; margin-bottom: 15px; }
        h3 { color: #374151; margin-top: 25px; margin-bottom: 10px; }
        .summary-box { background: #EEF2FF; border: 1px solid #C7D2FE; border-radius: 8px; padding: 15px; margin: 20px 0; }
        .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
        .summary-item { text-align: center; padding: 10px; background: white; border-radius: 6px; }
        .summary-value { font-size: 24px; font-weight: bold; color: #4F46E5; }
        .summary-label { font-size: 12px; color: #6B7280; margin-top: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
        th { background: #4F46E5; color: white; padding: 10px 8px; text-align: left; }
        td { padding: 8px; border-bottom: 1px solid #E5E7EB; }
        tr:nth-child(even) { background: #F9FAFB; }
        .status-complete { color: #059669; font-weight: bold; }
        .status-pending { color: #DC2626; }
        .user-section { margin-top: 30px; padding: 20px; background: #F9FAFB; border-radius: 8px; border: 1px solid #E5E7EB; }
        .user-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .user-name { font-size: 16px; font-weight: bold; color: #1F2937; }
        .user-email { color: #6B7280; font-size: 12px; }
        .badge { padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; }
        .badge-admin { background: #FEF3C7; color: #92400E; }
        .badge-user { background: #DBEAFE; color: #1E40AF; }
        .progress-bar { height: 8px; background: #E5E7EB; border-radius: 4px; overflow: hidden; }
        .progress-fill { height: 100%; background: #4F46E5; border-radius: 4px; }
        .footer { margin-top: 40px; font-size: 11px; color: #6B7280; text-align: center; border-top: 1px solid #E5E7EB; padding-top: 20px; }
        .no-tasks { color: #9CA3AF; font-style: italic; padding: 20px; text-align: center; }
        @media print { body { padding: 10px; } .user-section { break-inside: avoid; } }
    </style>
</head>
<body>
    <h1>Laporan Data Pengguna SyariahOS</h1>
    <p style="color: #6B7280;">Tanggal Export: ' . now()->format('d/m/Y H:i:s') . '</p>

    <div class="summary-box">
        <h2 style="margin-top: 0;">Ringkasan Statistik</h2>
        <div class="summary-grid">
            <div class="summary-item">
                <div class="summary-value">' . $users->count() . '</div>
                <div class="summary-label">Total Pengguna</div>
            </div>
            <div class="summary-item">
                <div class="summary-value">' . $totalTasks . '</div>
                <div class="summary-label">Total Tugas</div>
            </div>
            <div class="summary-item">
                <div class="summary-value">' . $completedTasks . '</div>
                <div class="summary-label">Tugas Selesai</div>
            </div>
            <div class="summary-item">
                <div class="summary-value">' . $completionRate . '%</div>
                <div class="summary-label">Tingkat Penyelesaian</div>
            </div>
        </div>
    </div>

    <h2>Daftar Pengguna</h2>
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Nama</th>
                <th>Email</th>
                <th>Role</th>
                <th>Total Tugas</th>
                <th>Selesai</th>
                <th>Progres</th>
                <th>Terdaftar</th>
            </tr>
        </thead>
        <tbody>';

            foreach ($users as $user) {
                $totalUserTasks = $user->tasks->count();
                $completedUserTasks = $user->tasks->where('completed', true)->count();
                $userCompletionRate = $totalUserTasks > 0 ? round(($completedUserTasks / $totalUserTasks) * 100, 0) : 0;

                echo '<tr>
                <td>' . $user->id . '</td>
                <td>' . htmlspecialchars($user->name) . '</td>
                <td>' . htmlspecialchars($user->email) . '</td>
                <td><span class="badge ' . ($user->role === 'admin' ? 'badge-admin' : 'badge-user') . '">' . strtoupper($user->role) . '</span></td>
                <td>' . $totalUserTasks . '</td>
                <td>' . $completedUserTasks . '</td>
                <td>
                    <div class="progress-bar" style="width: 60px;">
                        <div class="progress-fill" style="width: ' . $userCompletionRate . '%;"></div>
                    </div>
                    <span style="font-size: 10px; color: #6B7280;">' . $userCompletionRate . '%</span>
                </td>
                <td>' . ($user->created_at?->format('d/m/Y') ?? '-') . '</td>
            </tr>';
            }

            echo '</tbody>
    </table>

    <h2>Detail Tugas Per Pengguna</h2>';

            foreach ($users as $user) {
                $totalUserTasks = $user->tasks->count();
                $completedUserTasks = $user->tasks->where('completed', true)->count();
                $userCompletionRate = $totalUserTasks > 0 ? round(($completedUserTasks / $totalUserTasks) * 100, 0) : 0;

                echo '<div class="user-section">
                <div class="user-header">
                    <div>
                        <div class="user-name">' . htmlspecialchars($user->name) . '</div>
                        <div class="user-email">' . htmlspecialchars($user->email) . '</div>
                    </div>
                    <div style="text-align: right;">
                        <span class="badge ' . ($user->role === 'admin' ? 'badge-admin' : 'badge-user') . '">' . strtoupper($user->role) . '</span>
                        <div style="margin-top: 5px; font-size: 12px;">' . $completedUserTasks . '/' . $totalUserTasks . ' tugas (' . $userCompletionRate . '%)</div>
                    </div>
                </div>';

                if ($user->tasks->isEmpty()) {
                    echo '<div class="no-tasks">Tidak ada tugas</div>';
                } else {
                    echo '<table>
                    <thead>
                        <tr>
                            <th>Nama Tugas</th>
                            <th>Kategori</th>
                            <th>Periode</th>
                            <th>Target</th>
                            <th>Progres</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>';

                    foreach ($user->tasks as $task) {
                        $percentage = $task->has_limit && $task->target_value > 0
                            ? round(($task->current_value / $task->target_value) * 100, 0)
                            : 0;

                        echo '<tr>
                        <td>' . htmlspecialchars($task->text) . '</td>
                        <td>' . htmlspecialchars($task->category ?? 'Umum') . '</td>
                        <td>' . $this->getResetCycleLabel($task->reset_cycle) . '</td>
                        <td>' . ($task->has_limit ? ($task->current_value . '/' . $task->target_value . ' ' . ($task->unit ?? '')) : '-') . '</td>
                        <td>' . ($task->has_limit ? $percentage . '%' : '-') . '</td>
                        <td class="' . ($task->completed ? 'status-complete' : 'status-pending') . '">' . ($task->completed ? '✓ Selesai' : 'Belum Selesai') . '</td>
                    </tr>';
                    }

                    echo '</tbody>
                    </table>';
                }

                echo '</div>';
            }

            echo '<div class="footer">
        <p>Dokumen ini digenerate oleh sistem SyariahOS</p>
        <p>© ' . date('Y') . ' SyariahOS - Sistem Manajemen Amanah</p>
    </div>
</body>
</html>';
        }, $filename, [
            'Content-Type' => 'text/html; charset=UTF-8',
        ]);
    }
}
