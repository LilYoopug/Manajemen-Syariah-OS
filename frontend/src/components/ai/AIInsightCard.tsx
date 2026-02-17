
import React, { useState } from 'react';
import { aiApi, getErrorMessage } from '@/lib/api-services';
import { SparklesIcon, CheckCircleIcon } from '@/components/common/Icons';
import { Skeleton, SkeletonText } from '@/components/common/Skeleton';

interface KpiData {
  title: string;
  value: string | number;
  change: string;
}

interface GoalData {
  id: string;
  title: string;
  target: number;
  progress: number;
  unit: string;
  resetCycle?: string;
}

interface AIInsightCardProps {
  kpiData?: KpiData[];
  goalData?: GoalData[];
}

// Simple markdown parser for common formatting
const parseMarkdown = (text: string): React.ReactNode[] => {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let inList = false;
  let key = 0;

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={key++} className="list-disc list-inside space-y-1 mb-3 ml-2">
          {listItems.map((item, idx) => (
            <li key={idx} className="text-gray-600 dark:text-gray-300">
              {parseInline(item)}
            </li>
          ))}
        </ul>
      );
      listItems = [];
    }
    inList = false;
  };

  const parseInline = (str: string): React.ReactNode => {
    // Bold text **text**
    const parts = str.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={idx} className="font-semibold text-gray-800 dark:text-gray-100">
            {part.slice(2, -2)}
          </strong>
        );
      }
      // Italic text *text*
      const italicParts = part.split(/(\*[^*]+\*)/g);
      return italicParts.map((ip, iidx) => {
        if (ip.startsWith('*') && ip.endsWith('*')) {
          return (
            <em key={`${idx}-${iidx}`} className="italic">
              {ip.slice(1, -1)}
            </em>
          );
        }
        return ip;
      });
    });
  };

  lines.forEach((line) => {
    const trimmedLine = line.trim();

    // Empty line
    if (!trimmedLine) {
      if (inList) flushList();
      return;
    }

    // Headers - check from longest first
    if (trimmedLine.startsWith('#### ')) {
      if (inList) flushList();
      elements.push(
        <h5 key={key++} className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-3 mb-1">
          {trimmedLine.slice(5)}
        </h5>
      );
      return;
    }
    if (trimmedLine.startsWith('### ')) {
      if (inList) flushList();
      elements.push(
        <h4 key={key++} className="text-base font-semibold text-primary-700 dark:text-primary-300 mt-4 mb-2">
          {trimmedLine.slice(4)}
        </h4>
      );
      return;
    }
    if (trimmedLine.startsWith('## ')) {
      if (inList) flushList();
      elements.push(
        <h3 key={key++} className="text-lg font-semibold text-primary-800 dark:text-primary-200 mt-5 mb-2 pb-1 border-b border-gray-200 dark:border-gray-600">
          {trimmedLine.slice(3)}
        </h3>
      );
      return;
    }
    if (trimmedLine.startsWith('# ')) {
      if (inList) flushList();
      elements.push(
        <h2 key={key++} className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-4 mb-3">
          {trimmedLine.slice(2)}
        </h2>
      );
      return;
    }

    // Horizontal rule
    if (trimmedLine === '---') {
      if (inList) flushList();
      elements.push(
        <hr key={key++} className="my-4 border-gray-200 dark:border-gray-600" />
      );
      return;
    }

    // List items
    if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      inList = true;
      listItems.push(trimmedLine.slice(2));
      return;
    }

    // Numbered list items
    const numberedMatch = trimmedLine.match(/^\d+\.\s+(.+)$/);
    if (numberedMatch) {
      inList = true;
      listItems.push(numberedMatch[1]);
      return;
    }

    // Regular paragraph
    if (inList) flushList();
    elements.push(
      <p key={key++} className="text-gray-600 dark:text-gray-300 mb-2 leading-relaxed">
        {parseInline(trimmedLine)}
      </p>
    );
  });

  if (inList) flushList();
  return elements;
};

const AIInsightCard: React.FC<AIInsightCardProps> = ({ kpiData = [], goalData = [] }) => {
  const [insight, setInsight] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateInsight = async () => {
    setIsLoading(true);
    setError(null);
    setInsight('');

    try {
      const result = await aiApi.insight({
        kpiData: (kpiData || []).reduce((acc, k) => {
          if (k?.title) {
            acc[k.title] = { value: k.value, change: k.change };
          }
          return acc;
        }, {} as Record<string, unknown>),
        goalData: (goalData || []).reduce((acc, g) => {
          if (g?.title) {
            acc[g.title] = {
              progress: g.progress,
              target: g.target,
              unit: g.unit,
              period: g.resetCycle || 'one-time'
            };
          }
          return acc;
        }, {} as Record<string, unknown>),
      });
      setInsight(result.insights || '');
    } catch (err) {
      console.error("Error generating AI insight:", err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-primary-50/30 dark:from-gray-800 dark:to-primary-900/10 p-6 rounded-2xl shadow-md border border-primary-100 dark:border-primary-700/30">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-primary-100 dark:bg-primary-800/30 rounded-xl">
            <SparklesIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Insight Aktivitas dari AI
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Dapatkan saran dan motivasi berbasis aktivitas Anda.
            </p>
          </div>
        </div>
        <button
          onClick={handleGenerateInsight}
          disabled={isLoading}
          className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-400 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Memproses...
            </>
          ) : (
            <>
              <SparklesIcon className="w-4 h-4" />
              Hasilkan Insight
            </>
          )}
        </button>
      </div>

      <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
        {isLoading && (
          <div className="py-4">
            <div className="flex items-center gap-2 mb-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
            <SkeletonText lines={5} className="max-w-2xl" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800/30">
            <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {insight ? (
          <div className="bg-white dark:bg-gray-700/50 p-5 rounded-xl border border-gray-100 dark:border-gray-600 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-gray-600">
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Saran dari AI</span>
            </div>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              {parseMarkdown(insight)}
            </div>
          </div>
        ) : (
          !isLoading && !error && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full mb-3">
                <SparklesIcon className="w-6 h-6 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Klik "Hasilkan Insight" untuk mendapatkan saran dan motivasi dari AI.
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default AIInsightCard;
