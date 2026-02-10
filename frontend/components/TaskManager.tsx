
import React, { useState, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import type { Task, ResetCycle, HistoryEntry } from '../types';
import { 
    TrashIcon, CheckIcon, XMarkIcon, 
    ClipboardListIcon, PlusCircleIcon, PencilIcon, 
    ClockIcon
} from './Icons';

const INITIAL_TASKS: Task[] = [
  { 
    id: 't-1', 
    text: 'Audit Ketepatan Waktu Pembayaran Gaji', 
    completed: true, 
    category: 'SDM', 
    progress: 100, 
    hasLimit: false,
    resetCycle: 'monthly',
    perCheckEnabled: false,
    history: [{ id: 'h-1', timestamp: new Date().toISOString(), value: 1 }]
  }
];

const TaskManager: React.FC = () => {
  const [tasks, setTasks] = useLocalStorage<Task[]>('syariah_os_tasks', INITIAL_TASKS);
  const [categories] = useLocalStorage<string[]>('syariah_os_categories', ['SDM', 'Bisnis', 'Keuangan', 'Sosial', 'Kepatuhan', 'Umum']);
  
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
      incrementValue: 1
  });

  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [isHistoryModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskData.text.trim() === '') return;
    
    const progressValue = newTaskData.hasLimit && newTaskData.targetValue > 0 
        ? Math.min(100, (newTaskData.currentValue / newTaskData.targetValue) * 100)
        : 0;

    const newTask: Task = {
      id: Date.now().toString(),
      text: newTaskData.text,
      completed: newTaskData.hasLimit ? progressValue === 100 : false,
      category: newTaskData.category,
      progress: progressValue,
      hasLimit: newTaskData.hasLimit,
      currentValue: newTaskData.currentValue,
      targetValue: newTaskData.targetValue,
      unit: newTaskData.unit,
      resetCycle: newTaskData.resetCycle,
      perCheckEnabled: newTaskData.perCheckEnabled,
      incrementValue: newTaskData.incrementValue,
      subtasks: [],
      history: newTaskData.currentValue > 0 ? [{ id: 'init-' + Date.now(), timestamp: new Date().toISOString(), value: newTaskData.currentValue, note: 'Nilai Awal' }] : [],
      lastResetAt: new Date().toISOString()
    };

    setTasks(prev => [newTask, ...prev]);
    setIsAddModalOpen(false);
    setNewTaskData({ text: '', category: 'Umum', hasLimit: false, currentValue: 0, targetValue: 0, unit: '', resetCycle: 'one-time', perCheckEnabled: false, incrementValue: 1 });
  };

  const handleToggleTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    setTasks(currentTasks => currentTasks.map(t => {
      if (t.id === id) {
        if (t.hasLimit && t.perCheckEnabled && !t.completed) {
            const inc = t.incrementValue || 1;
            const newVal = Math.min((t.currentValue || 0) + inc, (t.targetValue || 1));
            const progress = (newVal / (t.targetValue || 1)) * 100;
            const historyEntry: HistoryEntry = { id: Date.now().toString(), timestamp: new Date().toISOString(), value: inc };
            return { ...t, currentValue: newVal, progress, completed: newVal >= (t.targetValue || 1), history: [historyEntry, ...t.history] };
        }

        const newCompleted = !t.completed;
        const updatedVal = newCompleted ? (t.targetValue || 1) : 0;
        const entry: HistoryEntry = { id: Date.now().toString(), timestamp: new Date().toISOString(), value: newCompleted ? (t.hasLimit ? t.targetValue || 1 : 1) : -(t.currentValue || 0) };
        return { ...t, completed: newCompleted, currentValue: updatedVal, progress: newCompleted ? 100 : 0, history: [entry, ...t.history] };
      }
      return t;
    }));
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const categoryMatch = !filterCategory || task.category === filterCategory;
      const searchMatch = !searchQuery || task.text.toLowerCase().includes(searchQuery.toLowerCase());
      return categoryMatch && searchMatch;
    });
  }, [tasks, filterCategory, searchQuery]);

  const openHistoryModal = (task: Task) => {
    setSelectedTask(task);
    setHistoryModalOpen(true);
  };

  const getCycleLabel = (cycle: ResetCycle) => {
    switch(cycle) {
        case 'daily': return 'Harian';
        case 'weekly': return 'Mingguan';
        case 'monthly': return 'Bulanan';
        case 'yearly': return 'Tahunan';
        default: return 'Sekali';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">Daftar Tugas Amanah</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Pusat kendali operasional dan target berkelanjutan.</p>
        </div>
        <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center px-6 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition shadow-lg active:scale-95 text-sm"
        >
            <PlusCircleIcon className="w-5 h-5 mr-2" />
            Tambah Tugas Amanah
        </button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari tugas..."
                className="w-full pl-12 pr-5 py-3 text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all shadow-sm"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <ClipboardListIcon className="w-5 h-5" />
            </div>
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
            <button onClick={() => setFilterCategory(null)} className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${!filterCategory ? 'bg-primary-600 text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50'}`}>Semua</button>
            {categories.map(cat => (
                <button key={cat} onClick={() => setFilterCategory(cat)} className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${filterCategory === cat ? 'bg-primary-600 text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50'}`}>{cat}</button>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredTasks.map(task => {
          const percentage = task.hasLimit ? Math.min(Math.round((task.progress || 0)), 100) : 0;
          return (
            <div key={task.id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 flex flex-col group transition-all hover:shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1 min-w-0 mr-4">
                    <button
                        onClick={() => handleToggleTask(task.id)}
                        className={`h-7 w-7 rounded-lg border-2 flex items-center justify-center transition-all ${
                            task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 dark:border-gray-600 hover:border-primary-500 text-transparent'
                        } cursor-pointer active:scale-90`}
                    >
                        <CheckIcon className="w-5 h-5" />
                    </button>
                    <div className="ml-4 truncate">
                        <div className="flex items-center gap-2">
                             <h4 className={`text-base font-bold text-gray-900 dark:text-white truncate ${task.completed ? 'line-through text-gray-400' : ''}`}>
                                {task.text}
                            </h4>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest">{task.category}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{getCycleLabel(task.resetCycle)}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openHistoryModal(task)} className="p-2 text-gray-400 hover:text-primary-600 transition-all" title="Riwayat Progres"><ClockIcon className="w-4 h-4"/></button>
                    <button onClick={() => setTasks(prev => prev.filter(t => t.id !== task.id))} className="p-2 text-gray-400 hover:text-red-500 transition-all"><TrashIcon className="w-4 h-4" /></button>
                </div>
              </div>

              {task.hasLimit && (
                <div className="mt-4">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Progres Capaian Target</span>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      {task.currentValue?.toLocaleString() || 0} / {task.targetValue?.toLocaleString() || 0} {task.unit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                    <div className={`h-2.5 rounded-full transition-all duration-700 ${task.completed ? 'bg-emerald-500' : 'bg-primary-600'}`} style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl w-full max-w-lg border border-gray-100 dark:border-gray-700 p-8 animate-fadeIn relative max-h-[90vh] overflow-y-auto">
                <button onClick={() => setIsAddModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"><XMarkIcon className="w-6 h-6" /></button>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Tambah Amanah Baru</h3>
                <form onSubmit={handleAddTask} className="space-y-5">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Deskripsi</label>
                        <input required type="text" autoFocus value={newTaskData.text} onChange={(e) => setNewTaskData({...newTaskData, text: e.target.value})} className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border border-transparent rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none text-sm transition-all" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 ml-1">Kategori</label>
                            <select value={newTaskData.category} onChange={e => setNewTaskData({...newTaskData, category: e.target.value})} className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border border-transparent rounded-2xl text-sm cursor-pointer outline-none">
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 ml-1">Siklus Reset</label>
                            <select value={newTaskData.resetCycle} onChange={e => setNewTaskData({...newTaskData, resetCycle: e.target.value as ResetCycle})} className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border border-transparent rounded-2xl text-sm cursor-pointer outline-none">
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
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Gunakan Target Angka?</span>
                            <button type="button" onClick={() => setNewTaskData({...newTaskData, hasLimit: !newTaskData.hasLimit})} className={`w-12 h-6 rounded-full transition-colors relative ${newTaskData.hasLimit ? 'bg-primary-600' : 'bg-gray-300'}`}>
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${newTaskData.hasLimit ? 'left-7' : 'left-1'}`}></div>
                            </button>
                        </div>
                        {newTaskData.hasLimit && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="number" placeholder="Target" onChange={e => setNewTaskData({...newTaskData, targetValue: Number(e.target.value)})} className="px-4 py-2 border dark:border-gray-700 dark:bg-gray-800 rounded-xl" />
                                    <input type="text" placeholder="Satuan (Rp, kg...)" onChange={e => setNewTaskData({...newTaskData, unit: e.target.value})} className="px-4 py-2 border dark:border-gray-700 dark:bg-gray-800 rounded-xl" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Input Per Klik?</span>
                                    <button type="button" onClick={() => setNewTaskData({...newTaskData, perCheckEnabled: !newTaskData.perCheckEnabled})} className={`w-12 h-6 rounded-full transition-colors relative ${newTaskData.perCheckEnabled ? 'bg-primary-600' : 'bg-gray-300'}`}>
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${newTaskData.perCheckEnabled ? 'left-7' : 'left-1'}`}></div>
                                    </button>
                                </div>
                                {newTaskData.perCheckEnabled && <input type="number" placeholder="Jumlah per klik" onChange={e => setNewTaskData({...newTaskData, incrementValue: Number(e.target.value)})} className="w-full px-4 py-2 border dark:border-gray-700 dark:bg-gray-800 rounded-xl" />}
                            </div>
                        )}
                    </div>
                    <button type="submit" className="w-full py-4 bg-primary-600 text-white font-bold rounded-2xl shadow-xl hover:bg-primary-700 transition">Simpan Amanah</button>
                </form>
              </div>
          </div>
      )}

      {isHistoryModalOpen && selectedTask && (
        <TaskHistoryModal 
          task={selectedTask}
          onClose={() => setHistoryModalOpen(false)}
          onUpdateTask={(updated) => {
              setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
              setSelectedTask(updated);
          }}
        />
      )}
    </div>
  );
};

const TaskHistoryModal: React.FC<{ task: Task; onClose: () => void; onUpdateTask: (task: Task) => void }> = ({ task, onClose, onUpdateTask }) => {
    const handleUpdateHistory = (id: string, newVal: string) => {
        const value = Number(newVal);
        const updatedHistory = task.history.map(h => h.id === id ? { ...h, value } : h);
        const totalValue = updatedHistory.reduce((sum, h) => sum + h.value, 0);
        onUpdateTask({ 
            ...task, 
            history: updatedHistory, 
            currentValue: totalValue, 
            progress: task.hasLimit ? (totalValue / (task.targetValue || 1)) * 100 : 0, 
            completed: task.hasLimit ? totalValue >= (task.targetValue || 1) : task.completed 
        });
    };

    const handleDeleteHistory = (id: string) => {
        const updatedHistory = task.history.filter(h => h.id !== id);
        const totalValue = updatedHistory.reduce((sum, h) => sum + h.value, 0);
        onUpdateTask({ 
            ...task, 
            history: updatedHistory, 
            currentValue: totalValue, 
            progress: task.hasLimit ? (totalValue / (task.targetValue || 1)) * 100 : 0, 
            completed: task.hasLimit ? totalValue >= (task.targetValue || 1) : (updatedHistory.length === 0 ? false : task.completed)
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl w-full max-w-lg p-8 border dark:border-gray-700 animate-fadeIn" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold dark:text-white truncate pr-6">Riwayat Aktivitas</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"><XMarkIcon className="w-5 h-5" /></button>
                </div>
                
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border dark:border-gray-700">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Amanah</p>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100 leading-tight">{task.text}</p>
                </div>

                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                    {task.history.length > 0 ? task.history.map(entry => (
                        <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border dark:border-gray-700">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center"><ClockIcon className="w-3 h-3 mr-1" /> {new Date(entry.timestamp).toLocaleString('id-ID')}</p>
                                <div className="flex items-center mt-1">
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{entry.value > 0 ? '+' : ''}{entry.value}</span>
                                    <span className="text-[10px] ml-1 text-gray-500">{task.unit}</span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-1">
                                <button onClick={() => {
                                    const n = prompt('Edit nilai progres:', entry.value.toString());
                                    if (n !== null) handleUpdateHistory(entry.id, n);
                                }} className="p-2 text-gray-400 hover:text-primary-600"><PencilIcon className="w-4 h-4"/></button>
                                <button onClick={() => {
                                    if(confirm('Hapus entri riwayat ini?')) handleDeleteHistory(entry.id);
                                }} className="p-2 text-gray-400 hover:text-red-500"><TrashIcon className="w-4 h-4"/></button>
                            </div>
                        </div>
                    )) : <p className="text-center py-8 text-sm text-gray-500 italic">Belum ada riwayat aktivitas.</p>}
                </div>

                <div className="mt-8 pt-6 border-t dark:border-gray-700 text-right">
                    <button onClick={onClose} className="px-8 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-200 transition-colors">Tutup</button>
                </div>
            </div>
        </div>
    );
};

export default TaskManager;
