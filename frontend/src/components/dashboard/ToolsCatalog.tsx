import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toolsApi, getErrorMessage } from '@/lib/api-services';
import ToolDetailModal from '@/components/dashboard/ToolDetailModal';
import type { Tool } from '@/types/api';
import { BriefcaseIcon, LinkIcon, ToolsIcon } from '@/components/common/Icons';
import { Skeleton, SkeletonText } from '@/components/common/Skeleton';

const ToolCard: React.FC<{ tool: Tool; onSelect: (tool: Tool) => void }> = ({ tool, onSelect }) => (
  <div
    onClick={() => onSelect(tool)}
    className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-50 dark:border-gray-700 flex flex-col items-start cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
  >
    <div className="p-3.5 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-xl mb-5 group-hover:border-primary-200 dark:group-hover:border-primary-900 transition-colors shadow-sm">
      <BriefcaseIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
    </div>
    <p className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-1">
      {tool.category}
    </p>
    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 leading-tight">
      {tool.name}
    </h3>
    <p className="text-sm text-gray-500 dark:text-gray-400 flex-grow mb-4 leading-relaxed line-clamp-2">
      {tool.description}
    </p>

    <div className="w-full flex items-center justify-between mt-auto pt-4 border-t border-gray-50 dark:border-gray-700">
      <span className="text-xs font-bold text-gray-400 dark:text-gray-500">Lihat Detail</span>
      {tool.link && (
        <a
          href={tool.link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="p-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition shadow-sm active:scale-95"
          title="Buka Link Tool"
        >
          <LinkIcon className="w-4 h-4" />
        </a>
      )}
    </div>
  </div>
);

const ToolsCatalog: React.FC = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTools = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await toolsApi.getAll();
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

  // Extract unique categories from tools data
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    tools.forEach((tool) => {
      if (tool.category) uniqueCategories.add(tool.category);
    });
    return ['All', ...Array.from(uniqueCategories).sort()];
  }, [tools]);

  const filteredTools =
    activeCategory === 'All' ? tools : tools.filter((tool) => tool.category === activeCategory);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
          <ToolsIcon className="w-8 h-8 mr-3 text-primary-600" />
          Katalog 25+ Tools Praktis
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Alat bantu praktis untuk individu, bisnis, lembaga, dan komunitas.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800/30">
          <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeCategory === category
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-transparent hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-sm'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center space-x-4 mb-4">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <SkeletonText lines={2} />
              <div className="mt-4 flex space-x-2">
                <Skeleton className="h-8 w-20 rounded-full" />
                <Skeleton className="h-8 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} onSelect={setSelectedTool} />
          ))}
        </div>
      )}

      {selectedTool && (
        <ToolDetailModal tool={selectedTool} onClose={() => setSelectedTool(null)} />
      )}
    </div>
  );
};

export default ToolsCatalog;
