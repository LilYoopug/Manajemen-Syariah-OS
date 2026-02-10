# Skeleton Loading States Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add consistent skeleton loading states to all async operations and data fetching components across the entire project.

**Architecture:** Create a reusable Skeleton component system with variants (text, card, chart, button, avatar) using Tailwind CSS animations. Apply skeletons to all loading states in AI components (AIGenerator, AIInsightCard, AIAssistant), Auth, and future data fetching components. Replace generic spinners with contextual skeleton loaders.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, lucide-react

---

## Analysis: Current Loading States

### Components with Loading States:

1. **AIGenerator.tsx** - `isLoading` state for AI plan generation
2. **AIInsightCard.tsx** - `isLoading` state for AI insight generation  
3. **AIAssistant.tsx** - `isLoading` state for chat message streaming
4. **Auth.tsx** - `isLoading` state for login/register form submission
5. **Dashboard.tsx** - Chart rendering (removed CDN loading, now instant)

### Loading Patterns Found:
- Generic spinners (pulse dots, spinners)
- Text placeholders ("Menganalisis...", "Memuat...")
- Disabled buttons during loading
- Empty placeholders

---

## Task 1: Create Skeleton Component System

**Files:**
- Create: `frontend/src/components/common/Skeleton.tsx`

**Step 1: Create base Skeleton component**

```tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200 dark:bg-gray-700",
        className
      )}
    />
  );
};

export default Skeleton;
```

**Step 2: Create Skeleton variants component**

Create comprehensive skeleton variants:

```tsx
import React from 'react';
import { cn } from '@/lib/utils';

// Base Skeleton
interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200 dark:bg-gray-700",
        className
      )}
    />
  );
};

// Skeleton Card - for content cards
export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6", className)}>
      <Skeleton className="h-4 w-1/3 mb-4" />
      <Skeleton className="h-8 w-3/4 mb-4" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
};

// Skeleton Text - for paragraphs
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ 
  lines = 3, 
  className 
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={cn("h-4", i === lines - 1 ? "w-2/3" : "w-full")} 
        />
      ))}
    </div>
  );
};

// Skeleton Chart - for chart areas
export const SkeletonChart: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("h-96 w-full rounded-xl bg-gray-50 dark:bg-gray-900 p-4", className)}>
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
  className 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };
  
  return (
    <Skeleton className={cn("rounded-full", sizeClasses[size], className)} />
  );
};

// Skeleton Button - for button placeholders
export const SkeletonButton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <Skeleton className={cn("h-10 w-32 rounded-xl", className)} />
  );
};

// Skeleton Input - for form inputs
export const SkeletonInput: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <Skeleton className={cn("h-12 w-full rounded-xl", className)} />
  );
};

// Skeleton List - for list items
export const SkeletonList: React.FC<{ items?: number; className?: string }> = ({ 
  items = 5,
  className 
}) => {
  return (
    <div className={cn("space-y-4", className)}>
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
```

**Step 3: Create utility file for cn() if not exists**

Create `frontend/src/lib/utils.ts`:

```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Step 4: Install required dependencies**

```bash
cd frontend && npm install clsx tailwind-merge
```

**Step 5: Verify build passes**

Run: `cd frontend && npm run build`
Expected: Build successful

**Step 6: Commit**

```bash
git add frontend/src/components/common/Skeleton.tsx frontend/src/lib/utils.ts frontend/package.json frontend/package-lock.json
git commit -m "feat: add skeleton loading component system

- Create Skeleton base component with pulse animation
- Add variants: Card, Text, Chart, Avatar, Button, Input, List
- Install clsx and tailwind-merge for class merging
- Prepare for consistent loading states across app"
```

---

## Task 2: Add Skeleton Loading to AIGenerator

**Files:**
- Modify: `frontend/src/components/ai/AIGenerator.tsx`

**Step 1: Import Skeleton components**

Add import:
```tsx
import { SkeletonCard, SkeletonText, SkeletonButton } from '@/components/common/Skeleton';
```

**Step 2: Replace loading UI in AIGenerator**

Find the loading state (around line 211-220) and replace:

```tsx
// OLD:
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

