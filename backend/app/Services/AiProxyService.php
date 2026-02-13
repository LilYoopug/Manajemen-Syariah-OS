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

    /**
     * Create a new AiProxyService instance.
     */
    public function __construct()
    {
        $this->apiKey = config('services.gemini.api_key', '');
        $this->apiUrl = config('services.gemini.api_url', 'https://generativelanguage.googleapis.com/v1beta/models');
        $this->timeout = config('services.gemini.timeout', 30);
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
                ->post("{$this->apiUrl}/gemini-pro:generateContent?key={$this->apiKey}", [
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
     * @param array $goals
     * @return array
     * @throws \Exception
     */
    public function generatePlan(array $goals): array
    {
        if (empty($this->apiKey)) {
            throw new \Exception('AI service is not configured');
        }

        $prompt = $this->buildPlanPrompt($goals);

        try {
            $response = Http::timeout($this->timeout)
                ->post("{$this->apiUrl}/gemini-pro:generateContent?key={$this->apiKey}", [
                    'contents' => [
                        ['parts' => [['text' => $prompt]]],
                    ],
                ]);

            if (!$response->successful()) {
                Log::error('Gemini API error', ['status' => $response->status()]);
                throw new \Exception('AI service returned an error');
            }

            $data = $response->json();
            return [
                'plan' => $data['candidates'][0]['content']['parts'][0]['text'] ?? '',
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
                ->post("{$this->apiUrl}/gemini-pro:generateContent?key={$this->apiKey}", [
                    'contents' => [
                        ['parts' => [['text' => $prompt]]],
                    ],
                ]);

            if (!$response->successful()) {
                Log::error('Gemini API error', ['status' => $response->status()]);
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
     * @param array $goals
     * @return string
     */
    protected function buildPlanPrompt(array $goals): string
    {
        $goalsJson = json_encode($goals, JSON_PRETTY_PRINT);
        return "You are an Islamic business strategy advisor. Generate a strategic plan for the following goals:\n\n{$goalsJson}\n\nProvide a structured plan with actionable steps that align with Islamic business principles (shariah compliance, ethical practices, transparency).";
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
