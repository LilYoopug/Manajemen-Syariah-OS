<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class IslamicSourceService
{
    /**
     * EQuran API base URL
     */
    protected string $quranApiUrl = 'https://equran.id/api/v2';

    /**
     * Gading Hadith API base URL
     */
    protected string $hadithApiUrl = 'https://api.hadith.gading.dev';

    /**
     * Cache duration in seconds (24 hours)
     */
    protected int $cacheDuration = 86400;

    /**
     * SECURITY: Whitelist of valid hadith books to prevent SSRF attacks.
     * Only allow known book names from the hadith API.
     */
    protected array $validHadithBooks = [
        'abu-daud',
        'ahmad',
        'bukhari',
        'darimi',
        'ibnu-majah',
        'malik',
        'muslim',
        'nasai',
        'tirmidzi',
    ];

    /**
     * Get all Quran surahs.
     *
     * @return array
     */
    public function getSurahs(): array
    {
        return Cache::store('file')->remember('quran_surahs', $this->cacheDuration, function () {
            $response = Http::get("{$this->quranApiUrl}/surat");

            if ($response->successful()) {
                $data = $response->json();
                return $data['data'] ?? [];
            }

            return [];
        });
    }

    /**
     * Get a specific surah with all verses.
     *
     * @param int $surahNumber
     * @return array|null
     */
    public function getSurah(int $surahNumber): ?array
    {
        return Cache::store('file')->remember("quran_surah_{$surahNumber}", $this->cacheDuration, function () use ($surahNumber) {
            $response = Http::get("{$this->quranApiUrl}/surat/{$surahNumber}");

            if ($response->successful()) {
                $data = $response->json();
                return $data['data'] ?? null;
            }

            return null;
        });
    }

    /**
     * Get a specific verse from a surah.
     *
     * @param int $surahNumber
     * @param int $verseNumber
     * @return array|null
     */
    public function getVerse(int $surahNumber, int $verseNumber): ?array
    {
        $surah = $this->getSurah($surahNumber);

        if (!$surah || !isset($surah['ayat'])) {
            return null;
        }

        foreach ($surah['ayat'] as $verse) {
            if (isset($verse['nomorAyat']) && $verse['nomorAyat'] === $verseNumber) {
                return [
                    'surah_number' => $surahNumber,
                    'surah_name' => $surah['namaLatin'] ?? $surah['nama'] ?? '',
                    'surah_name_arabic' => $surah['nama'] ?? '',
                    'verse_number' => $verseNumber,
                    'arabic' => $verse['teksArab'] ?? '',
                    'translation' => $verse['teksIndonesia'] ?? '',
                ];
            }
        }

        return null;
    }

    /**
     * Get all available hadith books.
     *
     * @return array
     */
    public function getHadithBooks(): array
    {
        return Cache::store('file')->remember('hadith_books', $this->cacheDuration, function () {
            $response = Http::get("{$this->hadithApiUrl}/books");

            if ($response->successful()) {
                return $response->json() ?? [];
            }

            return [];
        });
    }

    /**
     * Get a specific hadith.
     *
     * @param string $bookName
     * @param int $hadithNumber
     * @return array|null
     */
    public function getHadith(string $bookName, int $hadithNumber): ?array
    {
        // SECURITY: Validate book name against whitelist to prevent SSRF
        if (!in_array($bookName, $this->validHadithBooks, true)) {
            return null;
        }

        return Cache::store('file')->remember("hadith_{$bookName}_{$hadithNumber}", $this->cacheDuration, function () use ($bookName, $hadithNumber) {
            $response = Http::get("{$this->hadithApiUrl}/books/{$bookName}/{$hadithNumber}");

            if ($response->successful()) {
                $data = $response->json();
                if (isset($data['id'])) {
                    return [
                        'book' => $bookName,
                        'book_name' => $data['name'] ?? ucfirst($bookName),
                        'number' => $hadithNumber,
                        'arabic' => $data['arab'] ?? '',
                        'translation' => $data['id'] ?? '',
                    ];
                }
            }

            return null;
        });
    }

    /**
     * Resolve a source reference to its full content.
     *
     * @param array $source
     * @return array
     */
    public function resolveSource(array $source): array
    {
        $resolved = [
            'type' => $source['type'],
        ];

        switch ($source['type']) {
            case 'quran':
                if (isset($source['surah']) && isset($source['verse'])) {
                    $verseData = $this->getVerse($source['surah'], $source['verse']);
                    if ($verseData) {
                        $resolved['surah_number'] = $verseData['surah_number'];
                        $resolved['surah_name'] = $verseData['surah_name'];
                        $resolved['surah_name_arabic'] = $verseData['surah_name_arabic'];
                        $resolved['verse_number'] = $verseData['verse_number'];
                        $resolved['arabic'] = $verseData['arabic'];
                        $resolved['translation'] = $verseData['translation'];
                    }
                }
                break;

            case 'hadith':
                if (isset($source['book']) && isset($source['number'])) {
                    $hadithData = $this->getHadith($source['book'], $source['number']);
                    if ($hadithData) {
                        $resolved['book'] = $hadithData['book'];
                        $resolved['book_name'] = $hadithData['book_name'];
                        $resolved['number'] = $hadithData['number'];
                        $resolved['arabic'] = $hadithData['arabic'];
                        $resolved['translation'] = $hadithData['translation'];
                    }
                }
                break;

            case 'website':
                $resolved['title'] = $source['title'] ?? '';
                $resolved['url'] = $source['url'] ?? '';
                break;

            case 'none':
                // No additional data needed
                break;
        }

        return $resolved;
    }

    /**
     * Resolve all sources for an item.
     *
     * @param array $sources
     * @return array
     */
    public function resolveSources(array $sources): array
    {
        return array_map(fn($source) => $this->resolveSource($source), $sources);
    }
}
