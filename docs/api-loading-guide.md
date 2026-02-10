# API Loading States Guide

## Overview

All components in this project are now API-ready with skeleton loading states. When you migrate from localStorage/static data to API fetching, the loading states will automatically show during data fetching.

## Components with Loading States

### Dashboard Components

**Dashboard.tsx**
- `isLoading` state controls KPI cards and goals list
- Automatically shows skeleton cards during data fetch
- Passes `isLoading` to KpiCard and GoalTracker components

**ToolsCatalog.tsx**
- `isLoading` state for tools grid
- Shows 6 skeleton tool cards during fetch

**Directory.tsx**
- `isLoading` state for directory tree
- Shows 5 skeleton directory items during fetch

**TaskManager.tsx**
- `isLoading` state for tasks list
- Shows 5 skeleton task items during fetch

### Admin Components

**AdminDashboard.tsx**
- `isLoading` state for stats and logs
- Shows skeleton stats cards and logs list

**AdminToolManager.tsx**
- `isLoading` state for tools grid
- `isSubmitting` state for form submission
- Shows spinner in save button during submit

**AdminUserManager.tsx**
- `isLoading` state for users table
- `isSubmitting` state for form submission
- Shows skeleton table rows and pagination

### Layout Components

**Sidebar.tsx**
- `isDirectoryLoading` prop for directory section
- Parent component controls loading state

### Page Components

**Settings.tsx**
- `isLoading` state for profile data
- `isImageLoading` state for avatar image
- Shows skeleton form and avatar placeholder

## AI Components (Already Implemented)

**AIGenerator.tsx**
- Skeleton UI for strategic plan generation
- Shows header, phases, and maqasid skeletons

**AIInsightCard.tsx**
- Skeleton text for AI insights
- Shows 4 text lines + meta placeholders

**AIAssistant.tsx**
- Skeleton avatar + text for chat
- Shows while AI is generating response

## Migration Guide

### Step 1: Replace setTimeout with actual API calls

```tsx
// BEFORE (current):
useEffect(() => {
  const fetchData = async () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500);
  };
  fetchData();
}, []);

// AFTER (with API):
useEffect(() => {
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/data');
      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setIsLoading(false);
    }
  };
  fetchData();
}, []);
```

### Step 2: Handle errors gracefully

```tsx
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

const fetchData = async () => {
  setIsLoading(true);
  setError(null);
  try {
    const data = await fetch('/api/data');
    setData(data);
  } catch (err) {
    setError('Failed to load data');
  } finally {
    setIsLoading(false);
  }
};

// In render:
{error && <ErrorMessage error={error} onRetry={fetchData} />}
```

### Step 3: Add retry functionality

```tsx
const handleRetry = () => {
  fetchData();
};

// Show retry button when error occurs
{error && (
  <div className="text-center py-8">
    <p className="text-red-500 mb-4">{error}</p>
    <button onClick={handleRetry} className="...">
      Coba Lagi
    </button>
  </div>
)}
```

## Best Practices

1. **Always show loading state on initial fetch**
2. **Keep loading state during pagination/filter changes**
3. **Show error states with retry option**
4. **Use optimistic updates for mutations**
5. **Debounce search inputs to prevent excessive loading**

## Available Skeleton Components

- `Skeleton` - Base skeleton block
- `SkeletonCard` - Card-shaped skeleton
- `SkeletonText` - Text lines skeleton
- `SkeletonChart` - Chart area skeleton
- `SkeletonAvatar` - Avatar skeleton
- `SkeletonButton` - Button skeleton
- `SkeletonInput` - Input field skeleton
- `SkeletonList` - List items skeleton

Import from: `import { Skeleton, SkeletonCard } from '@/components/common/Skeleton'`

## Component-Specific Loading Patterns

### Lists/Tables
Show 5-10 skeleton items matching the row structure:
```tsx
{isLoading ? (
  <div className="space-y-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <SkeletonRow key={i} />
    ))}
  </div>
) : (
  <ActualList />
)}
```

### Cards/Grids
Show 4-6 skeleton cards:
```tsx
{isLoading ? (
  <div className="grid grid-cols-3 gap-6">
    {Array.from({ length: 6 }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
) : (
  <ActualGrid />
)}
```

### Forms
Show skeleton inputs:
```tsx
{isLoading ? (
  <div className="space-y-4">
    <SkeletonInput />
    <SkeletonInput />
    <SkeletonButton />
  </div>
) : (
  <ActualForm />
)}
```

## Error Handling Template

```tsx
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [data, setData] = useState(null);

useEffect(() => {
  fetchData();
}, []);

const fetchData = async () => {
  setIsLoading(true);
  setError(null);
  try {
    const response = await fetch('/api/data');
    if (!response.ok) throw new Error('Failed to fetch');
    const result = await response.json();
    setData(result);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Unknown error');
  } finally {
    setIsLoading(false);
  }
};

// Render
if (isLoading) return <SkeletonUI />;
if (error) return <ErrorUI error={error} onRetry={fetchData} />;
return <ActualContent data={data} />;
```

## Summary

**Components Updated:** 15 total
- 5 Dashboard components
- 3 Admin components
- 2 AI components (already done)
- 1 Auth component (already done)
- 2 Layout/Page components
- 2 Card components (KpiCard, GoalTracker)

**Ready for API Integration!**
