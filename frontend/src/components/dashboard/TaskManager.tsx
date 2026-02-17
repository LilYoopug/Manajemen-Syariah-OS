import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { tasksApi, getErrorMessage } from '@/lib/api-services';
import type { Task as ApiTask, CreateTaskData, ResetCycle } from '@/types/api';
import {
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  ClipboardListIcon,
  PlusCircleIcon,
  ClockIcon,
  FunnelIcon,
} from '@/components/common/Icons';
import { Skeleton } from '@/components/common/Skeleton';
import ModalPortal from '@/components/common/ModalPortal';
import ConfirmModal, { type ConfirmModalType } from '@/components/common/ConfirmModal';

// Default categories
const DEFAULT_CATEGORIES = ['SDM', 'Bisnis', 'Keuangan', 'Sosial', 'Kepatuhan', 'Umum'];

// Sort options
type SortOption =
  | 'default'
  | 'progress-asc'
  | 'progress-desc'
  | 'name-asc'
  | 'name-desc'
  | 'newest'
  | 'oldest';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'progress-asc', label: 'Progres ↑' },
  { value: 'progress-desc', label: 'Progres ↓' },
  { value: 'name-asc', label: 'Nama A-Z' },
  { value: 'name-desc', label: 'Nama Z-A' },
  { value: 'newest', label: 'Terbaru' },
  { value: 'oldest', label: 'Terlama' },
];

type Task = ApiTask;