// NEW:
{isLoading && (
    <div className="space-y-6 animate-fadeIn pb-8">
        {/* Header Skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-md border border-gray-100 dark:border-gray-700">
            <Skeleton className="h-4 w-32 mb-4" />
            <Skeleton className="h-10 w-3/4 mb-4" />
            <SkeletonText lines={3} />
        </div>
        
        {/* Phases Skeleton */}
        <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-4 mb-4">
                        <Skeleton className="w-12 h-12 rounded-xl" />
                        <Skeleton className="h-6 w-48" />
                    </div>
                    <Skeleton className="h-4 w-full mb-4" />
                    <div className="space-y-2">
                        {Array.from({ length: 3 }).map((_, j) => (
                            <Skeleton key={j} className="h-10 w-full rounded-xl" />
                        ))}
                    </div>
                </div>
            ))}
        </div>
        
        {/* Maqasid Skeleton */}
        <div className="bg-gradient-to-r from-primary-600/20 to-indigo-600/20 rounded-2xl p-8">
            <div className="flex items-center space-x-4">
                <Skeleton className="w-16 h-16 rounded-2xl" />
                <div className="flex-1">
                    <Skeleton className="h-6 w-48 mb-2" />
                    <SkeletonText lines={2} />
                </div>
            </div>
        </div>
    </div>
)}
```

**Step 3: Verify build passes**

Run: `cd frontend && npm run build`
Expected: Build successful

**Step 4: Commit**

```bash
git add frontend/src/components/ai/AIGenerator.tsx
git commit -m "feat: add skeleton loading to AI Strategic Planner

- Replace generic spinner with contextual skeleton UI
- Show skeleton cards for plan phases
- Display skeleton text for content areas
- Maintain visual structure during loading"
```

---

## Task 3: Add Skeleton Loading to AIInsightCard

**Files:**
- Modify: `frontend/src/components/ai/AIInsightCard.tsx`

**Step 1: Import Skeleton components**

Add import:
```tsx
import { SkeletonText } from '@/components/common/Skeleton';
```

**Step 2: Replace loading UI in AIInsightCard**

Find the loading state (around line 98-106) and replace:

```tsx
// OLD:
{isLoading && (
    <div className="flex justify-center items-center h-24">
        <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
        </div>
    </div>
)}

// NEW:
{isLoading && (
    <div className="py-4">
        <SkeletonText lines={4} className="max-w-2xl" />
        <div className="mt-4 flex items-center space-x-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
        </div>
    </div>
)}
```

**Step 3: Verify build passes**

Run: `cd frontend && npm run build`
Expected: Build successful

**Step 4: Commit**

```bash
git add frontend/src/components/ai/AIInsightCard.tsx
git commit -m "feat: add skeleton loading to AI Insight Card

- Replace pulse dots with skeleton text lines
- Show multiple lines to represent insight structure
- Add meta info skeleton placeholders"
```

---

## Task 4: Add Skeleton Loading to AIAssistant

**Files:**
- Modify: `frontend/src/components/ai/AIAssistant.tsx`

**Step 1: Import Skeleton components**

Add import:
```tsx
import { SkeletonAvatar, SkeletonText } from '@/components/common/Skeleton';
```

**Step 2: Find loading state for messages**

Look for `isLoading` usage in message rendering area (around line 147-150).

**Step 3: Add skeleton for streaming response**

Replace or add alongside loading indicator:

```tsx
// Find where isLoading is used for AI response and add:
{isLoading && (
    <div className="flex items-start space-x-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
        <SkeletonAvatar size="sm" />
        <div className="flex-1">
            <SkeletonText lines={2} />
        </div>
    </div>
)}
```

**Step 4: Verify build passes**

Run: `cd frontend && npm run build`
Expected: Build successful

**Step 5: Commit**

```bash
git add frontend/src/components/ai/AIAssistant.tsx
git commit -m "feat: add skeleton loading to AI Assistant chat

- Show skeleton avatar and text while AI is typing
- Maintain chat layout structure during loading
- Smooth transition from skeleton to actual message"
```

---

## Task 5: Add Skeleton Loading to Auth

**Files:**
- Modify: `frontend/src/components/auth/Auth.tsx`

**Step 1: Import Skeleton components**

Add import:
```tsx
import { SkeletonInput, SkeletonButton } from '@/components/common/Skeleton';
```

**Step 2: Find loading state in form**

Look for `isLoading` usage in form submission (around line 189-192).

**Step 3: Add skeleton overlay during submission**

Add a skeleton overlay when form is submitting:

```tsx
// Find the form element and wrap or modify:
<div className="relative">
    <form onSubmit={handleSubmit} className={cn("space-y-6", isLoading && "opacity-50 pointer-events-none")}>
        {/* existing form fields */}
    </form>
    
    {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {isLogin ? 'Memverifikasi...' : 'Mendaftarkan akun...'}
                </p>
            </div>
        </div>
    )}
