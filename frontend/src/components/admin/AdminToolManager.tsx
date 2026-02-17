import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { adminApi, getErrorMessage } from '@/lib/api-services';
import { islamicApi, Surah, HadithBook } from '@/lib/api-islamic';
import type { Tool, CreateToolData, UpdateToolData, Source } from '@/types/api';
import {
  BriefcaseIcon,
  TrashIcon,
  Cog6ToothIcon,
  PlusCircleIcon,
  XMarkIcon,
  LinkIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  ChevronDownIcon,
  DownloadIcon,
  EyeIcon,
  PencilSquareIcon,
  BookOpenIcon,
} from '@/components/common/Icons';
import { Skeleton, SkeletonText } from '@/components/common/Skeleton';
import ModalPortal from '@/components/common/ModalPortal';
import ConfirmModal, { type ConfirmModalType } from '@/components/common/ConfirmModal';

const DEFAULT_CATEGORIES = [
  'Individu/Keluarga',
  'Bisnis Islami',
  'Lembaga/Komunitas',
  'Keuangan/Investasi',
  'Edukasi',
  'Sosial/Umat',
];

// Form state type - uses strings for inputs/outputs/benefits (comma-separated)
interface ToolFormState {
  id?: number;
  name: string;
  category: string;
  description: string;
  link: string;
  inputs: string; // comma-separated
  outputs: string; // comma-separated
  benefits: string; // comma-separated
  shariaBasis: string;
  relatedDirectoryIds: number[];
  relatedDalilText: string;
  relatedDalilSource: string;
  sources: Source[];
}

// Helper to convert array to comma-separated string
const arrayToString = (arr: string[] | undefined): string => {
  return arr ? arr.join(', ') : '';
};

// Helper to convert comma-separated string to array
const stringToArray = (str: string): string[] => {
  return str
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
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
    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
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

// ============ Source Preview Component ============
interface SourcePreviewProps {
  source: Source;
  surahs: Surah[];
}

const SourcePreview: React.FC<SourcePreviewProps> = ({ source, surahs }) => {
  const [verseData, setVerseData] = useState<{
    arabic?: string;
    translation?: string;
    surah_name?: string;
  } | null>(null);
  const [hadithData, setHadithData] = useState<{
    arabic?: string;
    translation?: string;
    book_name?: string;
  } | null>(null);

  useEffect(() => {
    if (source.type === 'quran' && source.surah && source.verse) {
      const surah = surahs.find((s) => s.nomor === source.surah);
      islamicApi
        .getVerse(source.surah, source.verse)
        .then((data) => {
          if (data) {
            setVerseData({
              arabic: data.arabic,
              translation: data.translation,
              surah_name: surah?.namaLatin || `Surah ${source.surah}`,
            });
          }
        })
        .catch((err) => console.error('Failed to fetch verse:', err));
    }
    if (source.type === 'hadith' && source.book && source.number) {
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
        .catch((err) => console.error('Failed to fetch hadith:', err));
    }
  }, [source, surahs]);

  if (source.type === 'none') return null;

  if (source.type === 'quran') {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
            Quran
          </span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            QS. {verseData?.surah_name || `Surah ${source.surah}`}: {source.verse}
          </span>
        </div>
        {verseData?.arabic && (
          <p className="text-lg text-right font-serif text-gray-800 dark:text-gray-200 leading-relaxed">
            {verseData.arabic}
          </p>
        )}
        {verseData?.translation && (
          <p className="text-sm text-gray-600 dark:text-gray-400 italic">
            "{verseData.translation}"
          </p>
        )}
      </div>
    );
  }

  if (source.type === 'hadith') {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
            Hadist
          </span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {hadithData?.book_name || source.book} No. {source.number}
          </span>
        </div>
        {hadithData?.arabic && (
          <p className="text-lg text-right font-serif text-gray-800 dark:text-gray-200 leading-relaxed">
            {hadithData.arabic}
          </p>
        )}
        {hadithData?.translation && (
          <p className="text-sm text-gray-600 dark:text-gray-400 italic">
            "{hadithData.translation}"
          </p>
        )}
      </div>
    );
  }

  if (source.type === 'website') {
    return (
      <div className="flex items-center gap-2">
        <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
          Website
        </span>
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
  }

  return null;
};

