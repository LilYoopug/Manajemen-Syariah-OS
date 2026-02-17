
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  DashboardIcon, ToolsIcon, DirectoryIcon, XMarkIcon,
  ChevronRightIcon, ChevronDownIcon, WandSparklesIcon,
  Cog6ToothIcon, ArrowLeftOnRectangleIcon, UsersIcon,
  BriefcaseIcon, TrashIcon, PlusCircleIcon, PencilIcon, CheckIcon,
  ClipboardListIcon, PlusIcon, EyeIcon, PencilSquareIcon
} from '@/components/common/Icons';
import { Skeleton } from '@/components/common/Skeleton';
import { islamicApi, Surah, HadithBook, Verse, Hadith } from '@/lib/api-islamic';
import { directoryApi } from '@/lib/api-directory';
import type { DirectoryItem, View, Source, QuranSource, HadithSource, WebsiteSource } from '@/types';
import ModalPortal from '@/components/common/ModalPortal';
import ConfirmModal, { type ConfirmModalType } from '@/components/common/ConfirmModal';

interface SidebarProps {
  view: View;
  setView: (view: View) => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  onSelectItem: (item: DirectoryItem) => void;
  directoryData: DirectoryItem[];
  setDirectoryData: React.Dispatch<React.SetStateAction<DirectoryItem[]>>;
  isDirectoryLoading?: boolean;
  onRefreshDirectory: () => Promise<void>;
  userRole?: string;
  onLogout: () => void;
}

// ============ Source Form Component ============

interface SourceFormProps {
  source: Source;
  onChange: (source: Source) => void;
  onRemove: () => void;
  surahs: Surah[];
  hadithBooks: HadithBook[];
}

