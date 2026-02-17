import React, { useState, useEffect, useCallback } from 'react';
import { directoryApi } from '@/lib/api-directory';
import { islamicApi, Surah, HadithBook } from '@/lib/api-islamic';
import type { DirectoryItem, Source, QuranSource, HadithSource, WebsiteSource } from '@/types/api';
import ModalPortal from '@/components/common/ModalPortal';
import {
  ChevronRightIcon,
  ChevronDownIcon,
  PlusIcon,
  XMarkIcon,
  TrashIcon,
  PencilIcon,
} from '@/components/common/Icons';
import { Skeleton } from '@/components/common/Skeleton';

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

const QuranSourceDisplay: React.FC<{ source: QuranSource }> = ({ source }) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      <SourceBadge type="quran" />
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        QS. {source.surah_name || `Surah ${source.surah}`}: {source.verse}
      </span>
    </div>
    {source.arabic && (
      <p className="text-lg text-right font-serif text-secondary-800 dark:text-secondary-200 leading-relaxed">
        {source.arabic}
      </p>
    )}
    {source.translation && (
      <p className="text-sm text-gray-600 dark:text-gray-400 italic">"{source.translation}"</p>
    )}
  </div>
);

const HadithSourceDisplay: React.FC<{ source: HadithSource }> = ({ source }) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      <SourceBadge type="hadith" />
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {source.book_name || source.book} No. {source.number}
      </span>
    </div>
    {source.arabic && (
      <p className="text-lg text-right font-serif text-secondary-800 dark:text-secondary-200 leading-relaxed">
        {source.arabic}
      </p>
    )}
    {source.translation && (
      <p className="text-sm text-gray-600 dark:text-gray-400 italic">"{source.translation}"</p>
    )}
  </div>
);

const WebsiteSourceDisplay: React.FC<{ source: WebsiteSource }> = ({ source }) => (
  <div className="flex items-center gap-2">
    <SourceBadge type="website" />
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
    >
      {source.title}
    </a>
  </div>
);

const NoneSourceDisplay: React.FC = () => (
  <div className="flex items-center gap-2">
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

// ============ Directory Node Component ============

interface DirectoryNodeProps {
  item: DirectoryItem;
  level: number;
  onEdit?: (item: DirectoryItem) => void;
  onDelete?: (id: number) => void;
  isAdmin?: boolean;
}

const DirectoryNode: React.FC<DirectoryNodeProps> = ({
  item,
  level,
  onEdit,
  onDelete,
  isAdmin,
}) => {
  const [isOpen, setIsOpen] = useState(level < 1);

  const hasChildren = item.children && item.children.length > 0;
  const hasContent = item.sources && item.sources.length > 0;

  return (
    <div>
      <div
        className={`flex items-center p-2 rounded-lg ${hasChildren ? 'hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer' : ''}`}
        style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
        onClick={() => hasChildren && setIsOpen(!isOpen)}
      >
        {hasChildren ? (
          isOpen ? (
            <ChevronDownIcon className="w-4 h-4 mr-2 flex-shrink-0" />
          ) : (
            <ChevronRightIcon className="w-4 h-4 mr-2 flex-shrink-0" />
          )
        ) : (
          <span className="w-4 h-4 mr-2 flex-shrink-0" />
        )}
        <span className="font-semibold text-gray-800 dark:text-gray-200 flex-1">{item.title}</span>
        {isAdmin && !hasChildren && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(item);
              }}
              className="p-1 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(item.id);
              }}
              className="p-1 text-gray-500 hover:text-red-600 dark:hover:text-red-400"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {isOpen && (
        <div className="pl-4 border-l-2 border-gray-200 dark:border-gray-700 ml-3">
          {hasContent && (
            <div className="p-3 my-2 ml-4 bg-secondary-50 dark:bg-secondary-900/40 rounded-lg space-y-4">
              {item.sources?.map((source, idx) => (
                <SourceDisplay key={idx} source={source} />
              ))}
              {item.explanation && (
                <p className="text-sm text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-600 pt-3 mt-3">
                  {item.explanation}
                </p>
              )}
            </div>
          )}
          {hasChildren &&
            item.children?.map((child) => (
              <DirectoryNode
                key={child.id}
                item={child}
                level={level + 1}
                onEdit={onEdit}
                onDelete={onDelete}
                isAdmin={isAdmin}
              />
            ))}
        </div>
      )}
    </div>
  );
};

// ============ Source Form Component ============

interface SourceFormProps {
  source: Source;
  onChange: (source: Source) => void;
  onRemove: () => void;
  surahs: Surah[];
  hadithBooks: HadithBook[];
}

