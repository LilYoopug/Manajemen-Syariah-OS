
import React, { useState } from 'react';
import { DIRECTORY_DATA } from '../constants';
import type { DirectoryItem } from '@/types';
import { ChevronRightIcon, ChevronDownIcon } from './Icons';

const DirectoryNode: React.FC<{ item: DirectoryItem; level: number }> = ({ item, level }) => {
  const [isOpen, setIsOpen] = useState(level < 1); // Auto-open first level

  const hasChildren = item.children && item.children.length > 0;

  return (
    <div>
      <div
        className={`flex items-center p-2 rounded-lg cursor-pointer ${hasChildren ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : ''}`}
        style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
        onClick={() => hasChildren && setIsOpen(!isOpen)}
      >
        {hasChildren ? (
          isOpen ? <ChevronDownIcon className="w-4 h-4 mr-2 flex-shrink-0" /> : <ChevronRightIcon className="w-4 h-4 mr-2 flex-shrink-0" />
        ) : (
          <span className="w-4 h-4 mr-2 flex-shrink-0" />
        )}
        <span className="font-semibold text-gray-800 dark:text-gray-200">{item.title}</span>
      </div>

      {isOpen && (
        <div className="pl-4 border-l-2 border-gray-200 dark:border-gray-700 ml-3">
          {item.dalil && (
            <div className="p-3 my-2 ml-4 bg-secondary-50 dark:bg-secondary-900/40 rounded-lg">
              <p className="text-lg text-right font-serif text-secondary-800 dark:text-secondary-200">{item.dalil}</p>
              <p className="text-xs text-right text-gray-500 dark:text-gray-400 mt-1">{item.source}</p>
              <p className="text-sm mt-3 text-gray-700 dark:text-gray-300">{item.explanation}</p>
            </div>
          )}
          {hasChildren && item.children?.map(child => (
            <DirectoryNode key={child.id} item={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const Directory: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Directory Wawasan Manajemen Syariah</h2>
        <p className="mt-1 text-gray-600 dark:text-gray-400">Jelajahi landasan ilmu dari Qur'an, Sunnah, Maqasid, hingga prinsip aplikasi modern.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-md">
        {DIRECTORY_DATA.map(item => (
          <DirectoryNode key={item.id} item={item} level={0} />
        ))}
      </div>
    </div>
  );
};

export default Directory;
