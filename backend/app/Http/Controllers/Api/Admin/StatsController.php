<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ActivityLogResource;
use App\Models\User;
use App\Models\Task;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class StatsController extends Controller
{
    /**
     * Get platform-wide statistics.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        // Total registered users
        $totalUsers = User::count();

        // Total tasks across all users
        $totalTasks = Task::count();

        // Total completed tasks
        $completedTasks = Task::where('completed', true)->count();

        // Active users (logged in within last 30 days)
        $activeUsers = User::whereHas('activityLogs', function ($query) {
            $query->where('action', 'user.login')
                  ->where('created_at', '>=', now()->subDays(30));
        })->count();

        // Recent activity (last 10 entries)
        $recentActivity = ActivityLog::with('user')
            ->latest('created_at')
            ->take(10)
            ->get();

        $stats = [
            'totalUsers' => $totalUsers,
            'totalTasks' => $totalTasks,
            'completedTasks' => $completedTasks,
            'activeUsers' => $activeUsers,
            'recentActivity' => ActivityLogResource::collection($recentActivity),
        ];

        return response()->json([
            'data' => $stats,
        ]);
    }


    /**
     * Get user growth statistics for the last 6 months.
     *
     * @return JsonResponse
     */
    public function userGrowth(): JsonResponse
    {
        $monthlyData = [];
        $currentDate = now();

        for ($i = 5; $i >= 0; $i--) {
            $month = $currentDate->copy()->subMonths($i);
            $monthStart = $month->copy()->startOfMonth();
            $monthEnd = $month->copy()->endOfMonth();

            // New users in this month
            $newUsers = User::whereBetween('created_at', [$monthStart, $monthEnd])->count();

            // Total users up to end of this month
            $totalUsers = User::where('created_at', '<=', $monthEnd)->count();

            // Active users in this month
            $activeUsers = User::whereHas('activityLogs', function ($query) use ($monthStart, $monthEnd) {
                $query->where('action', 'user.login')
                      ->whereBetween('created_at', [$monthStart, $monthEnd]);
            })->count();

            $monthlyData[] = [
                'month' => $month->format('M'),
                'monthFull' => $month->format('F Y'),
                'newUsers' => $newUsers,
                'totalUsers' => $totalUsers,
                'activeUsers' => $activeUsers,
            ];
        }

        // Calculate growth rate (percentage change from previous month)
        foreach ($monthlyData as $i => &$data) {
            if ($i > 0 && $monthlyData[$i - 1]['totalUsers'] > 0) {
                $previousTotal = $monthlyData[$i - 1]['totalUsers'];
                $currentTotal = $data['totalUsers'];
                $data['growthRate'] = round((($currentTotal - $previousTotal) / $previousTotal) * 100, 1);
            } else {
                $data['growthRate'] = 0;
            }
        }
        unset($data);

        // Calculate summary stats
        $totalNewUsers = array_sum(array_column($monthlyData, 'newUsers'));
        $avgGrowthRate = count($monthlyData) > 1 
            ? round(array_sum(array_column($monthlyData, 'growthRate')) / (count($monthlyData) - 1), 1)
            : 0;
        $currentActiveUsers = end($monthlyData)['activeUsers'];

        return response()->json([
            'data' => [
                'monthly' => $monthlyData,
                'summary' => [
                    'totalNewUsers' => $totalNewUsers,
                    'avgGrowthRate' => $avgGrowthRate,
                    'activeUsers' => $currentActiveUsers,
                ],
            ],
        ]);
    }
    /**
     * Export dashboard statistics to PDF or XLSX format.
     *
     * @param Request $request
     * @return StreamedResponse
     */
    public function export(Request $request): StreamedResponse
    {
        $format = $request->get('format', 'xlsx');

        // Gather all stats
        $totalUsers = User::count();
        $totalTasks = Task::count();
        $completedTasks = Task::where('completed', true)->count();
        $activeUsers = User::whereHas('activityLogs', function ($query) {
            $query->where('action', 'user.login')
                  ->where('created_at', '>=', now()->subDays(30));
        })->count();
        $recentActivity = ActivityLog::with('user')
            ->latest('created_at')
            ->take(50)
            ->get();

        $timestamp = now()->format('Y_m_d_His');

        if ($format === 'pdf') {
            return $this->exportPdf($totalUsers, $totalTasks, $completedTasks, $activeUsers, $recentActivity, $timestamp);
        }

        return $this->exportXlsx($totalUsers, $totalTasks, $completedTasks, $activeUsers, $recentActivity, $timestamp);
    }

    /**
     * Export dashboard stats as CSV (Excel compatible).
     */
    private function exportXlsx($totalUsers, $totalTasks, $completedTasks, $activeUsers, $recentActivity, string $timestamp): StreamedResponse
    {
        $filename = "dashboard_stats_{$timestamp}.csv";

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        return response()->streamDownload(function () use ($totalUsers, $totalTasks, $completedTasks, $activeUsers, $recentActivity) {
            $handle = fopen('php://output', 'w');

            // BOM for UTF-8
            fprintf($handle, chr(0xEF) . chr(0xBB) . chr(0xBF));

            // Summary header
            fputcsv($handle, ['=== LAPORAN DASHBOARD ADMIN SYARIAHOS ===']);
            fputcsv($handle, ['Tanggal Export', now()->format('d/m/Y H:i:s')]);
            fputcsv($handle, []);

            // Statistics summary
            fputcsv($handle, ['=== STATISTIK PLATFORM ===']);
            fputcsv($handle, ['Total Pengguna Terdaftar', $totalUsers]);
            fputcsv($handle, ['Total Tugas', $totalTasks]);
            fputcsv($handle, ['Tugas Selesai', $completedTasks]);
            fputcsv($handle, ['Tugas Belum Selesai', $totalTasks - $completedTasks]);
            fputcsv($handle, ['Tingkat Penyelesaian', $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100, 1) . '%' : '0%']);
            fputcsv($handle, ['User Aktif (30 hari terakhir)', $activeUsers]);
            fputcsv($handle, []);

            // Recent activity
            fputcsv($handle, ['=== LOG AKTIVITAS TERKINI ===']);
            fputcsv($handle, ['ID', 'Waktu', 'User', 'Aksi', 'Deskripsi']);

            foreach ($recentActivity as $log) {
                fputcsv($handle, [
                    $log->id,
                    $log->created_at ? $log->created_at->format('d/m/Y H:i') : '-',
                    $log->user?->name ?? 'Sistem',
                    $log->action,
                    $log->description ?? '-',
                ]);
            }

            fclose($handle);
        }, $filename, $headers);
    }

    /**
     * Export dashboard stats as HTML (PDF printable).
     */
    private function exportPdf($totalUsers, $totalTasks, $completedTasks, $activeUsers, $recentActivity, string $timestamp): StreamedResponse
    {
        $filename = "dashboard_stats_{$timestamp}.html";
        $completionRate = $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100, 1) : 0;

        return response()->streamDownload(function () use ($totalUsers, $totalTasks, $completedTasks, $activeUsers, $recentActivity, $completionRate) {
            echo '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Laporan Dashboard Admin - SyariahOS</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; max-width: 1200px; margin: 0 auto; }
        h1 { color: #4F46E5; margin-bottom: 10px; border-bottom: 3px solid #4F46E5; padding-bottom: 10px; }
        h2 { color: #4F46E5; margin-top: 30px; margin-bottom: 15px; }
        .summary-box { background: #EEF2FF; border: 1px solid #C7D2FE; border-radius: 8px; padding: 15px; margin: 20px 0; }
        .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
        .summary-item { text-align: center; padding: 10px; background: white; border-radius: 6px; }
        .summary-value { font-size: 24px; font-weight: bold; color: #4F46E5; }
        .summary-label { font-size: 12px; color: #6B7280; margin-top: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
        th { background: #4F46E5; color: white; padding: 10px 8px; text-align: left; }
        td { padding: 8px; border-bottom: 1px solid #E5E7EB; }
        tr:nth-child(even) { background: #F9FAFB; }
        .footer { margin-top: 40px; font-size: 11px; color: #6B7280; text-align: center; border-top: 1px solid #E5E7EB; padding-top: 20px; }
        @media print { body { padding: 10px; } }
    </style>
</head>
<body>
    <h1>Laporan Dashboard Admin SyariahOS</h1>
    <p style="color: #6B7280;">Tanggal Export: ' . now()->format('d/m/Y H:i:s') . '</p>

    <div class="summary-box">
        <h2 style="margin-top: 0;">Ringkasan Statistik</h2>
        <div class="summary-grid">
            <div class="summary-item">
                <div class="summary-value">' . $totalUsers . '</div>
                <div class="summary-label">Total Pengguna</div>
            </div>
            <div class="summary-item">
                <div class="summary-value">' . $totalTasks . '</div>
                <div class="summary-label">Total Tugas</div>
            </div>
            <div class="summary-item">
                <div class="summary-value">' . $activeUsers . '</div>
                <div class="summary-label">User Aktif</div>
            </div>
            <div class="summary-item">
                <div class="summary-value">' . $completionRate . '%</div>
                <div class="summary-label">Tingkat Penyelesaian</div>
            </div>
        </div>
    </div>

    <h2>Detail Tugas</h2>
    <table>
        <tr><td><strong>Total Tugas</strong></td><td>' . $totalTasks . '</td></tr>
        <tr><td><strong>Tugas Selesai</strong></td><td>' . $completedTasks . '</td></tr>
        <tr><td><strong>Tugas Belum Selesai</strong></td><td>' . ($totalTasks - $completedTasks) . '</td></tr>
    </table>

    <h2>Log Aktivitas Terkini</h2>
    <table>
        <thead>
            <tr>
                <th>Waktu</th>
                <th>User</th>
                <th>Aksi</th>
                <th>Deskripsi</th>
            </tr>
        </thead>
        <tbody>';
            foreach ($recentActivity as $log) {
                echo '<tr>';
                echo '<td>' . ($log->created_at ? $log->created_at->format('d/m/Y H:i') : '-') . '</td>';
                echo '<td>' . htmlspecialchars($log->user?->name ?? 'Sistem') . '</td>';
                echo '<td>' . htmlspecialchars($log->action) . '</td>';
                echo '<td>' . htmlspecialchars($log->description ?? '-') . '</td>';
                echo '</tr>';
            }
            echo '        </tbody>
    </table>

    <div class="footer">
        <p>Laporan ini dibuat secara otomatis oleh SyariahOS Admin Panel</p>
    </div>
</body>
</html>';
        }, $filename, [
            'Content-Type' => 'text/html; charset=UTF-8',
        ]);
    }
}
