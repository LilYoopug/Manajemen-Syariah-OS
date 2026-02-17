/**
 * Islamic Source API Service
 * Direct calls to EQuran.id and Gading Hadith APIs from frontend
 */

// ============ Types ============

export interface Surah {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
}

export interface Ayat {
  nomorAyat: number;
  teksArab: string;
  teksIndonesia: string;
}

export interface SurahDetail {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
  ayat: Ayat[];
}

export interface Verse {
  surah_number: number;
  surah_name: string;
  surah_name_arabic: string;
  verse_number: number;
  arabic: string;
  translation: string;
}

export interface HadithBook {
  name: string;
  id: string;
  available: number;
}

export interface Hadith {
  book: string;
  book_name: string;
  number: number;
  arabic: string;
  translation: string;
}

// ============ Cache ============

const CACHE_KEY_SURAHS = 'islamic_surahs';
const CACHE_KEY_HADITH_BOOKS = 'islamic_hadith_books';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in ms

function getCached<T>(key: string): T | null {
  try {
    const cached = localStorage.getItem(key);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

function setCache<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {
    // ignore
  }
}

// ============ API Functions ============

export const islamicApi = {
  // ============ Quran (EQuran.id API v2) ============

  async getSurahs(): Promise<Surah[]> {
    // Check cache first
    const cached = getCached<Surah[]>(CACHE_KEY_SURAHS);
    if (cached) return cached;

    const response = await fetch('https://equran.id/api/v2/surat');
    const data = await response.json();
    const surahs = data.data || [];

    // Cache the result
    setCache(CACHE_KEY_SURAHS, surahs);
    return surahs;
  },

  async getSurah(number: number): Promise<SurahDetail | null> {
    const response = await fetch(`https://equran.id/api/v2/surat/${number}`);
    const data = await response.json();
    return data.data || null;
  },

  async getVerse(surah: number, verse: number): Promise<Verse | null> {
    const surahData = await this.getSurah(surah);
    if (!surahData || !surahData.ayat) return null;

    const ayat = surahData.ayat.find((a) => a.nomorAyat === verse);
    if (!ayat) return null;

    return {
      surah_number: surah,
      surah_name: surahData.namaLatin,
      surah_name_arabic: surahData.nama,
      verse_number: verse,
      arabic: ayat.teksArab,
      translation: ayat.teksIndonesia,
    };
  },

  // ============ Hadith (Gading.dev API) ============

  async getHadithBooks(): Promise<HadithBook[]> {
    // Check cache first
    const cached = getCached<HadithBook[]>(CACHE_KEY_HADITH_BOOKS);
    if (cached) return cached;

    const response = await fetch('https://api.hadith.gading.dev/books');
    const data = await response.json();
    const books = data.data || [];

    // Cache the result
    setCache(CACHE_KEY_HADITH_BOOKS, books);
    return books;
  },

  async getHadith(book: string, number: number): Promise<Hadith | null> {
    const response = await fetch(`https://api.hadith.gading.dev/books/${book}/${number}`);
    const json = await response.json();

    // API response structure: { code: 200, data: { name: "...", contents: { number, arab, id } } }
    if (!json.data?.contents) return null;

    return {
      book: book,
      book_name: json.data.name || book,
      number: number,
      arabic: json.data.contents.arab || '',
      translation: json.data.contents.id || '', // Indonesian translation is in 'id' field
    };
  },
};

export default islamicApi;
