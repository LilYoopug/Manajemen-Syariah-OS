
import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  WandSparklesIcon, ClipboardIcon, CheckIcon, 
  CalendarDaysIcon, UsersIcon, PaperAirplaneIcon, 
  DocumentCheckIcon, BookOpenIcon, SparklesIcon 
} from '@/components/common/Icons';

const syariahPrinciples = [
  "Amanah (Kepercayaan & Tanggung Jawab)",
  "Syura (Musyawarah)",
  "Adil (Keadilan)",
  "Profesionalisme (Itqan)",
  "Maslahah (Kemaslahatan Umum)",
  "Ridha (Kerelaan)",
];

interface StrategicPlan {
  title: string;
  summary: string;
  phases: {
    name: string;
    description: string;
    actions: string[];
  }[];
  maqasidSyariah: string;
}

const AIGenerator: React.FC = () => {
    const [goal, setGoal] = useState('');
    const [entityType, setEntityType] = useState('Bisnis');
    const [principles, setPrinciples] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [plan, setPlan] = useState<StrategicPlan | null>(null);
    const [error, setError] = useState('');
    const [isCopied, setIsCopied] = useState(false);

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
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const prompt = `Anda adalah konsultan strategis Manajemen Syariah. Buat rencana strategis POAC Islami (Planning, Organizing, Actuating, Controlling) untuk:
            Jenis Entitas: ${entityType}
            Tujuan: ${goal}
            Prinsip: ${principles.join(', ')}
            
            Berikan hasil dalam format JSON yang mendalam dan inspiratif.`;

            const response = await ai.models.generateContent({
                model: "gemini-3-pro-preview",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            summary: { type: Type.STRING },
                            phases: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        name: { type: Type.STRING, description: "Nama fase, misal: Perencanaan (Takhthith)" },
                                        description: { type: Type.STRING },
                                        actions: { type: Type.ARRAY, items: { type: Type.STRING } }
                                    },
                                    required: ["name", "description", "actions"]
                                }
                            },
                            maqasidSyariah: { type: Type.STRING, description: "Kaitan rencana ini dengan perlindungan agama, jiwa, akal, keturunan, atau harta." }
                        },
                        required: ["title", "summary", "phases", "maqasidSyariah"]
                    }
                }
            });

            const result = JSON.parse(response.text || '{}');
            setPlan(result);
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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-4 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 space-y-6">
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
                        className="w-full py-4 bg-primary-600 text-white font-bold rounded-xl shadow-lg hover:bg-primary-700 transition active:scale-95 disabled:bg-gray-300 flex items-center justify-center space-x-2"
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

                <div className="lg:col-span-8 min-h-[500px]">
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
                        <div className="h-full flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-12 text-center shadow-md">
                            <div className="relative mb-8">
                                <div className="w-20 h-20 border-4 border-primary-100 dark:border-gray-700 border-t-primary-600 rounded-full animate-spin"></div>
                                <WandSparklesIcon className="w-8 h-8 text-primary-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                            </div>
                            <p className="text-xl font-bold text-gray-800 dark:text-white tracking-tight">Sedang Merumuskan Strategi...</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Menyeimbangkan visi operasional dengan landasan keberkahan Syariah.</p>
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                            <div className="bg-gradient-to-r from-primary-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
                                    <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md self-start border border-white/20">
                                        <BookOpenIcon className="w-9 h-9 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold mb-1 tracking-tight">Penyelarasan Maqasid Syariah</h4>
                                        <p className="text-primary-50 text-sm leading-relaxed opacity-90 font-medium">
                                            {plan.maqasidSyariah}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIGenerator;
