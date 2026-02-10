
import React from 'react';
import type { Goal } from '@/types';

const GoalTracker: React.FC<Goal> = ({ title, target, progress, unit }) => {
  const percentage = Math.min(Math.round((progress / target) * 100), 100);

  return (
    <div>
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</span>
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
          {progress.toLocaleString()} / {target.toLocaleString()} {unit !== '%' ? unit : ''}
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
        <div
          className="bg-primary-600 h-2.5 rounded-full"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default GoalTracker;
