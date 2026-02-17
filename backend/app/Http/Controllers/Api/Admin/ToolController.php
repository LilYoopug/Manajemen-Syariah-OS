<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreToolRequest;
use App\Http\Requests\Admin\UpdateToolRequest;
use App\Http\Resources\ToolResource;
use App\Models\Tool;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ToolController extends Controller
{
    protected ActivityLogService $activityLogService;

    /**
     * Create a new ToolController instance.
     */
    public function __construct(ActivityLogService $activityLogService)
    {
        $this->activityLogService = $activityLogService;
    }

    /**
     * Get all tools.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $tools = Tool::orderBy('created_at', 'desc')->get();

        return response()->json([
            'data' => ToolResource::collection($tools),
        ]);
    }

    /**
     * Create a new tool.
     *
     * @param StoreToolRequest $request
     * @return JsonResponse
     */
    public function store(StoreToolRequest $request): JsonResponse
    {
        $tool = Tool::create($request->validated());

        $this->activityLogService->logAdmin('admin.tool_created', $tool);

        return (new ToolResource($tool))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Update an existing tool.
     *
     * @param UpdateToolRequest $request
     * @param Tool $tool
     * @return JsonResponse
     */
    public function update(UpdateToolRequest $request, Tool $tool): JsonResponse
    {
        $tool->update($request->validated());

        $this->activityLogService->logAdmin('admin.tool_updated', $tool);

        return (new ToolResource($tool))
            ->response()
            ->setStatusCode(200);
    }

    /**
     * Delete a tool.
     *
     * @param Tool $tool
     * @return JsonResponse
     */
    public function destroy(Tool $tool): JsonResponse
    {
        $this->activityLogService->logAdmin('admin.tool_deleted', $tool);

        $tool->delete();

        return response()->json([
            'message' => 'Tool deleted successfully.',
        ]);
    }

    /**
     * Export tools to PDF or XLSX format.
     *
     * @param Request $request
     * @return StreamedResponse
     */
    public function export(Request $request): StreamedResponse
    {
        $format = $request->get('format', 'xlsx');

        $tools = Tool::orderBy('created_at', 'desc')->get();

        $timestamp = now()->format('Y_m_d_His');

        if ($format === 'pdf') {
            return $this->exportPdf($tools, $timestamp);
        }

        return $this->exportXlsx($tools, $timestamp);
    }

    /**
     * Export tools as CSV (Excel compatible).
     */
    private function exportXlsx($tools, string $timestamp): StreamedResponse
    {
        $filename = "tools_export_{$timestamp}.csv";

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        return response()->streamDownload(function () use ($tools) {
            $handle = fopen('php://output', 'w');

            // BOM for UTF-8
            fprintf($handle, chr(0xEF) . chr(0xBB) . chr(0xBF));

            // Summary header
            fputcsv($handle, ['=== LAPORAN KATALOG TOOLS SYARIAHOS ===']);
            fputcsv($handle, ['Tanggal Export', now()->format('d/m/Y H:i:s')]);
            fputcsv($handle, ['Total Tools', $tools->count()]);
            fputcsv($handle, []);

            // Category breakdown
            $categories = $tools->groupBy('category');
            fputcsv($handle, ['=== DISTRIBUSI KATEGORI ===']);
            foreach ($categories as $category => $categoryTools) {
                fputcsv($handle, [$category ?: 'Tanpa Kategori', $categoryTools->count() . ' tools']);
            }
            fputcsv($handle, []);

            // Tools table
            fputcsv($handle, ['=== DAFTAR TOOLS ===']);
            fputcsv($handle, [
                'ID', 'Nama', 'Kategori', 'Deskripsi', 'Link',
                'Inputs', 'Outputs', 'Manfaat', 'Landasan Syariah',
                'Dalil', 'Sumber Dalil', 'Tanggal Dibuat'
            ]);

            foreach ($tools as $tool) {
                fputcsv($handle, [
                    $tool->id,
                    $tool->name,
                    $tool->category,
                    $tool->description,
                    $tool->link ?: '-',
                    is_array($tool->inputs) ? implode(', ', $tool->inputs) : ($tool->inputs ?: '-'),
                    is_array($tool->outputs) ? implode(', ', $tool->outputs) : ($tool->outputs ?: '-'),
                    is_array($tool->benefits) ? implode(', ', $tool->benefits) : ($tool->benefits ?: '-'),
                    $tool->sharia_basis ?: '-',
                    $tool->related_dalil_text ?: '-',
                    $tool->related_dalil_source ?: '-',
                    $tool->created_at ? $tool->created_at->format('d/m/Y H:i') : '-',
                ]);
            }

            fclose($handle);
        }, $filename, $headers);
    }

    /**
     * Export tools as HTML (PDF printable).
     */
    private function exportPdf($tools, string $timestamp): StreamedResponse
    {
        $filename = "tools_export_{$timestamp}.html";

        // Category breakdown for stats
        $categories = $tools->groupBy('category');

        return response()->streamDownload(function () use ($tools, $categories) {
            echo '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Laporan Katalog Tools - SyariahOS</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; max-width: 1200px; margin: 0 auto; }
        h1 { color: #4F46E5; margin-bottom: 10px; border-bottom: 3px solid #4F46E5; padding-bottom: 10px; }
        h2 { color: #4F46E5; margin-top: 30px; margin-bottom: 15px; }
        .summary-box { background: #EEF2FF; border: 1px solid #C7D2FE; border-radius: 8px; padding: 15px; margin: 20px 0; }
        .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
        .summary-item { text-align: center; padding: 10px; background: white; border-radius: 6px; }
        .summary-value { font-size: 24px; font-weight: bold; color: #4F46E5; }
        .summary-label { font-size: 12px; color: #6B7280; margin-top: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; }
        th { background: #4F46E5; color: white; padding: 10px 6px; text-align: left; }
        td { padding: 8px 6px; border-bottom: 1px solid #E5E7EB; vertical-align: top; }
        tr:nth-child(even) { background: #F9FAFB; }
        .category-badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; background: #DBEAFE; color: #1E40AF; }
        .link { color: #2563EB; text-decoration: none; }
        .footer { margin-top: 40px; font-size: 11px; color: #6B7280; text-align: center; border-top: 1px solid #E5E7EB; padding-top: 20px; }
        @media print { body { padding: 10px; } }
    </style>
</head>
<body>
    <h1>Laporan Katalog Tools SyariahOS</h1>
    <p style="color: #6B7280;">Tanggal Export: ' . now()->format('d/m/Y H:i:s') . '</p>

    <div class="summary-box">
        <h2 style="margin-top: 0;">Ringkasan</h2>
        <div class="summary-grid">
            <div class="summary-item">
                <div class="summary-value">' . $tools->count() . '</div>
                <div class="summary-label">Total Tools</div>
            </div>
            <div class="summary-item">
                <div class="summary-value">' . $categories->count() . '</div>
                <div class="summary-label">Kategori</div>
            </div>
            <div class="summary-item">
                <div class="summary-value">' . $tools->whereNotNull('link')->count() . '</div>
                <div class="summary-label">Dengan Link</div>
            </div>
            <div class="summary-item">
                <div class="summary-value">' . $tools->whereNotNull('sharia_basis')->count() . '</div>
                <div class="summary-label">Dengan Landasan Syariah</div>
            </div>
        </div>
    </div>

    <h2>Distribusi Kategori</h2>
    <table>
        <thead>
            <tr>
                <th>Kategori</th>
                <th>Jumlah Tools</th>
            </tr>
        </thead>
        <tbody>';
            foreach ($categories as $category => $categoryTools) {
                echo '<tr>';
                echo '<td><strong>' . htmlspecialchars($category ?: 'Tanpa Kategori') . '</strong></td>';
                echo '<td>' . $categoryTools->count() . '</td>';
                echo '</tr>';
            }
            echo '        </tbody>
    </table>

    <h2>Daftar Lengkap Tools</h2>
    <table>
        <thead>
            <tr>
                <th>Nama</th>
                <th>Kategori</th>
                <th>Deskripsi</th>
                <th>Manfaat</th>
                <th>Landasan Syariah</th>
                <th>Link</th>
            </tr>
        </thead>
        <tbody>';
            foreach ($tools as $tool) {
                echo '<tr>';
                echo '<td><strong>' . htmlspecialchars($tool->name) . '</strong></td>';
                echo '<td><span class="category-badge">' . htmlspecialchars($tool->category ?: '-') . '</span></td>';
                echo '<td>' . htmlspecialchars($tool->description ?: '-') . '</td>';
                $benefits = is_array($tool->benefits) ? implode(', ', $tool->benefits) : $tool->benefits;
                echo '<td>' . htmlspecialchars($benefits ?: '-') . '</td>';
                echo '<td>' . htmlspecialchars($tool->sharia_basis ?: '-') . '</td>';
                echo '<td>' . ($tool->link ? '<a href="' . htmlspecialchars($tool->link) . '" class="link">Buka</a>' : '-') . '</td>';
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

