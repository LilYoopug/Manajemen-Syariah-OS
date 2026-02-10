import React from 'react';
import type { DirectoryItem } from '@/types';
import { XMarkIcon } from './Icons';

interface DirectoryDetailModalProps {
  item: DirectoryItem;
  onClose: () => void;
}

const DirectoryDetailModal: React.FC<DirectoryDetailModalProps> = ({ item, onClose }) => {
  if (!item.dalil && !item.explanation) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-8 relative"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{item.title}</h2>
        
        {item.dalil && (
          <div className="p-4 mt-4 bg-secondary-50 dark:bg-secondary-900/40 border-l-4 border-secondary-500 rounded-r-lg">
            <p className="text-2xl text-right font-serif text-secondary-800 dark:text-secondary-200">{item.dalil}</p>
            {item.source && (
              <p className="text-sm text-right text-gray-500 dark:text-gray-400 mt-2">- {item.source}</p>
            )}
          </div>
        )}
        
        {item.explanation && (
          <div className="mt-6 pl-4 border-l-4 border-gray-200 dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Penjelasan
            </h3>
            <p className="text-md text-gray-700 dark:text-gray-300 leading-relaxed">
              {item.explanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectoryDetailModal;