const TaskManager: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await tasksApi.getAll();
      setTasks(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTaskData, setNewTaskData] = useState({
    text: '',
    category: 'Umum',
    hasLimit: false,
    currentValue: 0,
    targetValue: 0,
    unit: '',
    resetCycle: 'one-time' as ResetCycle,
    perCheckEnabled: false,
    incrementValue: 1,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('default');

  const [isHistoryModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Confirm Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState<ConfirmModalType>('info');
  const [modalAction, setModalAction] = useState<(() => void) | null>(null);
  const [modalShowCancel, setModalShowCancel] = useState(false);

  // Custom input modal state (for hasLimit tasks)
  const [isCustomInputOpen, setIsCustomInputOpen] = useState(false);
  const [customInputTask, setCustomInputTask] = useState<Task | null>(null);
  const [customInputValue, setCustomInputValue] = useState('');
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdTriggeredRef = useRef(false);

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

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskData.text.trim() === '' || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const createData: CreateTaskData = {
        text: newTaskData.text,
        category: newTaskData.category,
        resetCycle: newTaskData.resetCycle,
        hasLimit: newTaskData.hasLimit,
        targetValue: newTaskData.hasLimit ? newTaskData.targetValue : undefined,
        unit: newTaskData.hasLimit ? newTaskData.unit : undefined,
        incrementValue: newTaskData.hasLimit ? newTaskData.incrementValue : undefined,
        perCheckEnabled: newTaskData.hasLimit ? newTaskData.perCheckEnabled : undefined,
      };

      const newTask = await tasksApi.create(createData);
      setTasks((prev) => [newTask, ...prev]);
      setIsAddModalOpen(false);
      setNewTaskData({
        text: '',
        category: 'Umum',
        hasLimit: false,
        currentValue: 0,
        targetValue: 0,
        unit: '',
        resetCycle: 'one-time',
        perCheckEnabled: false,
        incrementValue: 1,
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleTask = async (id: number) => {
    // Skip toggle if custom input modal was just opened via hold
    if (holdTriggeredRef.current) {
      holdTriggeredRef.current = false;
      return;
    }

    try {
      const updatedTask = await tasksApi.toggle(id);
      setTasks((prev) => prev.map((t) => (t.id === id ? updatedTask : t)));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const openCustomInputModal = (task: Task) => {
    holdTriggeredRef.current = true;
    setCustomInputTask(task);
    setCustomInputValue('');
    setIsCustomInputOpen(true);
  };

  const handleCustomInputSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInputTask || !customInputValue) return;

    try {
      const value = parseFloat(customInputValue);
      if (isNaN(value) || value <= 0) {
        setError('Nilai harus berupa angka positif');
        return;
      }

      const updatedTask = await tasksApi.addProgress(customInputTask.id, value);
      setTasks((prev) => prev.map((t) => (t.id === customInputTask.id ? updatedTask : t)));
      setIsCustomInputOpen(false);
      setCustomInputTask(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDeleteTask = async (id: number) => {
    showModal(
      'Hapus Tugas',
      'Apakah Anda yakin ingin menghapus tugas ini?',
      'warning',
      async () => {
        try {
          await tasksApi.delete(id);
          setTasks((prev) => prev.filter((t) => t.id !== id));
        } catch (err) {
          setError(getErrorMessage(err));
        }
      },
      true
    );
  };

  const filteredTasks = useMemo(() => {
    let result = tasks.filter((task) => {
      const categoryMatch = !filterCategory || task.category === filterCategory;
      const searchMatch =
        !searchQuery || task.text.toLowerCase().includes(searchQuery.toLowerCase());
      return categoryMatch && searchMatch;
    });

    // Apply sorting
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'progress-asc': {
          const progressA =
            a.hasLimit && a.targetValue ? a.currentValue / a.targetValue : a.completed ? 1 : 0;
          const progressB =
            b.hasLimit && b.targetValue ? b.currentValue / b.targetValue : b.completed ? 1 : 0;
          return progressA - progressB;
        }
        case 'progress-desc': {
          const progressA =
            a.hasLimit && a.targetValue ? a.currentValue / a.targetValue : a.completed ? 1 : 0;
          const progressB =
            b.hasLimit && b.targetValue ? b.currentValue / b.targetValue : b.completed ? 1 : 0;
          return progressB - progressA;
        }
        case 'name-asc':
          return a.text.localeCompare(b.text, 'id');
        case 'name-desc':
          return b.text.localeCompare(a.text, 'id');
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        default: {
          const progressA =
            a.hasLimit && a.targetValue ? a.currentValue / a.targetValue : a.completed ? 1 : 0;
          const progressB =
            b.hasLimit && b.targetValue ? b.currentValue / b.targetValue : b.completed ? 1 : 0;
          return progressA - progressB;
        }
      }
    });

    return result;
  }, [tasks, filterCategory, searchQuery, sortBy]);

  const openHistoryModal = async (task: Task) => {
    // Fetch task with history from API
    try {
      const taskWithHistory = await tasksApi.getById(task.id);
      setSelectedTask(taskWithHistory);
      setHistoryModalOpen(true);
    } catch (err) {
      showModal('Error', getErrorMessage(err), 'error');
    }
  };

  const getCycleLabel = (cycle: ResetCycle) => {
    switch (cycle) {
      case 'daily':
        return 'Harian';
      case 'weekly':
        return 'Mingguan';
      case 'monthly':
        return 'Bulanan';
      case 'yearly':
        return 'Tahunan';
      default:
        return 'Sekali';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 tracking-tight flex items-center">
            <ClipboardListIcon className="w-8 h-8 mr-3 text-primary-600" />
            Daftar Tugas Amanah
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Pusat kendali operasional dan target berkelanjutan.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center px-6 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition shadow-lg active:scale-95 text-sm"
        >
          <PlusCircleIcon className="w-5 h-5 mr-2" />
          Tambah Tugas Amanah
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800/30">
          <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari tugas..."
            className="w-full pl-12 pr-5 py-3 text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all shadow-sm"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
            <ClipboardListIcon className="w-5 h-5" />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="appearance-none pl-10 pr-8 py-2.5 text-xs font-bold rounded-xl transition-all bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <FunnelIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
          </div>

          {/* Category Filters */}
          <button
            onClick={() => setFilterCategory(null)}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${!filterCategory ? 'bg-primary-600 text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50'}`}
          >
            Semua
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${filterCategory === cat ? 'bg-primary-600 text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-start space-x-4">
                  <Skeleton className="w-5 h-5 rounded mt-1" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <div className="flex items-center space-x-4 mt-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Skeleton className="w-8 h-8 rounded-lg" />
                    <Skeleton className="w-8 h-8 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-700">
            <ClipboardListIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">Belum ada tugas amanah.</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Klik "Tambah Tugas Amanah" untuk memulai.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => {
              const percentage = task.hasLimit ? Math.min(Math.round(task.progress || 0), 100) : 0;
              return (
                <div
                  key={task.id}
                  className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 flex flex-col group transition-all hover:shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1 min-w-0 mr-4">
                      <button
                        onClick={() => handleToggleTask(task.id)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          if (task.hasLimit) {
                            openCustomInputModal(task);
                          }
                        }}
                        onMouseDown={(e) => {
                          if (e.button === 0 && task.hasLimit) {
                            holdTriggeredRef.current = false; // Reset on each new press
                            holdTimerRef.current = setTimeout(() => {
                              holdTimerRef.current = null;
                              openCustomInputModal(task);
                            }, 500);
                          }
                        }}
                        onMouseUp={() => {
                          if (holdTimerRef.current) {
                            clearTimeout(holdTimerRef.current);
                            holdTimerRef.current = null;
                          }
                        }}
                        onMouseLeave={() => {
                          if (holdTimerRef.current) {
                            clearTimeout(holdTimerRef.current);
                            holdTimerRef.current = null;
                          }
                        }}
                        className={`h-7 w-7 flex-shrink-0 rounded-lg border-2 flex items-center justify-center transition-all ${
                          task.completed
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-gray-300 dark:border-gray-600 hover:border-primary-500 text-transparent'
                        } cursor-pointer active:scale-90`}
                      >
                        <CheckIcon className="w-5 h-5" />
                      </button>
                      <div className="ml-4 truncate">
                        <div className="flex items-center gap-2">
                          <h4
                            className={`text-base font-bold text-gray-900 dark:text-white truncate ${task.completed ? 'line-through text-gray-400' : ''}`}
                          >
                            {task.text}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest">
                            {task.category || 'Umum'}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                            {getCycleLabel(task.resetCycle)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openHistoryModal(task)}
                        className="p-2 text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-all"
                        title="Riwayat Progres"
                      >
                        <ClockIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-all"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {task.hasLimit && (
                    <div className="mt-4">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          Progres Capaian Target
                        </span>
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          {task.currentValue?.toLocaleString() || 0} /{' '}
                          {task.targetValue?.toLocaleString() || 0} {task.unit}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-2.5 rounded-full transition-all duration-700 ${task.completed ? 'bg-emerald-500' : 'bg-primary-600'}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isAddModalOpen && (
        <ModalPortal>
          <div className="fixed inset-0 w-full h-full bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl w-full max-w-lg border border-gray-100 dark:border-gray-700 p-8 animate-fadeIn relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-6 right-6 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Tambah Amanah Baru
              </h3>
              <form onSubmit={handleAddTask} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">
                    Deskripsi
                  </label>
                  <input
                    required
                    type="text"
                    autoFocus
                    value={newTaskData.text}
                    onChange={(e) => setNewTaskData({ ...newTaskData, text: e.target.value })}
                    className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 border border-transparent rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none text-sm transition-all"
                    disabled={isSubmitting}
                    placeholder="Masukkan deskripsi tugas"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-2 ml-1">
                      Kategori
                    </label>
                    <select
                      value={newTaskData.category}
                      onChange={(e) => setNewTaskData({ ...newTaskData, category: e.target.value })}
                      className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-transparent rounded-2xl text-sm cursor-pointer outline-none"
                      disabled={isSubmitting}
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-2 ml-1">
                      Siklus Reset
                    </label>
                    <select
                      value={newTaskData.resetCycle}
                      onChange={(e) =>
                        setNewTaskData({ ...newTaskData, resetCycle: e.target.value as ResetCycle })
                      }
                      className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-transparent rounded-2xl text-sm cursor-pointer outline-none"
                      disabled={isSubmitting}
                    >
                      <option value="one-time">One-time</option>
                      <option value="daily">Harian</option>
                      <option value="weekly">Mingguan</option>
                      <option value="monthly">Bulanan</option>
                      <option value="yearly">Tahunan</option>
                    </select>
                  </div>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-[1.5rem] border border-gray-100 dark:border-gray-700 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      Gunakan Target Angka?
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setNewTaskData({ ...newTaskData, hasLimit: !newTaskData.hasLimit })
                      }
                      className={`w-12 h-6 rounded-full transition-colors relative ${newTaskData.hasLimit ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${newTaskData.hasLimit ? 'left-7' : 'left-1'}`}
                      ></div>
                    </button>
                  </div>
                  {newTaskData.hasLimit && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="number"
                          placeholder="Target"
                          onChange={(e) =>
                            setNewTaskData({ ...newTaskData, targetValue: Number(e.target.value) })
                          }
                          className="px-4 py-2 border dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl"
                          disabled={isSubmitting}
                        />
                        <input
                          type="text"
                          placeholder="Satuan (Rp, kg...)"
                          onChange={(e) => setNewTaskData({ ...newTaskData, unit: e.target.value })}
                          className="px-4 py-2 border dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">
                          Input Per Klik?
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setNewTaskData({
                              ...newTaskData,
                              perCheckEnabled: !newTaskData.perCheckEnabled,
                            })
                          }
                          className={`w-12 h-6 rounded-full transition-colors relative ${newTaskData.perCheckEnabled ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${newTaskData.perCheckEnabled ? 'left-7' : 'left-1'}`}
                          ></div>
                        </button>
                      </div>
                      {newTaskData.perCheckEnabled && (
                        <input
                          type="number"
                          placeholder="Jumlah per klik"
                          onChange={(e) =>
                            setNewTaskData({
                              ...newTaskData,
                              incrementValue: Number(e.target.value),
                            })
                          }
                          className="w-full px-4 py-2 border dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl"
                          disabled={isSubmitting}
                        />
                      )}
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-primary-600 text-white font-bold rounded-2xl shadow-xl hover:bg-primary-700 transition disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Menyimpan...
                    </span>
                  ) : (
                    'Simpan Amanah'
                  )}
                </button>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}

      {isHistoryModalOpen && selectedTask && (
        <TaskHistoryModal
          task={selectedTask}
          onClose={() => setHistoryModalOpen(false)}
          onUpdateTask={(updated) => {
            setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
            setSelectedTask(updated);
          }}
        />
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

      {/* Custom Input Modal for hasLimit tasks */}
      {isCustomInputOpen && customInputTask && (
        <ModalPortal>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setIsCustomInputOpen(false)}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsCustomInputOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Tambah Progres
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {customInputTask.text}
              </p>

              <form onSubmit={handleCustomInputSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nilai ({customInputTask.unit || 'unit'})
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0.01"
                    value={customInputValue}
                    onChange={(e) => setCustomInputValue(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    placeholder="Masukkan nilai..."
                    autoFocus
                    required
                  />
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Progres saat ini: {customInputTask.currentValue?.toLocaleString() || 0} /{' '}
                    {customInputTask.targetValue?.toLocaleString() || 0} {customInputTask.unit}
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCustomInputOpen(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                  >
                    Tambah
                  </button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
};

const TaskHistoryModal: React.FC<{
  task: Task;
  onClose: () => void;
  onUpdateTask: (task: Task) => void;
}> = ({ task, onClose, onUpdateTask }) => {
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

  const handleDeleteHistory = async (entryId: number) => {
    showModal(
      'Hapus Entri Riwayat',
      'Apakah Anda yakin ingin menghapus entri riwayat ini untuk membatalkan progres?',
      'warning',
      async () => {
        try {
          await tasksApi.deleteHistory(task.id, entryId);
          const updatedTask = await tasksApi.getById(task.id);
          onUpdateTask(updatedTask);
        } catch (err) {
          showModal('Error', getErrorMessage(err), 'error');
        }
      },
      true
    );
  };

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 w-full h-full bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl w-full max-w-lg p-8 border dark:border-gray-700 animate-fadeIn"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold dark:text-white truncate pr-6">Riwayat Aktivitas</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border dark:border-gray-700">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">
              Amanah
            </p>
            <p className="text-sm font-bold text-gray-800 dark:text-gray-100 leading-tight">
              {task.text}
            </p>
          </div>

          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
            {task.history && task.history.length > 0 ? (
              task.history.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border dark:border-gray-700"
                >
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center">
                      <ClockIcon className="w-3 h-3 mr-1" />{' '}
                      {new Date(entry.timestamp).toLocaleString('id-ID')}
                    </p>
                    <div className="flex items-center mt-1">
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                        {entry.value > 0 ? '+' : ''}
                        {entry.value}
                      </span>
                      <span className="text-[10px] ml-1 text-gray-500 dark:text-gray-400">
                        {task.unit}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteHistory(entry.id)}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    title="Batalkan/Hapus"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-center py-8 text-sm text-gray-500 dark:text-gray-400 italic">
                Belum ada riwayat aktivitas.
              </p>
            )}
          </div>

          <div className="mt-8 pt-6 border-t dark:border-gray-700 text-right">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-200 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>

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
    </ModalPortal>
  );
};

export default TaskManager;
