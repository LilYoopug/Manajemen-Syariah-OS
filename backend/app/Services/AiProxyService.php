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
}
