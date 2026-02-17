<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiProxyService
{
    protected string $apiKey;
    protected string $apiUrl;
    protected int $timeout;
    protected string $model;

    /**
     * Create a new AiProxyService instance.
     */
    public function __construct()
    {
        $this->apiKey = config('services.gemini.api_key', '');
        $this->apiUrl = config('services.gemini.api_url', 'https://generativelanguage.googleapis.com/v1beta/models');
        $this->timeout = config('services.gemini.timeout', 30);
        $this->model = config('services.gemini.model', 'gemini-2.5-flash');
    }

    /**
     * Send a chat message to the Gemini API.
     *
     * @param string $message
     * @return array
     * @throws \Exception
     */
    public function chat(string $message): array
    {
        if (empty($this->apiKey)) {
            throw new \Exception('AI service is not configured');
        }

        try {
            $response = Http::timeout($this->timeout)
                ->withHeaders([
                    'x-goog-api-key' => $this->apiKey,
                    'Content-Type' => 'application/json',
                ])
                ->post("{$this->apiUrl}/{$this->model}:generateContent", [
                    'contents' => [
                        [
                            'parts' => [
                                ['text' => $message],
                            ],
                        ],
                    ],
                ]);

            if (!$response->successful()) {
                Log::error('Gemini API error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                throw new \Exception('AI service returned an error');
            }

            $data = $response->json();

            return [
                'reply' => $data['candidates'][0]['content']['parts'][0]['text'] ?? '',
            ];
        } catch (ConnectionException $e) {
            Log::error('Gemini API connection error', [
                'message' => $e->getMessage(),
            ]);
            throw new \Exception('AI service is temporarily unavailable');
        }
    }

    /**
     * Generate a strategic plan based on user goals.
     *
     * @param string $goals
     * @param string|null $context
     * @return array
     * @throws \Exception
     */
    public function generatePlan(string $goals, ?string $context = null): array
    {
        if (empty($this->apiKey)) {
            throw new \Exception('AI service is not configured');
        }

        $prompt = $this->buildPlanPrompt($goals, $context);

        try {
            $response = Http::timeout($this->timeout)
                ->withHeaders([
                    'x-goog-api-key' => $this->apiKey,
                    'Content-Type' => 'application/json',
                ])
                ->post("{$this->apiUrl}/{$this->model}:generateContent", [
                    'contents' => [
                        ['parts' => [['text' => $prompt]]],
                    ],
                    'generationConfig' => [
                        'responseMimeType' => 'application/json',
                    ],
                ]);

            if (!$response->successful()) {
                Log::error('Gemini API error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                throw new \Exception('AI service returned an error');
            }

            $data = $response->json();
            $text = $data['candidates'][0]['content']['parts'][0]['text'] ?? '';
            
            // Strip markdown code blocks if present
            $text = $this->stripMarkdownCodeBlock($text);

            return [
                'plan' => $text,
            ];
        } catch (ConnectionException $e) {
            Log::error('Gemini API connection error', ['message' => $e->getMessage()]);
            throw new \Exception('AI service is temporarily unavailable');
        }
    }

    /**
     * Generate insights based on KPI data.
     *
     * @param array $kpiData
     * @return array
     * @throws \Exception
     */
    public function insight(array $kpiData): array
    {
        if (empty($this->apiKey)) {
            throw new \Exception('AI service is not configured');
        }

        $prompt = $this->buildInsightPrompt($kpiData);

        try {
            $response = Http::timeout($this->timeout)
                ->withHeaders([
                    'x-goog-api-key' => $this->apiKey,
                    'Content-Type' => 'application/json',
                ])
                ->post("{$this->apiUrl}/{$this->model}:generateContent", [
                    'contents' => [
                        ['parts' => [['text' => $prompt]]],
                    ],
                ]);

            if (!$response->successful()) {
                Log::error('Gemini API error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                throw new \Exception('AI service returned an error');
            }

            $data = $response->json();
            return [
                'insight' => $data['candidates'][0]['content']['parts'][0]['text'] ?? '',
            ];
        } catch (ConnectionException $e) {
            Log::error('Gemini API connection error', ['message' => $e->getMessage()]);
            throw new \Exception('AI service is temporarily unavailable');
        }
    }

    /**
     * Build the plan generation prompt.
     *
     * @param string $goals
     * @param string|null $context
     * @return string
     */
    protected function buildPlanPrompt(string $goals, ?string $context = null): string
    {
        $contextText = $context ? "\n\nKonteks tambahan:\n{$context}" : '';
        return "Anda adalah konsultan strategis Manajemen Syariah. Buat rencana strategis POAC Islami (Planning, Organizing, Actuating, Controlling) untuk:\n\n{$goals}{$contextText}\n\nPENTING:\n1. Maqasid Syariah harus SINGKAT (maksimal 2-3 kalimat)\n2. Berikan 5-7 suggestedTasks yang konkret dan bisa langsung ditambahkan ke daftar tugas pengguna\n3. Setiap tugas harus jelas, actionable, dan relevan dengan tujuan\n4. Category WAJIB salah satu dari: SDM, Bisnis, Keuangan, Sosial, Kepatuhan, atau Umum\n5. Untuk tugas yang membutuhkan target angka (seperti target penjualan, target dana, dll), isi:\n   - hasLimit: true\n   - targetValue: angka target\n   - unit: satuan (Rp, kg, orang, dll)\n   - perCheckEnabled: true jika ingin tracking progres\n   - incrementValue: jumlah penambahan per klik\n6. resetCycle: one-time (sekali), daily (harian), weekly (mingguan), monthly (bulanan), yearly (tahunan)\n\nFormat JSON yang diharapkan:\n{\n  \"title\": \"Judul Rencana Strategis\",\n  \"summary\": \"Ringkasan singkat rencana (maksimal 2 kalimat)\",\n  \"phases\": [\n    {\n      \"name\": \"Planning (Takhthith)\",\n      \"description\": \"Deskripsi singkat fase\",\n      \"actions\": [\"Langkah 1\", \"Langkah 2\", \"Langkah 3\"]\n    },\n    {\n      \"name\": \"Organizing (Tanzhim)\",\n      \"description\": \"Deskripsi singkat fase\",\n      \"actions\": [\"Langkah 1\", \"Langkah 2\"]\n    },\n    {\n      \"name\": \"Actuating (Tawjih)\",\n      \"description\": \"Deskripsi singkat fase\",\n      \"actions\": [\"Langkah 1\", \"Langkah 2\"]\n    },\n    {\n      \"name\": \"Controlling (Riqabah)\",\n      \"description\": \"Deskripsi singkat fase\",\n      \"actions\": [\"Langkah 1\", \"Langkah 2\"]\n    }\n  ],\n  \"maqasidSyariah\": \"Penjelasan singkat (maksimal 2-3 kalimat) bagaimana rencana ini selaras dengan prinsip Maqasid Syariah: menjaga agama, jiwa, akal, keturunan, dan harta.\",\n  \"suggestedTasks\": [\n    {\n      \"title\": \"Nama tugas yang direkomendasikan\",\n      \"description\": \"Deskripsi singkat tugas\",\n      \"priority\": \"high\",\n      \"category\": \"Keuangan\",\n      \"resetCycle\": \"monthly\",\n      \"hasLimit\": true,\n      \"targetValue\": 5000000,\n      \"unit\": \"Rp\",\n      \"incrementValue\": 50000,\n      \"perCheckEnabled\": true\n    }\n  ]\n}\n\nWAJIB kembalikan JSON valid tanpa teks tambahan.";
    }

    /**
     * Strip markdown code block formatting from response.
     *
     * @param string $text
     * @return string
     */
    protected function stripMarkdownCodeBlock(string $text): string
    {
        // Remove markdown code blocks: ```json ... ``` or ``` ... ```
        $text = preg_replace('/^```(?:json)?\s*/i', '', trim($text));
        $text = preg_replace('/\s*```$/i', '', $text);
        return trim($text);
    }

    /**
     * Build the insight generation prompt.
     *
     * @param array $kpiData
     * @return string
     */
    protected function buildInsightPrompt(array $kpiData): string
    {
        $kpiJson = json_encode($kpiData, JSON_PRETTY_PRINT);
        return "You are an Islamic business analytics advisor. Analyze the following KPI and performance data and provide insights:\n\n{$kpiJson}\n\nProvide actionable insights for improving Islamic business compliance and performance.";
    }
}
