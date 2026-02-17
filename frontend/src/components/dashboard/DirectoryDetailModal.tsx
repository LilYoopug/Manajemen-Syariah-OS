import React, { useEffect, useState } from 'react';
import type { DirectoryItem, Source, QuranSource, HadithSource, WebsiteSource } from '@/types';
import { XMarkIcon } from '@/components/common/Icons';
import { islamicApi } from '@/lib/api-islamic';
import ModalPortal from '@/components/common/ModalPortal';

interface DirectoryDetailModalProps {
  item: DirectoryItem;
  onClose: () => void;
}

// ============ Source Display Components ============

const SourceBadge: React.FC<{ type: string }> = ({ type }) => {
  const badges = {
    quran: {
      label: 'Quran',
      color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    },
    hadith: {
      label: 'Hadist',
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    },
    website: {
      label: 'Website',
      color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    },
    none: {
      label: 'Tanpa Sumber',
      color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
    },
  };
  const badge = badges[type as keyof typeof badges] || badges.none;
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${badge.color}`}>{badge.label}</span>
  );
};

const QuranSourceDisplay: React.FC<{ source: QuranSource }> = ({ source }) => {
  const [verseData, setVerseData] = useState<{
    arabic: string;
    translation: string;
    surah_name: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (source.surah && source.verse) {
      setIsLoading(true);
      islamicApi
        .getVerse(source.surah, source.verse)
        .then((data) => {
          if (data) {
            setVerseData({
              arabic: data.arabic,
              translation: data.translation,
              surah_name: data.surah_name,
            });
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [source.surah, source.verse]);

  return (
    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500 rounded-r-lg">
      <div className="flex items-center gap-2 mb-3">
        <SourceBadge type="quran" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          QS. {verseData?.surah_name || `Surah ${source.surah}`}: {source.verse}
        </span>
      </div>
      {isLoading ? (
        <p className="text-gray-500 italic">Memuat ayat...</p>
      ) : (
        <>
          {verseData?.arabic && (
            <p className="text-xl text-right font-serif text-gray-800 dark:text-gray-200 leading-relaxed mb-2">
              {verseData.arabic}
            </p>
          )}
          {verseData?.translation && (
            <p className="text-sm text-gray-600 dark:text-gray-400 italic">
              "{verseData.translation}"
            </p>
          )}
        </>
      )}
    </div>
  );
};

const HadithSourceDisplay: React.FC<{ source: HadithSource }> = ({ source }) => {
  const [hadithData, setHadithData] = useState<{
    arabic: string;
    translation: string;
    book_name: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (source.book && source.number) {
      setIsLoading(true);
      islamicApi
        .getHadith(source.book, source.number)
        .then((data) => {
          if (data) {
            setHadithData({
              arabic: data.arabic,
              translation: data.translation,
              book_name: data.book_name,
            });
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [source.book, source.number]);

  return (
    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-r-lg">
      <div className="flex items-center gap-2 mb-3">
        <SourceBadge type="hadith" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {hadithData?.book_name || source.book} No. {source.number}
        </span>
      </div>
      {isLoading ? (
        <p className="text-gray-500 italic">Memuat hadist...</p>
      ) : (
        <>
          {hadithData?.arabic && (
            <p className="text-xl text-right font-serif text-gray-800 dark:text-gray-200 leading-relaxed mb-2">
              {hadithData.arabic}
            </p>
          )}
          {hadithData?.translation && (
            <p className="text-sm text-gray-600 dark:text-gray-400 italic">
              "{hadithData.translation}"
            </p>
          )}
        </>
      )}
    </div>
  );
};

const WebsiteSourceDisplay: React.FC<{ source: WebsiteSource }> = ({ source }) => (
  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 rounded-r-lg">
    <div className="flex items-center gap-2">
      <SourceBadge type="website" />
      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-purple-600 dark:text-purple-400 hover:underline font-medium"
      >
        {source.title}
      </a>
    </div>
    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{source.url}</p>
  </div>
);

const NoneSourceDisplay: React.FC = () => (
  <div className="p-4 bg-gray-50 dark:bg-gray-800 border-l-4 border-gray-400 rounded-r-lg">
    <SourceBadge type="none" />
  </div>
);

const SourceDisplay: React.FC<{ source: Source }> = ({ source }) => {
  switch (source.type) {
    case 'quran':
      return <QuranSourceDisplay source={source} />;
    case 'hadith':
      return <HadithSourceDisplay source={source} />;
    case 'website':
      return <WebsiteSourceDisplay source={source} />;
    case 'none':
    default:
      return <NoneSourceDisplay />;
  }
};

const DirectoryDetailModal: React.FC<DirectoryDetailModalProps> = ({ item, onClose }) => {
  const hasSources = item.sources && item.sources.length > 0;
  const hasExplanation = item.explanation && item.explanation.trim() !== '';

  if (!hasSources && !hasExplanation) return null;

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 w-full h-full bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-8 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">{item.title}</h2>

          {/* Sources */}
          {hasSources && (
            <div className="space-y-4 mb-6">
              {item.sources?.map((source, index) => (
                <SourceDisplay key={index} source={source} />
              ))}
            </div>
          )}

          {/* Explanation */}
          {hasExplanation && (
            <div className="pl-4 border-l-4 border-gray-200 dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Penjelasan
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {item.explanation}
              </p>
            </div>
          )}
        </div>
      </div>
    </ModalPortal>
  );
};

export default DirectoryDetailModal;
