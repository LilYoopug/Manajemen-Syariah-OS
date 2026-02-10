
import React from 'react';
import type { Kpi } from '../types';

const KpiCard: React.FC<Kpi> = ({ title, value, change, changeType, icon: Icon }) => {
  const isIncrease = changeType === 'increase';
  const changeColor = isIncrease ? 'text-green-500' : 'text-red-500';

  return (
    <div className="bg-white dark:bg-gray-800 p-4 lg:p-4 xl:p-6 rounded-2xl shadow-md flex items-center space-x-3 transition hover:shadow-lg hover:scale-105 min-w-0 overflow-hidden">
      <div className={`p-2.5 rounded-full flex-shrink-0 ${isIncrease ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
        <Icon className={`w-5 h-5 lg:w-6 lg:h-6 ${isIncrease ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] lg:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider truncate" title={title}>{title}</p>
        <div className="flex items-baseline space-x-1 mt-0.5 flex-wrap">
          <p className="text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">{value}</p>
          <span className={`text-[10px] lg:text-xs font-bold flex-shrink-0 ${changeColor}`}>{change}</span>
        </div>
      </div>
    </div>
  );
};

export default KpiCard;
