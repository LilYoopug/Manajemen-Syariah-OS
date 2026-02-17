
import React, { useState } from 'react';
import { aiApi, tasksApi } from '@/lib/api-services';
import { 
  WandSparklesIcon, ClipboardIcon, CheckIcon, 
  CalendarDaysIcon, UsersIcon, PaperAirplaneIcon, 
  DocumentCheckIcon, BookOpenIcon, SparklesIcon,
  PlusIcon, XMarkIcon
} from '@/components/common/Icons';
import { Skeleton, SkeletonText } from '@/components/common/Skeleton';

const syariahPrinciples = [
  "Amanah (Kepercayaan & Tanggung Jawab)",
  "Syura (Musyawarah)",
  "Adil (Keadilan)",
  "Profesionalisme (Itqan)",
  "Maslahah (Kemaslahatan Umum)",
  "Ridha (Kerelaan)",
];

interface SuggestedTask {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  resetCycle?: 'one-time' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  hasLimit?: boolean;
  targetValue?: number;
  unit?: string;
  incrementValue?: number;
  perCheckEnabled?: boolean;
}

interface StrategicPlan {
  title: string;
  summary: string;
  phases: {
    name: string;
    description: string;
    actions: string[];
  }[];
  maqasidSyariah: string;
  suggestedTasks: SuggestedTask[];
}