const SourceForm: React.FC<SourceFormProps> = ({ source, onChange, onRemove, surahs, hadithBooks }) => {
  const [selectedSurah, setSelectedSurah] = useState<string>(
    source.type === 'quran' ? String(source.surah) : ''
  );
  const [verseCount, setVerseCount] = useState<number>(0);

  // Preview states
  const [verseData, setVerseData] = useState<Verse | null>(null);
  const [hadithData, setHadithData] = useState<Hadith | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  useEffect(() => {
    if (source.type === 'quran' && selectedSurah) {
      const surah = surahs.find((s) => s.nomor === parseInt(selectedSurah));
      if (surah) {
        setVerseCount(surah.jumlahAyat);
      }
    }
  }, [selectedSurah, surahs, source.type]);

  // Fetch Quran verse preview
  useEffect(() => {
    if (source.type === 'quran' && source.surah && source.verse) {
      setIsLoadingPreview(true);
      setPreviewError(null);
      islamicApi.getVerse(source.surah, source.verse)
        .then(data => {
          if (data) {
            setVerseData(data);
          } else {
            setPreviewError('Ayat tidak ditemukan');
          }
        })
        .catch(() => setPreviewError('Gagal memuat ayat'))
        .finally(() => setIsLoadingPreview(false));
    }
  }, [source.type, source.surah, source.verse]);

  // Fetch Hadith preview
  useEffect(() => {
    if (source.type === 'hadith' && source.book && source.number) {
      setIsLoadingPreview(true);
      setPreviewError(null);
      islamicApi.getHadith(source.book, source.number)
        .then(data => {
          if (data) {
            setHadithData(data);
          } else {
            setPreviewError('Hadist tidak ditemukan');
          }
        })
        .catch(() => setPreviewError('Gagal memuat hadist'))
        .finally(() => setIsLoadingPreview(false));
    }
  }, [source.type, source.book, source.number]);

  const handleTypeChange = (type: string) => {
    setVerseData(null);
    setHadithData(null);
    setPreviewError(null);
    switch (type) {
      case 'quran':
        onChange({ type: 'quran', surah: 1, verse: 1 });
        break;
      case 'hadith':
        onChange({ type: 'hadith', book: 'bukhari', number: 1 });
        break;
      case 'website':
        onChange({ type: 'website', title: '', url: '' });
        break;
      case 'none':
        onChange({ type: 'none' });
        break;
    }
  };

  return (
    <div className="p-3 bg-gray-100 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <select
          value={source.type}
          onChange={(e) => handleTypeChange(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
        >
          <option value="none">Tanpa Sumber</option>
          <option value="quran">Quran</option>
          <option value="hadith">Hadist</option>
          <option value="website">Website</option>
        </select>
        <button
          type="button"
          onClick={onRemove}
          className="p-1 text-red-500 hover:text-red-600 dark:hover:text-red-400"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>

      {source.type === 'quran' && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">
                Surah
              </label>
              <select
                value={selectedSurah}
                onChange={(e) => {
                  setSelectedSurah(e.target.value);
                  const surah = surahs.find((s) => s.nomor === parseInt(e.target.value));
                  if (surah) {
                    setVerseCount(surah.jumlahAyat);
                    onChange({ ...source, surah: parseInt(e.target.value), verse: 1 });
                  }
                }}
                className="w-full px-2 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                <option value="">Pilih Surah</option>
                {surahs.map((surah) => (
                  <option key={surah.nomor} value={surah.nomor}>
                    {surah.nomor}. {surah.namaLatin}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">
                Ayat (1-{verseCount})
              </label>
              <input
                type="number"
                min={1}
                max={verseCount}
                value={source.verse}
                onChange={(e) => onChange({ ...source, verse: parseInt(e.target.value) || 1 })}
                className="w-full px-2 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                placeholder="1"
              />
            </div>
          </div>

          {/* Quran Preview */}
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Preview</div>
            {isLoadingPreview ? (
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ) : previewError ? (
              <p className="text-xs text-red-500 italic">{previewError}</p>
            ) : verseData ? (
              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <p className="text-sm text-right font-serif text-gray-800 dark:text-gray-200 leading-relaxed">
                  {verseData.arabic}
                </p>
                <p className="text-[10px] text-gray-600 dark:text-gray-400 italic mt-1 line-clamp-2">
                  "{verseData.translation}"
                </p>
              </div>
            ) : null}
          </div>
        </>
      )}

      {source.type === 'hadith' && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">
                Kitab
              </label>
              <select
                value={source.book}
                onChange={(e) => onChange({ ...source, book: e.target.value })}
                className="w-full px-2 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                {hadithBooks.map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">
                Nomor
              </label>
              <input
                type="number"
                min={1}
                value={source.number}
                onChange={(e) => onChange({ ...source, number: parseInt(e.target.value) || 1 })}
                className="w-full px-2 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                placeholder="1"
              />
            </div>
          </div>

          {/* Hadith Preview */}
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Preview</div>
            {isLoadingPreview ? (
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ) : previewError ? (
              <p className="text-xs text-red-500 italic">{previewError}</p>
            ) : hadithData ? (
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-right font-serif text-gray-800 dark:text-gray-200 leading-relaxed">
                  {hadithData.arabic}
                </p>
                <p className="text-[10px] text-gray-600 dark:text-gray-400 italic mt-1 line-clamp-2">
                  "{hadithData.translation}"
                </p>
              </div>
            ) : null}
          </div>
        </>
      )}

      {source.type === 'website' && (
        <div className="space-y-2">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">
              Judul
            </label>
            <input
              type="text"
              value={source.title}
              onChange={(e) => onChange({ ...source, title: e.target.value })}
              placeholder="Judul website"
              className="w-full px-2 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">
              URL
            </label>
            <input
              type="url"
              value={source.url}
              onChange={(e) => onChange({ ...source, url: e.target.value })}
              placeholder="https://example.com"
              className="w-full px-2 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            />
          </div>

          {/* Website Preview */}
          {(source.title || source.url) && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Preview</div>
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                    Website
                  </span>
                  {source.url ? (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-medium truncate"
                    >
                      {source.title || source.url}
                    </a>
                  ) : (
                    <span className="text-xs text-gray-500 dark:text-gray-400 italic">Belum ada URL</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============ Preview Components ============

interface SourcePreviewProps {
  source: Source;
  surahs: Surah[];
}

const SourcePreviewBadge: React.FC<{ type: string }> = ({ type }) => {
  const badges = {
    quran: { label: 'Quran', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
    hadith: { label: 'Hadist', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
    website: { label: 'Website', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
    none: { label: 'Tanpa Sumber', color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' },
  };
  const badge = badges[type as keyof typeof badges] || badges.none;
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${badge.color}`}>
      {badge.label}
    </span>
  );
};

const QuranSourcePreview: React.FC<{ source: QuranSource; surahs: Surah[] }> = ({ source, surahs }) => {
  const [verseData, setVerseData] = useState<Verse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (source.surah && source.verse) {
      setIsLoading(true);
      setError(null);
      islamicApi.getVerse(source.surah, source.verse)
        .then(data => {
          if (data) {
            setVerseData(data);
          } else {
            setError('Ayat tidak ditemukan');
          }
        })
        .catch(() => setError('Gagal memuat ayat'))
        .finally(() => setIsLoading(false));
    }
  }, [source.surah, source.verse]);

  const surahName = surahs.find(s => s.nomor === source.surah)?.namaLatin || `Surah ${source.surah}`;

  return (
    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500 rounded-r-lg">
      <div className="flex items-center gap-2 mb-2">
        <SourcePreviewBadge type="quran" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          QS. {surahName}: {source.verse}
        </span>
      </div>
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ) : error ? (
        <p className="text-red-500 text-xs italic">{error}</p>
      ) : verseData ? (
        <>
          <p className="text-lg text-right font-serif text-gray-800 dark:text-gray-200 leading-relaxed mb-1">
            {verseData.arabic}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 italic">
            "{verseData.translation}"
          </p>
        </>
      ) : null}
    </div>
  );
};

const HadithSourcePreview: React.FC<{ source: HadithSource }> = ({ source }) => {
  const [hadithData, setHadithData] = useState<Hadith | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (source.book && source.number) {
      setIsLoading(true);
      setError(null);
      islamicApi.getHadith(source.book, source.number)
        .then(data => {
          if (data) {
            setHadithData(data);
          } else {
            setError('Hadist tidak ditemukan');
          }
        })
        .catch(() => setError('Gagal memuat hadist'))
        .finally(() => setIsLoading(false));
    }
  }, [source.book, source.number]);

  return (
    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-r-lg">
      <div className="flex items-center gap-2 mb-2">
        <SourcePreviewBadge type="hadith" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {hadithData?.book_name || source.book} No. {source.number}
        </span>
      </div>
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ) : error ? (
        <p className="text-red-500 text-xs italic">{error}</p>
      ) : hadithData ? (
        <>
          <p className="text-lg text-right font-serif text-gray-800 dark:text-gray-200 leading-relaxed mb-1">
            {hadithData.arabic}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 italic">
            "{hadithData.translation}"
          </p>
        </>
      ) : null}
    </div>
  );
};

const WebsiteSourcePreview: React.FC<{ source: WebsiteSource }> = ({ source }) => (
  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 rounded-r-lg">
    <div className="flex items-center gap-2">
      <SourcePreviewBadge type="website" />
      {source.url ? (
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-purple-600 dark:text-purple-400 hover:underline font-medium"
        >
          {source.title || 'Link'}
        </a>
      ) : (
        <span className="text-sm text-gray-500 dark:text-gray-400 italic">Belum ada URL</span>
      )}
    </div>
    {source.url && (
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
        {source.url}
      </p>
    )}
  </div>
);

const NoneSourcePreview: React.FC = () => (
  <div className="p-3 bg-gray-50 dark:bg-gray-800 border-l-4 border-gray-400 rounded-r-lg">
    <SourcePreviewBadge type="none" />
  </div>
);

const SourcePreview: React.FC<SourcePreviewProps> = ({ source, surahs }) => {
  switch (source.type) {
    case 'quran':
      return <QuranSourcePreview source={source} surahs={surahs} />;
    case 'hadith':
      return <HadithSourcePreview source={source} />;
    case 'website':
      return <WebsiteSourcePreview source={source} />;
    case 'none':
    default:
      return <NoneSourcePreview />;
  }
};

const DirectorySidebarNode: React.FC<{
  item: DirectoryItem;
  level: number;
  onSelectItem: (item: DirectoryItem) => void;
  closeSidebar: () => void;
  allOpen: boolean;
  editMode: boolean;
  onEdit: (item: DirectoryItem) => void;
  onDelete: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onUpdateTitle: (id: string, newTitle: string) => void;
}> = ({ item, level, onSelectItem, closeSidebar, allOpen, editMode, onEdit, onDelete, onAddChild, onUpdateTitle }) => {
  const [isOpen, setIsOpen] = useState(level < 1);
  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(item.title);

  const hasChildren = item.children && item.children.length > 0;

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      setIsOpen(!isOpen);
    } else {
      onSelectItem(item);
      if (!editMode) closeSidebar();
    }
  };

  const handleInlineSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempTitle.trim()) {
      onUpdateTitle(item.id, tempTitle.trim());
      setIsInlineEditing(false);
    }
  };

  const isNodeOpen = allOpen || isOpen;

  return (
    <div>
      <div
        className={`group flex items-center w-full py-1.5 text-sm rounded-lg cursor-pointer transition-colors duration-200 ${!hasChildren ? 'hover:bg-primary-100 dark:hover:bg-gray-700/50' : 'hover:bg-gray-100 dark:hover:bg-gray-800/30'}`}
        style={{ paddingLeft: `${level * 1.25 + 1}rem`, paddingRight: '0.5rem' }}
        onClick={handleSelect}
      >
        <div className="flex items-center flex-grow min-w-0">
          {hasChildren ? (
            isNodeOpen ? <ChevronDownIcon className="w-3.5 h-3.5 mr-2 flex-shrink-0 text-gray-400 dark:text-gray-500" /> : <ChevronRightIcon className="w-3.5 h-3.5 mr-2 flex-shrink-0 text-gray-400 dark:text-gray-500" />
          ) : (
            <span className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
          )}

          {isInlineEditing ? (
            <form onSubmit={handleInlineSave} className="flex items-center flex-1 space-x-1" onClick={e => e.stopPropagation()}>
               <input
                autoFocus
                type="text"
                value={tempTitle}
                onChange={e => setTempTitle(e.target.value)}
                className="flex-1 bg-white dark:bg-gray-800 border-none text-xs p-1 rounded focus:ring-1 focus:ring-primary-500 outline-none h-6"
                placeholder="Masukkan judul"
               />
               <button type="submit" className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded">
                 <CheckIcon className="w-3 h-3" />
               </button>
               <button type="button" onClick={() => { setIsInlineEditing(false); setTempTitle(item.title); }} className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                 <XMarkIcon className="w-3 h-3" />
               </button>
            </form>
          ) : (
            <span className={`truncate ${hasChildren ? 'font-semibold text-gray-700 dark:text-gray-200' : 'text-gray-600 dark:text-gray-400'}`}>
              {item.title}
            </span>
          )}
        </div>

        {editMode && !isInlineEditing && (
          <div className="flex items-center space-x-1 ml-2">
            {hasChildren && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onAddChild(item.id); }}
                className="p-1 text-primary-500 hover:bg-primary-100 dark:hover:bg-primary-900/30 rounded"
                title="Tambah Sub-Wawasan"
              >
                <PlusCircleIcon className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (level === 0) {
                  setIsInlineEditing(true);
                } else {
                  onEdit(item);
                }
              }}
              className="p-1 text-gray-400 hover:text-primary-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              title="Edit"
            >
              <Cog6ToothIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
              className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
              title="Hapus"
            >
              <TrashIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {isNodeOpen && (
        <div className="border-l border-gray-200 dark:border-gray-700 ml-[1.5rem]" style={{ marginLeft: `${level * 1.25 + 1.5}rem` }}>
          {item.children?.map(child => (
            <DirectorySidebarNode
              key={child.id}
              item={child}
              level={level + 1}
              onSelectItem={onSelectItem}
              closeSidebar={closeSidebar}
              allOpen={allOpen}
              editMode={editMode}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
              onUpdateTitle={onUpdateTitle}
            />
          ))}
          {editMode && !hasChildren && (
             <button
                type="button"
                onClick={() => onAddChild(item.id)}
                className="flex items-center w-full py-1 text-[10px] font-bold text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 rounded-lg mt-1 transition-colors"
                style={{ paddingLeft: `1rem` }}
             >
                <PlusCircleIcon className="w-3 h-3 mr-1.5" />
                Tambah Sub-Wawasan
             </button>
          )}
        </div>
      )}
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({
  view, setView, isSidebarOpen, setSidebarOpen, onSelectItem,
  directoryData, setDirectoryData, isDirectoryLoading = false,
  onRefreshDirectory, userRole, onLogout
}) => {
  const [isDirectoryOpen, setDirectoryOpen] = useState(true);
  const [directorySearch, setDirectorySearch] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<DirectoryItem> & { parentId?: string } | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const [isAddingRootInline, setIsAddingRootInline] = useState(false);
  const [newRootTitle, setNewRootTitle] = useState('');

  // Islamic source data
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [hadithBooks, setHadithBooks] = useState<HadithBook[]>([]);
  const [isLoadingSources, setIsLoadingSources] = useState(false);

  // Confirm Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState<ConfirmModalType>('info');
  const [modalAction, setModalAction] = useState<(() => void) | null>(null);
  const [modalShowCancel, setModalShowCancel] = useState(false);

  const showModal = (title: string, message: string, type: ConfirmModalType = 'info', onConfirm?: () => void, showCancel: boolean = false) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalType(type);
    setModalAction(() => onConfirm || null);
    setModalShowCancel(showCancel);
    setModalOpen(true);
  };

  const isAdmin = userRole === 'admin';

  // Load surahs and hadith books when modal opens
  useEffect(() => {
    if (isEditModalOpen) {
      setPreviewMode(false); // Reset preview mode when modal opens
      if (surahs.length === 0) {
        setIsLoadingSources(true);
        Promise.all([islamicApi.getSurahs(), islamicApi.getHadithBooks()])
          .then(([surahsData, booksData]) => {
            setSurahs(surahsData);
            setHadithBooks(booksData);
          })
          .catch(console.error)
          .finally(() => setIsLoadingSources(false));
      }
    }
  }, [isEditModalOpen, surahs.length]);

  // Helper to check if sources have searchable content
  const sourcesMatch = (sources: Source[] | undefined, query: string): boolean => {
    if (!sources) return false;
    return sources.some(source => {
      if (source.type === 'quran') {
        return source.arabic?.toLowerCase().includes(query) ||
               source.translation?.toLowerCase().includes(query) ||
               source.surah_name?.toLowerCase().includes(query);
      }
      if (source.type === 'hadith') {
        return source.arabic?.toLowerCase().includes(query) ||
               source.translation?.toLowerCase().includes(query) ||
               source.book_name?.toLowerCase().includes(query);
      }
      if (source.type === 'website') {
        return source.title?.toLowerCase().includes(query) ||
               source.url?.toLowerCase().includes(query);
      }
      return false;
    });
  };

  const filteredDirectoryData = useMemo(() => {
    if (!directorySearch) {
      return directoryData;
    }

    const lowercasedQuery = directorySearch.toLowerCase();

    const filter = (items: DirectoryItem[]): DirectoryItem[] => {
      return items.reduce<DirectoryItem[]>((acc, item) => {
        const titleMatch = item.title.toLowerCase().includes(lowercasedQuery);
        const explanationMatch = item.explanation?.toLowerCase().includes(lowercasedQuery);
        const sourcesMatchQuery = sourcesMatch(item.sources, lowercasedQuery);

        const selfMatch = titleMatch || explanationMatch || sourcesMatchQuery;

        let children: DirectoryItem[] = [];
        if (item.children) {
          children = filter(item.children);
        }

        if (selfMatch || children.length > 0) {
          acc.push({ ...item, children });
        }

        return acc;
      }, []);
    };

    return filter(directoryData);
  }, [directorySearch, directoryData]);

  const handleLogout = () => {
    showModal(
      'Keluar',
      'Apakah Anda yakin ingin keluar?',
      'confirm',
      () => {
        onLogout();
        setSidebarOpen(false);
      },
      true
    );
  };

  const handleEditItem = (item: DirectoryItem) => {
    setEditingItem({
      ...item,
      sources: item.sources || [{ type: 'none' }],
    });
    setEditModalOpen(true);
  };

  const handleUpdateTitle = (id: string, newTitle: string) => {
    const updateInList = (list: DirectoryItem[]): DirectoryItem[] => {
      return list.map(item => {
        if (item.id === id) {
          return { ...item, title: newTitle };
        }
        if (item.children) {
          return { ...item, children: updateInList(item.children) };
        }
        return item;
      });
    };
    setDirectoryData(prev => updateInList([...prev]));
  };

  const handleDeleteItem = async (id: string) => {
    showModal(
      'Hapus Item Wawasan',
      'Hapus item wawasan ini beserta seluruh isinya?',
      'warning',
      async () => {
        try {
          // Convert string id to number for API
          const numericId = parseInt(id, 10);
          if (!isNaN(numericId)) {
            await directoryApi.delete(numericId);
            await onRefreshDirectory();
          }
        } catch (error) {
          console.error('Failed to delete item:', error);
          showModal('Error', 'Gagal menghapus item', 'error');
        }
      },
      true
    );
  };

  const handleAddChild = (parentId: string) => {
    setEditingItem({
      id: Date.now().toString(),
      title: '',
      parentId,
      sources: [{ type: 'none' }],
      children: []
    });
    setEditModalOpen(true);
  };

  const handleConfirmAddRoot = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newRootTitle.trim()) return;

    try {
      await directoryApi.create({
        title: newRootTitle.trim(),
        type: 'folder',
      });
      await onRefreshDirectory();
      setNewRootTitle('');
      setIsAddingRootInline(false);
    } catch (error) {
      console.error('Failed to create category:', error);
      showModal('Error', 'Gagal menambah kategori', 'error');
    }
  };

  const addSource = () => {
    if (editingItem) {
      const currentSources = editingItem.sources || [];
      setEditingItem({
        ...editingItem,
        sources: [...currentSources, { type: 'none' }],
      });
    }
  };

  const updateSource = (index: number, source: Source) => {
    if (editingItem) {
      const newSources = [...(editingItem.sources || [])];
      newSources[index] = source;
      setEditingItem({ ...editingItem, sources: newSources });
    }
  };

  const removeSource = (index: number) => {
    if (editingItem && (editingItem.sources?.length || 0) > 1) {
      const newSources = editingItem.sources?.filter((_, i) => i !== index);
      setEditingItem({ ...editingItem, sources: newSources });
    }
  };

  const saveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const itemData = {
        title: editingItem.title || '',
        content: {
          sources: editingItem.sources,
          explanation: editingItem.explanation,
        },
      };

      if (editingItem.parentId) {
        // Creating a new child item
        const numericParentId = parseInt(editingItem.parentId, 10);
        await directoryApi.create({
          title: itemData.title,
          type: 'item',
          parentId: isNaN(numericParentId) ? undefined : numericParentId,
          content: itemData.content,
        });
      } else {
        // Updating existing item
        const numericId = parseInt(editingItem.id as string, 10);
        if (!isNaN(numericId)) {
          await directoryApi.update(numericId, {
            title: itemData.title,
            content: itemData.content,
          });
        }
      }

      await onRefreshDirectory();
      setEditModalOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Failed to save item:', error);
      showModal('Error', 'Gagal menyimpan wawasan', 'error');
    }
  };

  const NavItem = ({ icon, label, name, colorClass }: { icon: React.ElementType; label: string; name: View; colorClass?: string }) => {
    const isActive = view === name;
    return (
      <button
        type="button"
        onClick={() => {
          setView(name);
          setSidebarOpen(false);
        }}
        className={`flex items-center w-full px-4 py-3 text-sm font-medium transition-colors duration-200 rounded-lg ${
          isActive
            ? `${colorClass || 'bg-primary-600'} text-white shadow-lg`
            : 'text-gray-600 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-gray-700'
        }`}
      >
        {React.createElement(icon, { className: "w-6 h-6 mr-3" })}
        <span className="truncate">{label}</span>
      </button>
    );
  };

  return (
    <>
      <div
        className={`fixed inset-0 w-full h-full z-20 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden ${
          isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      ></div>
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-72 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 flex flex-col ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b dark:border-gray-700 h-16">
          <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">SyariahOS</h1>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500 dark:text-gray-400">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto flex flex-col">
          <nav className="p-4 space-y-2 flex-1">
            {isAdmin ? (
                <div className="space-y-1">
                    <p className="px-4 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Admin Control</p>
                    <NavItem icon={DashboardIcon} label="Admin Dashboard" name="admin_dashboard" colorClass="bg-indigo-600" />
                    <NavItem icon={UsersIcon} label="Manajemen User" name="admin_users" colorClass="bg-indigo-600" />
                    <NavItem icon={BriefcaseIcon} label="Manajemen Tools" name="admin_tools" colorClass="bg-indigo-600" />
                </div>
            ) : (
                <div className="space-y-1">
                    <NavItem icon={DashboardIcon} label="Dashboard" name="dashboard" />
                    <NavItem icon={ClipboardListIcon} label="Tugas Amanah" name="tasks" />
                    <NavItem icon={ToolsIcon} label="Katalog Tools" name="tools" />
                    <NavItem icon={WandSparklesIcon} label="AI Generator" name="generator" />

                    <div className="pt-4 pb-2">
                        <hr className="border-gray-200 dark:border-gray-700" />
                    </div>

                    <div className="flex items-center justify-between px-2 mb-1">
                        <button type="button" onClick={() => setDirectoryOpen(!isDirectoryOpen)} className="flex items-center flex-1 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-gray-700 p-2 rounded-lg">
                          <DirectoryIcon className="w-6 h-6 mr-3" />
                          <span className="truncate font-semibold">Directory Wawasan</span>
                          {isDirectoryOpen ? <ChevronDownIcon className="w-4 h-4 ml-auto" /> : <ChevronRightIcon className="w-4 h-4 ml-auto" />}
                        </button>

                        <div className="flex items-center ml-2">
                           <button
                            type="button"
                            onClick={() => {
                              setEditMode(!editMode);
                              setIsAddingRootInline(false);
                            }}
                            className={`p-1.5 rounded-lg transition-all duration-200 ${editMode ? 'bg-primary-600 text-white shadow-sm ring-2 ring-primary-500/20' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300'}`}
                            title={editMode ? "Matikan Mode Edit" : "Aktifkan Mode Edit"}
                           >
                              <PencilIcon className="w-4 h-4" />
                           </button>
                        </div>
                    </div>

                    {isDirectoryOpen && (
                      <div className="mt-2 space-y-1">
                        {isDirectoryLoading ? (
                          <div className="mt-6 space-y-2">
                            <Skeleton className="h-4 w-24 mb-3" />
                            {Array.from({ length: 5 }).map((_, i) => (
                              <div key={i} className="flex items-center space-x-3 p-2 rounded-lg">
                                <Skeleton className="w-4 h-4" />
                                <Skeleton className="h-4 w-40" />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <>
                            <div className="px-2 pb-2">
                                <input
                                    type="text"
                                    placeholder="Cari wawasan..."
                                    value={directorySearch}
                                    onChange={(e) => setDirectorySearch(e.target.value)}
                                    className="w-full px-3 py-1.5 text-sm text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                                />
                            </div>
                            <div className="max-h-[50vh] overflow-y-auto custom-scrollbar">
                                {filteredDirectoryData.map(item => (
                                <DirectorySidebarNode
                                    key={item.id}
                                    item={item}
                                    level={0}
                                    onSelectItem={onSelectItem}
                                    closeSidebar={() => setSidebarOpen(false)}
                                    allOpen={!!directorySearch}
                                    editMode={editMode}
                                    onEdit={handleEditItem}
                                    onDelete={handleDeleteItem}
                                    onAddChild={handleAddChild}
                                    onUpdateTitle={handleUpdateTitle}
                                />
                                ))}
                            </div>

                            {!isDirectoryLoading && editMode && (
                              <div className="mt-2 space-y-2">
                                 {isAddingRootInline ? (
                                   <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-primary-200 dark:border-primary-900/30 animate-fadeIn">
                                     <form onSubmit={handleConfirmAddRoot} className="flex items-center space-x-2">
                                        <input
                                          autoFocus
                                          type="text"
                                          value={newRootTitle}
                                          onChange={(e) => setNewRootTitle(e.target.value)}
                                          placeholder="Judul Directory Utama"
                                          className="flex-1 bg-white dark:bg-gray-800 border-none text-xs p-1.5 rounded focus:ring-1 focus:ring-primary-500 outline-none"
                                        />
                                        <button
                                          type="submit"
                                          className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                                          title="Simpan"
                                        >
                                          <CheckIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => { setIsAddingRootInline(false); setNewRootTitle(''); }}
                                          className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                          title="Batal"
                                        >
                                          <XMarkIcon className="w-4 h-4" />
                                        </button>
                                     </form>
                                   </div>
                                 ) : (
                                   <button
                                     type="button"
                                     onClick={() => setIsAddingRootInline(true)}
                                     className="flex items-center w-full px-4 py-2 text-xs font-bold text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg border border-dashed border-primary-300 dark:border-primary-800 transition-all"
                                   >
                                      <PlusCircleIcon className="w-4 h-4 mr-2" />
                                      Tambah Directory Utama
                                   </button>
                                 )}
                              </div>
                            )}
                          </>
                        )}
                       </div>
                     )}
                </div>
            )}
          </nav>

          <div className="p-4 border-t dark:border-gray-700 space-y-1">
            <NavItem icon={Cog6ToothIcon} label="Pengaturan" name="settings" />
            <button
                type="button"
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
            >
                <ArrowLeftOnRectangleIcon className="w-6 h-6 mr-3" />
                <span>Keluar</span>
            </button>
          </div>
        </div>
      </aside>

      {isEditModalOpen && editingItem && (
        <ModalPortal>
        <div className="fixed inset-0 w-full h-full bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold dark:text-white">
                {editingItem.title && !editingItem.parentId ? 'Edit Wawasan' : 'Tambah Wawasan Baru'}
              </h3>
              <button type="button" onClick={() => setEditModalOpen(false)}>
                <XMarkIcon className="w-6 h-6 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" />
              </button>
            </div>

            {/* Tab Toggle */}
            <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-900 rounded-xl mb-4">
              <button
                type="button"
                onClick={() => setPreviewMode(false)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                  !previewMode
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <PencilSquareIcon className="w-4 h-4" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode(true)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                  previewMode
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <EyeIcon className="w-4 h-4" />
                Preview
              </button>
            </div>

            {isLoadingSources ? (
              <div className="space-y-4 py-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : previewMode ? (
              /* Preview Mode */
              <div className="space-y-4">
                {/* Title Preview */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {editingItem.title || 'Judul Wawasan'}
                  </h2>
                </div>

                {/* Sources Preview */}
                {((editingItem.sources?.length || 0) > 0) && (
                  <div className="space-y-3">
                    {editingItem.sources?.map((source, index) => (
                      <SourcePreview key={index} source={source} surahs={surahs} />
                    ))}
                  </div>
                )}

                {/* Explanation Preview */}
                {editingItem.explanation && editingItem.explanation.trim() !== '' && (
                  <div className="pl-4 border-l-4 border-gray-200 dark:border-gray-600">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Penjelasan
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">
                      {editingItem.explanation}
                    </p>
                  </div>
                )}

                {/* Empty State */}
                {!editingItem.title && (!editingItem.sources || editingItem.sources.every(s => s.type === 'none')) && !editingItem.explanation && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p className="text-sm">Isi form untuk melihat preview</p>
                  </div>
                )}

                {/* Save Button in Preview */}
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={saveItem}
                    className="w-full py-4 bg-primary-600 text-white font-bold rounded-2xl shadow-lg hover:bg-primary-700 transition active:scale-[0.98]"
                  >
                    Simpan Wawasan
                  </button>
                </div>
              </div>
            ) : (
              /* Edit Mode */
              <form onSubmit={saveItem} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Judul Wawasan</label>
                  <input
                    required
                    type="text"
                    value={editingItem.title || ''}
                    onChange={e => setEditingItem({...editingItem, title: e.target.value})}
                    className="w-full p-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none text-sm transition-all"
                    placeholder="Contoh: Amanah dalam Muamalah"
                  />
                </div>

                {/* Sources */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Sumber Wawasan</label>
                    <button
                      type="button"
                      onClick={addSource}
                      className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      <PlusIcon className="w-3 h-3" />
                      Tambah
                    </button>
                  </div>
                  <div className="space-y-3">
                    {(editingItem.sources || [{ type: 'none' }]).map((source, index) => (
                      <SourceForm
                        key={index}
                        source={source}
                        onChange={(s) => updateSource(index, s)}
                        onRemove={() => removeSource(index)}
                        surahs={surahs}
                        hadithBooks={hadithBooks}
                      />
                    ))}
                  </div>
                </div>

                {/* Explanation */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Penjelasan Detail</label>
                  <textarea
                    rows={4}
                    value={editingItem.explanation || ''}
                    onChange={e => setEditingItem({...editingItem, explanation: e.target.value})}
                    className="w-full p-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none text-sm transition-all"
                    placeholder="Jelaskan aplikasi praktis atau makna mendalam wawasan ini..."
                  />
                </div>

                {/* Submit */}
                <div className="pt-4">
                  <button type="submit" className="w-full py-4 bg-primary-600 text-white font-bold rounded-2xl shadow-lg hover:bg-primary-700 transition active:scale-[0.98]">
                    Simpan Wawasan
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
        </ModalPortal>
      )}

      <ConfirmModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={modalAction || undefined}
        title={modalTitle}
        message={modalMessage}
        type={modalType}
        showCancel={modalShowCancel}
        confirmText={modalShowCancel ? 'Ya' : 'OK'}
        cancelText="Batal"
      />
    </>
  );
};

export default Sidebar;
