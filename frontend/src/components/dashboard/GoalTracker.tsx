import React from 'react';
import type { Goal } from '@/types';
import { Skeleton } from '@/components/common/Skeleton';

interface GoalTrackerProps extends Goal {
  isLoading?: boolean;
}

const GoalTracker: React.FC<GoalTrackerProps> = ({
  title,
  target,
  progress,
  unit,
  deadline,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center mb-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-2 w-full rounded-full mb-2" />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    );
  }

  const percentage = Math.min(Math.round((progress / target) * 100), 100);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">{deadline}</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
        <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
      </div>
      <div className="flex justify-between text-xs">
        <span className="font-semibold text-gray-500 dark:text-gray-400">
          {progress.toLocaleString()} / {target.toLocaleString()} {unit !== '%' ? unit : ''}
        </span>
        <span className="text-gray-500 dark:text-gray-400">{percentage}%</span>
      </div>
    </div>
  );
};

export default GoalTracker;