const AIGenerator: React.FC = () => {
    const [goal, setGoal] = useState('');
    const [entityType, setEntityType] = useState('Bisnis');
    const [principles, setPrinciples] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [plan, setPlan] = useState<StrategicPlan | null>(null);
    const [error, setError] = useState('');
    const [isCopied, setIsCopied] = useState(false);
    const [acceptedTasks, setAcceptedTasks] = useState<Set<number>>(new Set());
    const [addingTaskId, setAddingTaskId] = useState<number | null>(null);

    const handlePrincipleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        if (checked) {
            setPrinciples(prev => [...prev, value]);
        } else {
            setPrinciples(prev => prev.filter(p => p !== value));
        }
    };
    
    const handleGenerate = async () => {
        if (!goal.trim()) {
            setError('Tujuan utama tidak boleh kosong.');
            return;
        }
        setIsLoading(true);
        setError('');
        setPlan(null);

        try {
            const context = `Jenis Entitas: ${entityType}\nPrinsip: ${principles.join(', ')}`;
            const result = await aiApi.generatePlan({
                goals: goal,
                context: context,
            });

            // Parse the plan JSON from the response
            const planData = JSON.parse(result.plan);
            setPlan(planData);
        } catch (err) {
            console.error("Error generating plan:", err);
            setError("Terjadi kesalahan saat menyusun rencana strategis. Silakan coba lagi.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        if (!plan) return;
        const text = `${plan.title}\n\nRingkasan: ${plan.summary}\n\n` + 
                     plan.phases.map(p => `${p.name}\n${p.actions.map(a => `- ${a}`).join('\n')}`).join('\n\n') +
                     `\n\nMaqasid Syariah: ${plan.maqasidSyariah}`;
        navigator.clipboard.writeText(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleAcceptTask = async (index: number) => {
        if (!plan?.suggestedTasks[index]) return;
        
        const task = plan.suggestedTasks[index];
        setAddingTaskId(index);
        
        try {
            await tasksApi.create({
                text: task.title,
                category: task.category,
                resetCycle: task.resetCycle || 'one-time',
                hasLimit: task.hasLimit || false,
                targetValue: task.targetValue,
                unit: task.unit,
                incrementValue: task.incrementValue,
                perCheckEnabled: task.perCheckEnabled || false,
            });
            setAcceptedTasks(prev => new Set([...prev, index]));
        } catch (err) {
            console.error('Failed to add task:', err);
        } finally {
            setAddingTaskId(null);
        }
    };

    const handleRejectTask = (index: number) => {
        setAcceptedTasks(prev => new Set([...prev, index]));
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
            case 'medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
            case 'low': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
            default: return 'text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
        }
    };

    const getPriorityLabel = (priority: string) => {
        switch (priority) {
            case 'high': return 'Prioritas Tinggi';
            case 'medium': return 'Prioritas Sedang';
            case 'low': return 'Prioritas Rendah';
            default: return priority;
        }
    };

    const getPhaseIcon = (name: string) => {
        const n = name.toLowerCase();
        if (n.includes('takhthith') || n.includes('planning')) return <CalendarDaysIcon className="w-6 h-6" />;
        if (n.includes('tanzhim') || n.includes('organizing')) return <UsersIcon className="w-6 h-6" />;
        if (n.includes('tawjih') || n.includes('actuating')) return <PaperAirplaneIcon className="w-6 h-6" />;
        if (n.includes('riqabah') || n.includes('controlling')) return <DocumentCheckIcon className="w-6 h-6" />;
        return <SparklesIcon className="w-6 h-6" />;
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                    <WandSparklesIcon className="w-8 h-8 mr-3 text-primary-600"/>
                    AI Strategic Planner
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Rancang roadmap keberkahan dengan kerangka POAC Islami dan kecerdasan AI.</p>
            </div>

            <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 space-y-6">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">Tujuan Utama</label>
                        <textarea
                            rows={4}
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            placeholder="Contoh: Membangun unit usaha laundry syariah yang dikelola oleh pemuda masjid."
                            className="w-full px-4 py-3 text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 border border-transparent rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Jenis Entitas</label>
                        <select
                            value={entityType}
                            onChange={(e) => setEntityType(e.target.value)}
                            className="w-full px-4 py-3 text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 border border-transparent rounded-xl focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer shadow-sm"
                        >
                            <option>Bisnis / UMKM</option>
                            <option>Lembaga / Yayasan</option>
                            <option>Masjid / DKM</option>
                            <option>Pribadi / Keluarga</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 ml-1">Prinsip Prioritas</label>
                        <div className="grid grid-cols-1 gap-1.5">
                            {syariahPrinciples.map(p => (
                                <label key={p} className="flex items-center p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors group">
                                    <input
                                        type="checkbox"
                                        value={p}
                                        checked={principles.includes(p)}
                                        onChange={handlePrincipleChange}
                                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                    />
                                    <span className="ml-3 text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{p}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="w-full py-4 bg-primary-600 text-white font-bold rounded-xl shadow-lg hover:bg-primary-700 transition active:scale-95 disabled:bg-gray-300 dark:disabled:bg-gray-600 flex items-center justify-center space-x-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Menganalisis...</span>
                            </>
                        ) : (
                            <>
                                <WandSparklesIcon className="w-5 h-5" />
                                <span>Hasilkan Rencana</span>
                            </>
                        )}
                    </button>
                    {error && <p className="text-xs text-red-500 text-center">{error}</p>}
                </div>

                <div className="min-h-[500px]">
                    {!plan && !isLoading && (
                        <div className="h-full flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-100 dark:border-gray-700 p-12 text-center shadow-md">
                            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-2xl flex items-center justify-center mb-6 border dark:border-gray-700">
                                <SparklesIcon className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">Siap Merencanakan?</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">Isi tujuan strategis Anda di samping dan biarkan AI merumuskan langkah taktis berbasis Syariah.</p>
                        </div>
                    )}

                    {isLoading && (
                        <div className="space-y-6 animate-fadeIn pb-8">
                            {/* Header Skeleton */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-md border border-gray-100 dark:border-gray-700">
                                <Skeleton className="h-4 w-32 mb-4" />
                                <Skeleton className="h-10 w-3/4 mb-4" />
                                <SkeletonText lines={3} />
                            </div>
                            
                            {/* Phases Skeleton */}
                            <div className="space-y-6">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center space-x-4 mb-4">
                                            <Skeleton className="w-12 h-12 rounded-xl" />
                                            <Skeleton className="h-6 w-48" />
                                        </div>
                                        <Skeleton className="h-4 w-full mb-4" />
                                        <div className="space-y-2">
                                            {Array.from({ length: 3 }).map((_, j) => (
                                                <Skeleton key={j} className="h-10 w-full rounded-xl" />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Maqasid Skeleton */}
                            <div className="bg-gradient-to-r from-primary-600/20 to-indigo-600/20 rounded-2xl p-8">
                                <div className="flex items-center space-x-4">
                                    <Skeleton className="w-16 h-16 rounded-2xl" />
                                    <div className="flex-1">
                                        <Skeleton className="h-6 w-48 mb-2" />
                                        <SkeletonText lines={2} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {plan && !isLoading && (
                        <div className="space-y-6 animate-fadeIn pb-8">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-md border border-gray-100 dark:border-gray-700 relative">
                                <div className="absolute top-6 right-6">
                                    <button 
                                        onClick={handleCopy}
                                        className="p-3 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-xl text-gray-500 dark:text-gray-400 hover:text-primary-600 transition shadow-sm active:scale-95"
                                        title="Salin Rencana"
                                    >
                                        {isCopied ? <CheckIcon className="w-5 h-5 text-emerald-500" /> : <ClipboardIcon className="w-5 h-5" />}
                                    </button>
                                </div>

                                <div className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 mb-4">
                                    <SparklesIcon className="w-5 h-5" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Master Roadmap Syariah</span>
                                </div>
                                
                                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 pr-12 leading-tight tracking-tight">
                                    {plan.title}
                                </h3>
                                <div className="p-5 bg-gray-50 dark:bg-gray-900/50 rounded-xl border-l-4 border-primary-500 shadow-inner">
                                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed italic">
                                        "{plan.summary}"
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {plan.phases.map((phase, i) => (
                                    <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 flex flex-col h-full hover:border-primary-200 dark:hover:border-primary-900 transition-all group">
                                        <div className="flex items-center space-x-4 mb-4">
                                            <div className="p-3 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 text-primary-600 dark:text-primary-400 rounded-xl group-hover:scale-110 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/30 transition-all shadow-sm">
                                                {getPhaseIcon(phase.name)}
                                            </div>
                                            <h4 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">{phase.name}</h4>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">
                                            {phase.description}
                                        </p>
                                        <div className="space-y-2.5 mt-auto">
                                            {phase.actions.map((action, ai) => (
                                                <div key={ai} className="flex items-start bg-gray-50/50 dark:bg-gray-900/40 p-3 rounded-xl border border-transparent group-hover:border-gray-100 dark:group-hover:border-gray-700 transition-all">
                                                    <div className="mt-2 w-1.5 h-1.5 bg-primary-500 rounded-full flex-shrink-0 mr-4 shadow-sm shadow-primary-500/50"></div>
                                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-relaxed">{action}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-gradient-to-r from-primary-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-4">
                                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md self-start border border-white/20">
                                        <BookOpenIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold mb-1 tracking-tight">Penyelarasan Maqasid Syariah</h4>
                                        <p className="text-primary-50 text-sm leading-relaxed opacity-90 font-medium">
                                            {plan.maqasidSyariah}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Suggested Tasks Section */}
                            {plan.suggestedTasks && plan.suggestedTasks.length > 0 && (
                                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center space-x-2 mb-4">
                                        <SparklesIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400">Daftar Tugas yang Disarankan</span>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        {plan.suggestedTasks.map((task, i) => {
                                            const isAccepted = acceptedTasks.has(i);
                                            const isAdding = addingTaskId === i;
                                            
                                            return (
                                                <div 
                                                    key={i} 
                                                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                                                        isAccepted 
                                                            ? 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 opacity-60' 
                                                            : 'bg-gray-50/50 dark:bg-gray-900/30 border-gray-100 dark:border-gray-800 hover:border-primary-200 dark:hover:border-primary-800'
                                                    }`}
                                                >
                                                    <div className="flex-1 min-w-0 mr-3">
                                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                            <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                                                                {getPriorityLabel(task.priority)}
                                                            </span>
                                                            <span className="text-[9px] text-gray-400 dark:text-gray-500 uppercase">
                                                                {task.category}
                                                            </span>
                                                            {task.resetCycle && task.resetCycle !== 'one-time' && (
                                                                <span className="text-[9px] text-primary-500 dark:text-primary-400 uppercase">
                                                                    • {task.resetCycle === 'daily' ? 'Harian' : task.resetCycle === 'weekly' ? 'Mingguan' : task.resetCycle === 'monthly' ? 'Bulanan' : 'Tahunan'}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className={`text-sm font-medium ${isAccepted ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-300'}`}>
                                                            {task.title}
                                                        </p>
                                                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                                                            {task.description}
                                                        </p>
                                                        {task.hasLimit && task.targetValue && (
                                                            <div className="flex items-center gap-2 mt-1.5">
                                                                <span className="text-[9px] font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded-full">
                                                                    Target: {task.targetValue.toLocaleString()} {task.unit || ''}
                                                                </span>
                                                                {task.perCheckEnabled && (
                                                                    <span className="text-[9px] text-gray-400 dark:text-gray-500">
                                                                        +{task.incrementValue || 1} per klik
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    {!isAccepted ? (
                                                        <div className="flex gap-1">
                                                            <button
                                                                onClick={() => handleAcceptTask(i)}
                                                                disabled={isAdding}
                                                                className="p-2 text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition disabled:opacity-50"
                                                                title="Tambahkan ke daftar tugas"
                                                            >
                                                                {isAdding ? (
                                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                                ) : (
                                                                    <PlusIcon className="w-4 h-4" />
                                                                )}
                                                            </button>
                                                            <button
                                                                onClick={() => handleRejectTask(i)}
                                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                                                                title="Tolak tugas"
                                                            >
                                                                <XMarkIcon className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1 text-emerald-500 text-[10px] font-medium">
                                                            <CheckIcon className="w-4 h-4" />
                                                            <span>Ditambahkan</span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIGenerator;
