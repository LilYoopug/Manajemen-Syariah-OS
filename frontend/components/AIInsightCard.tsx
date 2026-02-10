
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { SparklesIcon } from './Icons';
import type { Kpi, Goal } from '@/types';

interface AIInsightCardProps {
  kpiData: Kpi[];
  goalData: Goal[];
}

const AIInsightCard: React.FC<AIInsightCardProps> = ({ kpiData, goalData }) => {
  const [insight, setInsight] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatDataForPrompt = () => {
    const kpiString = kpiData.map(k => `- ${k.title}: ${k.value} (perubahan: ${k.change})`).join('\n');
    const goalString = goalData.map(g => {
        const percentage = Math.round((g.progress / g.target) * 100);
        return `- ${g.title}: ${percentage}% selesai (${g.progress.toLocaleString()} dari ${g.target.toLocaleString()} ${g.unit})`;
    }).join('\n');

    return `
Anda adalah seorang konsultan Manajemen Syariah yang ahli dan bijaksana. Berdasarkan data mingguan berikut, berikan sebuah ringkasan singkat dan satu insight yang paling penting dan bisa ditindaklanjuti untuk perbaikan.

Gunakan bahasa Indonesia yang formal, positif, dan memotivasi. Fokus pada perbaikan berkelanjutan dari perspektif Islam (ihsan, itqan, amanah).

**Data Kinerja Utama (KPI):**
${kpiString}

**Progres Tujuan (Goals):**
${goalString}

Struktur jawaban Anda sebagai berikut, gunakan markdown **tebal** untuk judul:
**Ringkasan Mingguan:** [Ringkasan singkat performa secara umum]
**Insight Utama:** [Satu insight paling penting]
**Rekomendasi:** [Satu langkah konkret yang bisa diambil]
    `;
  };

  const handleGenerateInsight = async () => {
    setIsLoading(true);
    setError(null);
    setInsight('');

    try {
      const prompt = formatDataForPrompt();
      // FIX: Ensure API key is used directly and use 'gemini-3-flash-preview'.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt,
      });

      // FIX: Use .text property directly.
      setInsight(response.text || '');

    } catch (err) {
      console.error("Error generating AI insight:", err);
      setError("Terjadi kesalahan saat mencoba menghasilkan insight. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderInsight = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-semibold text-gray-800 dark:text-gray-200">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-primary-200 dark:border-primary-700/50">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
            <SparklesIcon className="w-6 h-6 mr-3 text-primary-500" />
            Insight Mingguan dari AI
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Dapatkan ringkasan dan rekomendasi berbasis data Anda.</p>
        </div>
        <button 
          onClick={handleGenerateInsight} 
          disabled={isLoading}
          className="flex-shrink-0 items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-400 disabled:cursor-not-allowed transition"
        >
          {isLoading ? 'Menganalisis...' : 'Hasilkan Insight'}
        </button>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        {isLoading && (
            <div className="flex justify-center items-center h-24">
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                </div>
            </div>
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}
        {insight ? (
          <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
            {renderInsight(insight)}
          </div>
        ) : (
          !isLoading && !error && <p className="text-sm text-center text-gray-500 dark:text-gray-400 py-4">Klik "Hasilkan Insight" untuk mendapatkan analisis AI tentang kinerja Anda.</p>
        )}
      </div>
    </div>
  );
};

export default AIInsightCard;