const AdminToolManager: React.FC = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<ToolFormState | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('Semua');
  const [sortByDate, setSortByDate] = useState<'newest' | 'oldest'>('newest');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
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

  const showModal = (
    title: string,
    message: string,
    type: ConfirmModalType = 'info',
    onConfirm?: () => void,
    showCancel: boolean = false
  ) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalType(type);
    setModalAction(() => onConfirm || null);
    setModalShowCancel(showCancel);
    setModalOpen(true);
  };

  // Get unique categories from tools data, fallback to defaults
  const availableCategories = useMemo(() => {
    if (tools.length === 0) return DEFAULT_CATEGORIES;
    const categories = new Set<string>();
    tools.forEach((t) => {
      if (t.category) categories.add(t.category);
    });
    // Merge with defaults to ensure all categories are available
    DEFAULT_CATEGORIES.forEach((cat) => categories.add(cat));
    return Array.from(categories).sort();
  }, [tools]);

  const fetchTools = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminApi.getTools();
      setTools(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTools();
  }, [fetchTools]);

  const filteredTools = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    let result = tools.filter((t) => {
      const name = (t.name || '').toLowerCase();
      const category = (t.category || '').toLowerCase();
      const description = (t.description || '').toLowerCase();

      const matchesSearch =
        !query || name.includes(query) || category.includes(query) || description.includes(query);

      // Category filter - exact match (case-sensitive since API returns exact values)
      const matchesCategory = categoryFilter === 'Semua' || t.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });

    // Sort by date
    result.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return sortByDate === 'newest' ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [tools, searchQuery, categoryFilter, sortByDate]);

  const deleteTool = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();

    const toolToDelete = tools.find((t) => t.id === id);
    showModal(
      'Hapus Tool',
      `Yakin ingin menghapus tool "${toolToDelete?.name}" dari katalog publik?`,
      'warning',
      async () => {
        try {
          await adminApi.deleteTool(id);
          setTools(tools.filter((t) => t.id !== id));
        } catch (err) {
          showModal('Error', getErrorMessage(err), 'error');
        }
      },
      true
    );
  };

  const openAddModal = () => {
    setEditingTool({
      name: '',
      category: DEFAULT_CATEGORIES[0],
      description: '',
      link: '',
      inputs: '',
      outputs: '',
      benefits: '',
      shariaBasis: '',
      relatedDirectoryIds: [],
      relatedDalilText: '',
      relatedDalilSource: '',
      sources: [{ type: 'none' }],
    });
    setPreviewMode(false);
    setIsLoadingSources(true);
    setIsModalOpen(true);
    // Load surahs and hadith books
    Promise.all([islamicApi.getSurahs(), islamicApi.getHadithBooks()])
      .then(([surahsData, booksData]) => {
        setSurahs(surahsData);
        setHadithBooks(booksData);
      })
      .catch((err) => console.error('Failed to load Islamic sources:', err))
      .finally(() => setIsLoadingSources(false));
  };

  const openEditModal = (tool: Tool) => {
    setEditingTool({
      id: tool.id,
      name: tool.name,
      category: tool.category,
      description: tool.description,
      link: tool.link || '',
      inputs: arrayToString(tool.inputs),
      outputs: arrayToString(tool.outputs),
      benefits: arrayToString(tool.benefits),
      shariaBasis: tool.shariaBasis || '',
      relatedDirectoryIds: tool.relatedDirectoryIds || [],
      relatedDalilText: tool.relatedDalilText || '',
      relatedDalilSource: tool.relatedDalilSource || '',
      sources: tool.sources && tool.sources.length > 0 ? tool.sources : [{ type: 'none' }],
    });
    setPreviewMode(false);
    setIsLoadingSources(true);
    setIsModalOpen(true);
    // Load surahs and hadith books if not already loaded
    if (surahs.length === 0 || hadithBooks.length === 0) {
      Promise.all([islamicApi.getSurahs(), islamicApi.getHadithBooks()])
        .then(([surahsData, booksData]) => {
          setSurahs(surahsData);
          setHadithBooks(booksData);
        })
        .catch((err) => console.error('Failed to load Islamic sources:', err))
        .finally(() => setIsLoadingSources(false));
    } else {
      setIsLoadingSources(false);
    }
  };

  const handleSaveTool = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingTool) return;

    setIsSubmitting(true);
    try {
      // Convert comma-separated strings to arrays for API
      const toolData: CreateToolData | UpdateToolData = {
        name: editingTool.name,
        category: editingTool.category,
        description: editingTool.description,
        link: editingTool.link || undefined,
        inputs: stringToArray(editingTool.inputs),
        outputs: stringToArray(editingTool.outputs),
        benefits: stringToArray(editingTool.benefits),
        shariaBasis: editingTool.shariaBasis || undefined,
        relatedDirectoryIds:
          editingTool.relatedDirectoryIds.length > 0 ? editingTool.relatedDirectoryIds : undefined,
        relatedDalilText: editingTool.relatedDalilText || undefined,
        relatedDalilSource: editingTool.relatedDalilSource || undefined,
        sources: editingTool.sources,
      };

      if (editingTool.id) {
        // Update existing tool
        const updated = await adminApi.updateTool(editingTool.id, toolData as UpdateToolData);
        setTools(tools.map((t) => (t.id === updated.id ? updated : t)));
      } else {
        // Create new tool
        const created = await adminApi.createTool(toolData as CreateToolData);
        setTools([created, ...tools]);
      }
      setIsModalOpen(false);
      setEditingTool(null);
    } catch (err) {
      showModal('Error', getErrorMessage(err), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const exportPDF = async () => {
    try {
      const blob = await adminApi.exportToolsPdf();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[T:]/g, '_')
        .replace(/-/g, '_');
      a.href = url;
      a.download = `katalog_tools_${timestamp}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      // Open in new tab for viewing/printing
      window.open(url, '_blank');
    } catch (err) {
      showModal('Gagal Ekspor PDF', getErrorMessage(err), 'error');
    }
  };

  const exportExcel = async () => {
    try {
      const blob = await adminApi.exportToolsXlsx();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[T:]/g, '_')
        .replace(/-/g, '_');
      a.href = url;
      a.download = `katalog_tools_${timestamp}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      showModal('Gagal Ekspor Excel', getErrorMessage(err), 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Pusat Muamalah (Tools)
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Kelola koleksi alat bantu produktivitas berbasis Syariah.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={exportPDF}
            className="flex items-center px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition text-sm font-bold shadow-sm active:scale-95 border border-transparent dark:border-gray-600"
            title="Ekspor laporan katalog tools dalam format PDF"
          >
            <DownloadIcon className="w-4 h-4 mr-2" />
            Laporan PDF
          </button>
          <button
            type="button"
            onClick={exportExcel}
            className="flex items-center px-5 py-2.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition text-sm font-bold shadow-sm active:scale-95 border border-emerald-100 dark:border-emerald-800/30"
            title="Ekspor data katalog tools dalam format Excel"
          >
            <DownloadIcon className="w-4 h-4 mr-2" />
            Data Excel
          </button>
          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg text-sm active:scale-95"
          >
            <PlusCircleIcon className="w-5 h-5 mr-2" />
            Tambah Tool
          </button>
        </div>
      </div>

      {/* Toolbar - Search & Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 flex flex-col lg:flex-row items-center gap-4">
        <div className="relative w-full lg:flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Cari tool berdasarkan nama, kategori, atau deskripsi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-5 py-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 border border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm shadow-sm"
          />
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-48">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FunnelIcon className="h-4 w-4 text-gray-400" />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-9 pr-8 py-3 bg-gray-50 dark:bg-gray-900 border border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm shadow-sm appearance-none cursor-pointer font-medium text-gray-600 dark:text-gray-300"
            >
              <option value="Semua">Semua Kategori</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <ChevronDownIcon className="h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div className="relative flex-1 lg:w-48">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CalendarIcon className="h-4 w-4 text-gray-400" />
            </div>
            <select
              value={sortByDate}
              onChange={(e) => setSortByDate(e.target.value as any)}
              className="w-full pl-9 pr-8 py-3 bg-gray-50 dark:bg-gray-900 border border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm shadow-sm appearance-none cursor-pointer font-medium text-gray-600 dark:text-gray-300"
            >
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <ChevronDownIcon className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div>
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Skeleton className="w-8 h-8 rounded-lg" />
                  <Skeleton className="w-8 h-8 rounded-lg" />
                </div>
              </div>
              <SkeletonText lines={2} />
              <div className="mt-4 flex space-x-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => (
            <div
              key={tool.id}
              className="bg-white dark:bg-gray-800 p-7 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 flex flex-col hover:shadow-lg transition-all group relative"
            >
              <div className="flex items-start justify-between mb-5">
                <div className="p-3.5 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-xl shadow-sm group-hover:border-indigo-100 dark:group-hover:border-indigo-900 transition-colors">
                  <BriefcaseIcon className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                  <button
                    type="button"
                    onClick={() => openEditModal(tool)}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 rounded-lg transition-all"
                  >
                    <Cog6ToothIcon className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => deleteTool(e, tool.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-lg transition-all"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">
                {tool.category}
              </p>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                {tool.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex-grow leading-relaxed line-clamp-3">
                {tool.description}
              </p>

              <div className="mt-5 pt-4 border-t border-gray-50 dark:border-gray-700 flex flex-col space-y-2">
                <div className="flex items-center text-[9px] font-bold text-gray-400">
                  <CalendarIcon className="w-2.5 h-2.5 mr-1 text-gray-400/60" />
                  <span className="uppercase tracking-tighter">
                    Dibuat: {formatDate(tool.createdAt)}
                  </span>
                </div>

                <div className="flex items-center text-[10px] text-gray-400 font-bold uppercase tracking-tighter min-w-0">
                  {tool.link ? (
                    <>
                      <LinkIcon className="w-3.5 h-3.5 mr-2 text-indigo-400 flex-shrink-0" />
                      <span className="truncate">{tool.link}</span>
                    </>
                  ) : (
                    <span className="text-gray-300 dark:text-gray-600 italic">No direct link</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-100 dark:border-gray-700 p-12 text-center shadow-sm">
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Tidak ada tool yang ditemukan untuk filter ini.
          </p>
        </div>
      )}

      {isModalOpen && editingTool && (
        <ModalPortal>
          <div className="fixed inset-0 w-full h-full bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl p-8 shadow-2xl animate-fadeIn border border-gray-100 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold dark:text-white">
                  {editingTool.name ? 'Edit Konfigurasi Tool' : 'Registrasi Tool Baru'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-all"
                >
                  <XMarkIcon className="w-6 h-6 text-gray-400" />
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

              {previewMode ? (
                /* Preview Mode - matches ToolDetailModal style */
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  {/* Header with Icon, Category, Name */}
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-primary-100 dark:bg-primary-900/50 rounded-full flex-shrink-0">
                      <BriefcaseIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-secondary-700 dark:text-secondary-400">
                        {editingTool.category || 'Sektor'}
                      </span>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                        {editingTool.name || 'Nama Tool'}
                      </h2>
                    </div>
                  </div>

                  {/* Description */}
                  {editingTool.description && (
                    <p className="text-lg leading-relaxed">{editingTool.description}</p>
                  )}

                  {/* Inputs & Outputs Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-2">Inputs:</h4>
                      <ul className="text-sm space-y-1">
                        {editingTool.inputs && stringToArray(editingTool.inputs).length > 0 ? (
                          stringToArray(editingTool.inputs).map((item, index) => (
                            <li key={index} className="flex items-center">
                              <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></span>
                              {item}
                            </li>
                          ))
                        ) : (
                          <li className="text-gray-400 italic text-sm">Tidak ada input</li>
                        )}
                      </ul>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-2">Outputs:</h4>
                      <ul className="text-sm space-y-1">
                        {editingTool.outputs && stringToArray(editingTool.outputs).length > 0 ? (
                          stringToArray(editingTool.outputs).map((item, index) => (
                            <li key={index} className="flex items-center">
                              <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></span>
                              {item}
                            </li>
                          ))
                        ) : (
                          <li className="text-gray-400 italic text-sm">Tidak ada output</li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Benefits */}
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      Manfaat Utama:
                    </h4>
                    <ul className="text-sm space-y-1">
                      {editingTool.benefits && stringToArray(editingTool.benefits).length > 0 ? (
                        stringToArray(editingTool.benefits).map((item, index) => (
                          <li key={index} className="flex items-center">
                            <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></span>
                            {item}
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-400 italic text-sm">Tidak ada manfaat</li>
                      )}
                    </ul>
                  </div>

                  {/* Sharia Basis */}
                  {editingTool.shariaBasis && (
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                        <BookOpenIcon className="w-5 h-5 mr-2" />
                        Landasan Syariah Terkait:
                      </h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-medium px-3 py-1.5 rounded-full">
                          {editingTool.shariaBasis}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Sources/Dalil */}
                  {editingTool.sources && editingTool.sources.some((s) => s.type !== 'none') && (
                    <div className="p-5 bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-500 rounded-r-xl">
                      <h4 className="font-bold text-primary-900 dark:text-primary-100 mb-3">
                        Dalil Pendukung:
                      </h4>
                      <div className="space-y-3">
                        {editingTool.sources.map((source, index) => (
                          <SourcePreview key={index} source={source} surahs={surahs} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Link Button */}
                  {editingTool.link && (
                    <div className="pt-2">
                      <a
                        href={editingTool.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-full py-4 px-6 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition shadow-lg transform hover:-translate-y-0.5"
                      >
                        <LinkIcon className="w-5 h-5 mr-3" />
                        Akses Tool Sekarang
                      </a>
                      <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3">
                        Link akan terbuka di tab baru. Pastikan Anda telah masuk (login) jika
                        diperlukan.
                      </p>
                    </div>
                  )}

                  {/* Empty State */}
                  {!editingTool.name &&
                    !editingTool.description &&
                    !editingTool.inputs &&
                    !editingTool.outputs &&
                    !editingTool.benefits && (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <p className="text-sm">Isi form untuk melihat preview</p>
                      </div>
                    )}

                  {/* Save Button in Preview */}
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={handleSaveTool}
                      disabled={isSubmitting}
                      className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Menyimpan...
                        </>
                      ) : (
                        'Simpan ke Katalog'
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                /* Edit Mode */
                <form onSubmit={handleSaveTool} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">
                      Sektor Penggunaan
                    </label>
                    <select
                      value={editingTool.category}
                      onChange={(e) => setEditingTool({ ...editingTool, category: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm cursor-pointer"
                    >
                      {DEFAULT_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">
                      Nama Katalog Tool
                    </label>
                    <input
                      required
                      type="text"
                      value={editingTool.name}
                      onChange={(e) => setEditingTool({ ...editingTool, name: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 border border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                      placeholder="Contoh: Financial Planner Syariah"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">
                      Deskripsi Ringkas
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={editingTool.description}
                      onChange={(e) =>
                        setEditingTool({ ...editingTool, description: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 border border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                      placeholder="Contoh: Alokasikan penghasilan sesuai kaidah syariah."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">
                        Inputs
                      </label>
                      <textarea
                        rows={3}
                        value={editingTool.inputs}
                        onChange={(e) => setEditingTool({ ...editingTool, inputs: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 border border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm text-sm"
                        placeholder="Contoh: Penghasilan, Kebutuhan Pokok, Utang"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">
                        Outputs
                      </label>
                      <textarea
                        rows={3}
                        value={editingTool.outputs}
                        onChange={(e) =>
                          setEditingTool({ ...editingTool, outputs: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 border border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm text-sm"
                        placeholder="Contoh: Alokasi Zakat, Sedekah, Tabungan Haji"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">
                      Manfaat Utama
                    </label>
                    <input
                      type="text"
                      value={editingTool.benefits}
                      onChange={(e) => setEditingTool({ ...editingTool, benefits: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 border border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                      placeholder="Contoh: Mencapai keberkahan finansial."
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">
                      Landasan Syariah (Opsional)
                    </label>
                    <input
                      type="text"
                      value={editingTool.shariaBasis || ''}
                      onChange={(e) =>
                        setEditingTool({ ...editingTool, shariaBasis: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 border border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                      placeholder="Contoh: Hifdz al-Mal (Menjaga Harta)"
                    />
                  </div>

                  {/* Sources/Dalil Pendukung */}
                  <div className="p-5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                        Dalil Pendukung (Opsional)
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          setEditingTool({
                            ...editingTool,
                            sources: [...(editingTool.sources || []), { type: 'none' }],
                          })
                        }
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        + Tambah Sumber
                      </button>
                    </div>
                    {isLoadingSources ? (
                      <div className="py-4 text-center text-sm text-gray-500">
                        Memuat data Al-Quran & Hadist...
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {editingTool.sources?.map((source, index) => (
                          <SourceForm
                            key={index}
                            source={source}
                            surahs={surahs}
                            hadithBooks={hadithBooks}
                            onChange={(newSource) => {
                              const newSources = [...(editingTool.sources || [])];
                              newSources[index] = newSource;
                              setEditingTool({ ...editingTool, sources: newSources });
                            }}
                            onRemove={() => {
                              const newSources = editingTool.sources?.filter((_, i) => i !== index);
                              setEditingTool({
                                ...editingTool,
                                sources: newSources?.length ? newSources : [{ type: 'none' }],
                              });
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">
                      URL Akses Langsung
                    </label>
                    <input
                      type="text"
                      value={editingTool.link}
                      onChange={(e) => setEditingTool({ ...editingTool, link: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 border border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm text-sm"
                      placeholder="https://app.syariahos.com/planner"
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Menyimpan...
                        </>
                      ) : (
                        'Simpan ke Katalog'
                      )}
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
        confirmText={modalShowCancel ? 'Ya, Hapus' : 'OK'}
        cancelText="Batal"
      />
    </div>
  );
};

export default AdminToolManager;
