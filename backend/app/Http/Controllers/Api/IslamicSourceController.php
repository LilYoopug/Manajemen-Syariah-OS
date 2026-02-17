<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\IslamicSourceService;
use Illuminate\Http\JsonResponse;

class IslamicSourceController extends Controller
{
    protected IslamicSourceService $sourceService;

    public function __construct(IslamicSourceService $sourceService)
    {
        $this->sourceService = $sourceService;
    }

    /**
     * Get all Quran surahs.
     *
     * @return JsonResponse
     */
    public function getSurahs(): JsonResponse
    {
        $surahs = $this->sourceService->getSurahs();

        return response()->json([
            'data' => $surahs,
        ]);
    }

    /**
     * Get a specific surah.
     *
     * @param int $number
     * @return JsonResponse
     */
    public function getSurah(int $number): JsonResponse
    {
        $surah = $this->sourceService->getSurah($number);

        if (!$surah) {
            return response()->json([
                'message' => 'Surah not found',
            ], 404);
        }

        return response()->json([
            'data' => $surah,
        ]);
    }

    /**
     * Get a specific verse.
     *
     * @param int $surah
     * @param int $verse
     * @return JsonResponse
     */
    public function getVerse(int $surah, int $verse): JsonResponse
    {
        $verseData = $this->sourceService->getVerse($surah, $verse);

        if (!$verseData) {
            return response()->json([
                'message' => 'Verse not found',
            ], 404);
        }

        return response()->json([
            'data' => $verseData,
        ]);
    }

    /**
     * Get all hadith books.
     *
     * @return JsonResponse
     */
    public function getHadithBooks(): JsonResponse
    {
        $books = $this->sourceService->getHadithBooks();

        return response()->json([
            'data' => $books,
        ]);
    }

    /**
     * Get a specific hadith.
     *
     * @param string $book
     * @param int $number
     * @return JsonResponse
     */
    public function getHadith(string $book, int $number): JsonResponse
    {
        $hadith = $this->sourceService->getHadith($book, $number);

        if (!$hadith) {
            return response()->json([
                'message' => 'Hadith not found',
            ], 404);
        }

        return response()->json([
            'data' => $hadith,
        ]);
    }
}