const SourceForm: React.FC<SourceFormProps> = ({
  source,
  onChange,
  onRemove,
  surahs,
  hadithBooks,
}) => {
  const [selectedSurah, setSelectedSurah] = useState<string>(
    source.type === 'quran' ? String(source.surah) : ''
  );
  const [verseCount, setVerseCount] = useState<number>(0);

  useEffect(() => {
    if (source.type === 'quran' && selectedSurah) {
      const surah = surahs.find((s) => s.nomor === parseInt(selectedSurah));
      if (surah) {
        setVerseCount(surah.jumlahAyat);
      }
    }
  }, [selectedSurah, surahs, source.type]);

  const handleTypeChange = (type: string) => {
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
    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
      <div className="flex items-center justify-between mb-3">
        <select
          value={source.type}
          onChange={(e) => handleTypeChange(e.target.value)}
          className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
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
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
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
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              <option value="">Pilih Surah</option>
              {surahs.map((surah) => (
                <option key={surah.nomor} value={surah.nomor}>
                  {surah.nomor}. {surah.namaLatin} ({surah.arti})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Ayat (1-{verseCount})
            </label>
            <input
              type="number"
              min={1}
              max={verseCount}
              value={source.verse}
              onChange={(e) => onChange({ ...source, verse: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              placeholder="1"
            />
          </div>
        </div>
      )}

      {source.type === 'hadith' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Kitab
            </label>
            <select
              value={source.book}
              onChange={(e) => onChange({ ...source, book: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              {hadithBooks.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Nomor
            </label>
            <input
              type="number"
              min={1}
              value={source.number}
              onChange={(e) => onChange({ ...source, number: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              placeholder="1"
            />
          </div>
        </div>
      )}

      {source.type === 'website' && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Judul
            </label>
            <input
              type="text"
              value={source.title}
              onChange={(e) => onChange({ ...source, title: e.target.value })}
              placeholder="Judul website"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              URL
            </label>
            <input
              type="url"
              value={source.url}
              onChange={(e) => onChange({ ...source, url: e.target.value })}
              placeholder="https://example.com"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ============ Wawasan Form Modal ============

interface WawasanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDirectoryData) => Promise<void>;
  initialData?: DirectoryItem | null;
  parentId?: number;
}

const WawasanFormModal: React.FC<WawasanFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  parentId,
}) => {
  const [title, setTitle] = useState('');
  const [sources, setSources] = useState<Source[]>([{ type: 'none' }]);
  const [explanation, setExplanation] = useState('');
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [hadithBooks, setHadithBooks] = useState<HadithBook[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      Promise.all([islamicApi.getSurahs(), islamicApi.getHadithBooks()])
        .then(([surahsData, booksData]) => {
          setSurahs(surahsData);
          setHadithBooks(booksData);
        })
        .finally(() => setIsLoading(false));

      if (initialData) {
        setTitle(initialData.title);
        setSources(initialData.sources || [{ type: 'none' }]);
        setExplanation(initialData.explanation || '');
      } else {
        setTitle('');
        setSources([{ type: 'none' }]);
        setExplanation('');
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        title,
        type: 'item',
        parentId,
        content: {
          sources,
          explanation,
        },
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const addSource = () => {
    setSources([...sources, { type: 'none' }]);
  };

  const updateSource = (index: number, source: Source) => {
    const newSources = [...sources];
    newSources[index] = source;
    setSources(newSources);
  };

  const removeSource = (index: number) => {
    if (sources.length > 1) {
      setSources(sources.filter((_, i) => i !== index));
    }
  };

  if (!isOpen) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 w-full h-full z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                {initialData ? 'Edit Wawasan' : 'Tambah Wawasan'}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Judul Wawasan
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Masukkan judul wawasan"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                />
              </div>

              {/* Sources */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Sumber Wawasan
                  </label>
                  <button
                    type="button"
                    onClick={addSource}
                    className="flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Tambah Sumber
                  </button>
                </div>
                <div className="space-y-3">
                  {sources.map((source, index) => (
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Penjelasan Detail
                </label>
                <textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Masukkan penjelasan detail..."
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 resize-none"
                />
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !title.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Menyimpan...' : initialData ? 'Simpan' : 'Tambah'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </ModalPortal>
  );
};

// ============ Main Directory Component ============

const Directory: React.FC = () => {
  const [items, setItems] = useState<DirectoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DirectoryItem | null>(null);
  const [isAdmin] = useState(false); // TODO: Get from auth context

  const fetchDirectory = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await directoryApi.getAll();
      setItems(data);
    } catch (error) {
      console.error('Failed to fetch directory:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDirectory();
  }, [fetchDirectory]);

  const handleSubmit = async (data: CreateDirectoryData) => {
    if (editingItem) {
      await directoryApi.update(editingItem.id, data);
    } else {
      await directoryApi.create(data);
    }
    fetchDirectory();
  };

  const handleEdit = (item: DirectoryItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus wawasan ini?')) {
      await directoryApi.delete(id);
      fetchDirectory();
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Directory Wawasan Manajemen Syariah
          </h2>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Jelajahi landasan ilmu dari Qur'an, Sunnah, Maqasid, hingga prinsip aplikasi modern.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <PlusIcon className="w-5 h-5" />
            Tambah Wawasan
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-md">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 rounded-lg">
                <Skeleton className="w-5 h-5" />
                <Skeleton className="h-5 w-48" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            Belum ada wawasan. Tambahkan wawasan pertama Anda.
          </p>
        ) : (
          items.map((item) => (
            <DirectoryNode
              key={item.id}
              item={item}
              level={0}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isAdmin={isAdmin}
            />
          ))
        )}
      </div>

      <WawasanFormModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleSubmit}
        initialData={editingItem}
      />
    </div>
  );
};

export default Directory;
