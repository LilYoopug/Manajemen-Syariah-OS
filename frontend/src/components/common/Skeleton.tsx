import React from 'react';
import { cn } from '@/lib/utils';

// Base Skeleton
interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, style }) => {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-gray-200 dark:bg-gray-700', className)}
      style={style}
    />
  );
};

// Skeleton Card - for content cards
export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={cn(
        'rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6',
        className
      )}
    >
      <Skeleton className="h-4 w-1/3 mb-4" />
      <Skeleton className="h-8 w-3/4 mb-4" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
};

// Skeleton Text - for paragraphs
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className,
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn('h-4', i === lines - 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  );
};

// Skeleton Chart - for chart areas
export const SkeletonChart: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('h-96 w-full rounded-xl bg-gray-50 dark:bg-gray-900 p-4', className)}>
      <div className="flex items-end justify-between h-full space-x-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton
            key={i}
            className="w-full rounded-t-lg"
            style={{ height: `${Math.random() * 60 + 20}%` }}
          />
        ))}
      </div>
    </div>
  );
};

// Skeleton Avatar - for user avatars
export const SkeletonAvatar: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className,
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return <Skeleton className={cn('rounded-full', sizeClasses[size], className)} />;
};

// Skeleton Button - for button placeholders
export const SkeletonButton: React.FC<{ className?: string }> = ({ className }) => {
  return <Skeleton className={cn('h-10 w-32 rounded-xl', className)} />;
};

// Skeleton Input - for form inputs
export const SkeletonInput: React.FC<{ className?: string }> = ({ className }) => {
  return <Skeleton className={cn('h-12 w-full rounded-xl', className)} />;
};

// Skeleton List - for list items
export const SkeletonList: React.FC<{ items?: number; className?: string }> = ({
  items = 5,
  className,
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <SkeletonAvatar size="sm" />
          <div className="flex-1">
            <Skeleton className="h-4 w-1/3 mb-2" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default Skeleton;