</div>
```

**Step 4: Verify build passes**

Run: `cd frontend && npm run build`
Expected: Build successful

**Step 5: Commit**

```bash
git add frontend/src/components/auth/Auth.tsx
git commit -m "feat: add loading overlay to Auth form

- Show spinner overlay during login/register submission
- Disable form inputs while loading
- Add contextual loading messages"
```

---

## Task 6: Export Skeleton Components

**Files:**
- Modify: `frontend/src/components/index.ts`

**Step 1: Add Skeleton exports**

Add to the exports:

```tsx
export { 
  Skeleton, 
  SkeletonCard, 
  SkeletonText, 
  SkeletonChart, 
  SkeletonAvatar, 
  SkeletonButton, 
  SkeletonInput, 
  SkeletonList 
} from './common/Skeleton';
```

**Step 2: Commit**

```bash
git add frontend/src/components/index.ts
git commit -m "chore: export skeleton components from index"
```

---

## Task 7: Create Loading States Documentation

**Files:**
- Create: `docs/loading-states.md`

**Step 1: Create documentation**

```markdown
# Loading States Guide

This project uses skeleton loading states for better UX during async operations.

## Available Skeleton Components

### Basic Skeleton
```tsx
import { Skeleton } from '@/components/common/Skeleton';

<Skeleton className="h-4 w-32" />
```

### Skeleton Variants

**SkeletonCard** - For content cards
```tsx
<SkeletonCard />
```

**SkeletonText** - For paragraphs
```tsx
<SkeletonText lines={3} />
```

**SkeletonChart** - For chart areas
```tsx
<SkeletonChart />
```

**SkeletonAvatar** - For user avatars
```tsx
<SkeletonAvatar size="md" />
```

**SkeletonButton** - For buttons
```tsx
<SkeletonButton />
```

**SkeletonInput** - For form inputs
```tsx
<SkeletonInput />
```

**SkeletonList** - For list items
```tsx
<SkeletonList items={5} />
```

## When to Use Skeletons

Use skeletons when:
- Loading data from API
- AI is generating content
- Form is submitting
- Page content is initializing

Don't use skeletons for:
- Button click feedback (use spinner)
- Very short operations (< 300ms)
- Background processes

## Implementation Pattern

```tsx
const [isLoading, setIsLoading] = useState(false);

// During loading
{isLoading ? (
  <SkeletonCard />
) : (
  <ActualContent />
)}
```

## Consistency Guidelines

1. Match skeleton dimensions to actual content
2. Use same border radius as actual components
3. Maintain layout structure during loading
4. Animate with `animate-pulse` class
```

**Step 2: Commit**

```bash
git add docs/loading-states.md
git commit -m "docs: add loading states guide"
```

---

## Task 8: Final Verification

**Step 1: Run full build**

Run: `cd frontend && npm run build`
Expected: Build successful with no errors

**Step 2: Test each component**

Verify each component shows skeleton correctly:
- AIGenerator: Generate plan, see skeleton phases
- AIInsightCard: Generate insight, see skeleton text
- AIAssistant: Send message, see skeleton response
- Auth: Submit form, see loading overlay

**Step 3: Commit verification**

```bash
git commit --allow-empty -m "test: verify all skeleton loading states work correctly"
```

---

## Summary

**What changes:**
- New Skeleton component system with 8 variants
- Skeleton loading in 4 components (AIGenerator, AIInsightCard, AIAssistant, Auth)
- Documentation for future developers
- Dependencies: clsx, tailwind-merge

**Benefits:**
- Consistent loading UX across app
- Better perceived performance
- Visual structure maintained during loading
- Easy to extend for new components

**Components Updated:**
1. AIGenerator - Skeleton cards for plan phases
2. AIInsightCard - Skeleton text for insights
3. AIAssistant - Skeleton avatar + text for chat
4. Auth - Loading overlay for form submission

**Estimated time:** 30-45 minutes
