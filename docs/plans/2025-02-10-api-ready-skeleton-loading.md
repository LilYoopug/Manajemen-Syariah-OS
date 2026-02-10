# API-Ready Skeleton Loading Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add skeleton loading states to ALL components that will fetch data from APIs, making the entire frontend API-ready.

**Architecture:** Since all components will migrate from localStorage/static data to API fetching, every component that displays data needs skeleton loading. This includes lists, tables, cards, grids, forms, and detail views.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, Skeleton components (already created)

**Scope:** ALL 21 components that display or fetch data

---

## Components Requiring Skeleton Loading (21 Total)

### Phase 1: Dashboard & Core Components (5 tasks)
1. **Dashboard.tsx** - KPI cards grid + chart + goals list
2. **ToolsCatalog.tsx** - Tools grid + modal
3. **Directory.tsx** - Directory tree + modal
4. **TaskManager.tsx** - Tasks list + modals
5. **KpiCard.tsx** - Individual card loading state

### Phase 2: Admin Components (3 tasks)
6. **AdminDashboard.tsx** - Stats cards + logs + charts
7. **AdminToolManager.tsx** - Tools grid + CRUD modals
8. **AdminUserManager.tsx** - Users table + pagination + modals

### Phase 3: Layout & Settings (2 tasks)
9. **Sidebar.tsx** - Directory tree + navigation
10. **Settings.tsx** - Profile form + image loading

### Phase 4: Utility Components (2 tasks)
11. **GoalTracker.tsx** - Individual goal loading state
12. **Create reusable hooks** - useLoading, useFetchWithSkeleton

---

## Task 1: Add Skeleton Loading to Dashboard

**Files:**
- Modify: `frontend/src/components/dashboard/Dashboard.tsx`
- Modify: `frontend/src/components/common/KpiCard.tsx` (add loading prop)

**Analysis:**
Dashboard displays:
- 4 KPI cards (needs skeleton cards)
- Bar chart (already fixed, no longer needs loading)
- Goals list (needs skeleton items)

**Step 1: Add loading state to Dashboard**

Add to Dashboard.tsx:
```tsx
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  // Simulate API call
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // await fetchDashboardData();
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };
  fetchData();
}, [dateRange]);
```

**Step 2: Add skeleton for KPI cards**

Replace KPI cards section:
```tsx
// OLD:
<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
  {displayKpis.map((kpi, index) => (
    <KpiCard key={index} {...kpi} />
  ))}
</div>

// NEW:
<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
  {isLoading ? (
    <>
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </>
  ) : (
    displayKpis.map((kpi, index) => (
      <KpiCard key={index} {...kpi} />
    ))
  )}
</div>
```

**Step 3: Add skeleton for goals list**

Replace goals section:
```tsx
// In the Goals & Targets section:
{isLoading ? (
  <div className="space-y-6">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-xl">
        <div className="flex justify-between items-center mb-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
        <Skeleton className="h-4 w-24 mt-2" />
      </div>
    ))}
  </div>
) : (
  <div className="space-y-6">
    {displayGoals.map(goal => (
      <GoalTracker key={goal.id} {...goal} />
    ))}
  </div>
)}
```

**Step 4: Verify build passes**

Run: `cd frontend && npm run build`

**Step 5: Commit**

```bash
git add frontend/src/components/dashboard/Dashboard.tsx
git commit -m "feat: add skeleton loading to Dashboard

- Add isLoading state for API fetching
- Show SkeletonCard for KPI metrics during loading
- Show skeleton goals list during loading
- Prepare for API integration"
```

---

## Task 2: Add Skeleton Loading to ToolsCatalog

**Files:**
- Modify: `frontend/src/components/dashboard/ToolsCatalog.tsx`

**Step 1: Add loading state**

```tsx
const [isLoading, setIsLoading] = useState(true);
const [tools, setTools] = useState(TOOLS_DATA);

useEffect(() => {
  const fetchTools = async () => {
    setIsLoading(true);
    // Simulate API call
    // const data = await fetch('/api/tools');
    // setTools(data);
    setTimeout(() => setIsLoading(false), 500);
  };
  fetchTools();
}, []);
```

**Step 2: Add skeleton grid**

Replace tools grid:
```tsx
{isLoading ? (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-700">
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
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {filteredTools.map(tool => (
      <ToolCard key={tool.id} tool={tool} />
    ))}
  </div>
)}
```

**Step 3: Commit**

```bash
git add frontend/src/components/dashboard/ToolsCatalog.tsx
git commit -m "feat: add skeleton loading to ToolsCatalog

- Add isLoading state for tools fetching
- Show skeleton tool cards grid during loading
- Prepare for API integration"
```

---

## Task 3: Add Skeleton Loading to Directory

**Files:**
- Modify: `frontend/src/components/dashboard/Directory.tsx`

**Step 1: Add loading state**

```tsx
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  const fetchDirectory = async () => {
    setIsLoading(true);
    // Simulate API
    setTimeout(() => setIsLoading(false), 500);
  };
  fetchDirectory();
}, []);
```

**Step 2: Add skeleton tree**

```tsx
{isLoading ? (
  <div className="space-y-3">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex items-center space-x-3 p-3 rounded-lg">
        <Skeleton className="w-5 h-5" />
        <Skeleton className="h-5 w-48" />
      </div>
    ))}
  </div>
) : (
  <div className="space-y-1">
    {DIRECTORY_DATA.map((category) => (
      <DirectoryCategory key={category.id} category={category} />
    ))}
  </div>
)}
```

**Step 3: Commit**

```bash
git add frontend/src/components/dashboard/Directory.tsx
git commit -m "feat: add skeleton loading to Directory

- Add isLoading state for directory fetching
- Show skeleton directory tree during loading
- Prepare for API integration"
```

---

## Task 4: Add Skeleton Loading to TaskManager

**Files:**
- Modify: `frontend/src/components/dashboard/TaskManager.tsx`

**Step 1: Add loading state**

```tsx
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  const fetchTasks = async () => {
    setIsLoading(true);
    // Simulate API
    setTimeout(() => setIsLoading(false), 600);
  };
  fetchTasks();
}, []);
```

**Step 2: Add skeleton task list**

```tsx
{isLoading ? (
  <div className="space-y-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
        <div className="flex items-start space-x-4">
          <Skeleton className="w-5 h-5 rounded mt-1" />
          <div className="flex-1">
            <Skeleton className="h-5 w-3/4 mb-2" />
            <div className="flex items-center space-x-4 mt-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
          <div className="flex space-x-2">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="w-8 h-8 rounded-lg" />
          </div>
        </div>
      </div>
    ))}
  </div>
) : (
  <div className="space-y-4">
    {filteredTasks.map(task => (
      <TaskItem key={task.id} task={task} />
    ))}
  </div>
)}
```

**Step 3: Commit**

```bash
git add frontend/src/components/dashboard/TaskManager.tsx
git commit -m "feat: add skeleton loading to TaskManager

- Add isLoading state for tasks fetching
- Show skeleton task list during loading
- Prepare for API integration"
```

---

## Task 5: Add Loading Prop to KpiCard

**Files:**
- Modify: `frontend/src/components/common/KpiCard.tsx`

**Step 1: Add loading prop interface**

```tsx
interface KpiCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ElementType;
  isLoading?: boolean; // Add this
}
```

**Step 2: Add skeleton render**

```tsx
const KpiCard: React.FC<KpiCardProps> = ({ title, value, change, changeType, icon: Icon, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="w-12 h-12 rounded-xl" />
        </div>
      </div>
    );
  }
  
  // ... rest of component
};
```

**Step 3: Update Dashboard to use isLoading prop**

In Dashboard.tsx:
```tsx
{displayKpis.map((kpi, index) => (
  <KpiCard key={index} {...kpi} isLoading={isLoading} />
))}
```

**Step 4: Commit**

```bash
git add frontend/src/components/common/KpiCard.tsx frontend/src/components/dashboard/Dashboard.tsx
git commit -m "feat: add loading prop to KpiCard

- Add optional isLoading prop to KpiCard
- Show skeleton UI when isLoading=true
- Update Dashboard to pass loading state"
```

---

## Task 6: Add Skeleton Loading to AdminDashboard

**Files:**
- Modify: `frontend/src/components/admin/AdminDashboard.tsx`

**Step 1: Add loading states**

```tsx
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  const fetchAdminData = async () => {
    setIsLoading(true);
    // Simulate API calls for stats, logs, etc.
    setTimeout(() => setIsLoading(false), 700);
  };
  fetchAdminData();
}, []);
```

**Step 2: Add skeleton for stats cards**

```tsx
{isLoading ? (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {Array.from({ length: 4 }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
) : (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {stats.map((stat, index) => (
      <StatCard key={index} {...stat} />
    ))}
  </div>
)}
```

**Step 3: Add skeleton for logs list**

```tsx
{isLoading ? (
  <div className="space-y-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex items-center space-x-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-900">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-4 w-24" />
      </div>
    ))}
  </div>
) : (
  <div className="space-y-4">
    {logs.map((log, index) => (
      <LogItem key={index} {...log} />
    ))}
  </div>
)}
```

**Step 4: Commit**

```bash
git add frontend/src/components/admin/AdminDashboard.tsx
git commit -m "feat: add skeleton loading to AdminDashboard

- Add isLoading state for admin data fetching
- Show skeleton stats cards during loading
- Show skeleton logs list during loading
- Prepare for API integration"
```

---

## Task 7: Add Skeleton Loading to AdminToolManager

**Files:**
- Modify: `frontend/src/components/admin/AdminToolManager.tsx`

**Step 1: Add loading state**

```tsx
const [isLoading, setIsLoading] = useState(true);
const [isSubmitting, setIsSubmitting] = useState(false);

useEffect(() => {
  const fetchTools = async () => {
    setIsLoading(true);
    // Simulate API
    setTimeout(() => setIsLoading(false), 600);
  };
  fetchTools();
}, []);
```

**Step 2: Add skeleton for tools grid**

```tsx
{isLoading ? (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <div>
              <Skeleton className="h-5 w-32 mb-1" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <div className="flex space-x-1">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="w-8 h-8 rounded-lg" />
          </div>
        </div>
        <SkeletonText lines={2} />
        <div className="mt-4 flex space-x-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
    ))}
  </div>
) : (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {filteredTools.map(tool => (
      <ToolCard key={tool.id} tool={tool} />
    ))}
  </div>
)}
```

**Step 3: Add submitting state to modal**

Add to modal form:
```tsx
<button 
  type="submit" 
  disabled={isSubmitting}
  className="..."
>
  {isSubmitting ? (
    <>
      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
      Menyimpan...
    </>
  ) : (
    'Simpan'
  )}
</button>
```

**Step 4: Commit**

```bash
git add frontend/src/components/admin/AdminToolManager.tsx
git commit -m "feat: add skeleton loading to AdminToolManager

- Add isLoading state for tools fetching
- Add isSubmitting state for form submission
- Show skeleton tool cards grid during loading
- Show spinner during form submit
- Prepare for API integration"
```

---

## Task 8: Add Skeleton Loading to AdminUserManager

**Files:**
- Modify: `frontend/src/components/admin/AdminUserManager.tsx`

**Step 1: Add loading states**

```tsx
const [isLoading, setIsLoading] = useState(true);
const [isSubmitting, setIsSubmitting] = useState(false);

useEffect(() => {
  const fetchUsers = async () => {
    setIsLoading(true);
    // Simulate API
    setTimeout(() => setIsLoading(false), 600);
  };
  fetchUsers();
}, [currentPage]);
```

**Step 2: Add skeleton for users table**

```tsx
{isLoading ? (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
    <div className="divide-y divide-gray-100 dark:divide-gray-700">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="p-4 flex items-center space-x-4">
          <SkeletonAvatar size="sm" />
          <div className="flex-1">
            <Skeleton className="h-4 w-32 mb-1" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <div className="flex space-x-1">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="w-8 h-8 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  </div>
) : (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
    {currentUsers.map(user => (
      <UserRow key={user.id} user={user} />
    ))}
  </div>
)}
```

**Step 3: Add skeleton for pagination**

```tsx
{isLoading ? (
  <div className="flex justify-center items-center space-x-2 mt-6">
    <Skeleton className="w-10 h-10 rounded-lg" />
    <Skeleton className="w-10 h-10 rounded-lg" />
    <Skeleton className="w-10 h-10 rounded-lg" />
    <Skeleton className="h-4 w-32" />
    <Skeleton className="w-10 h-10 rounded-lg" />
    <Skeleton className="w-10 h-10 rounded-lg" />
  </div>
) : (
  <Pagination ... />
)}
```

**Step 4: Commit**

```bash
git add frontend/src/components/admin/AdminUserManager.tsx
git commit -m "feat: add skeleton loading to AdminUserManager

- Add isLoading state for users fetching
- Add isSubmitting state for form submission
- Show skeleton table rows during loading
- Show skeleton pagination during loading
- Prepare for API integration"
```

---

## Task 9: Add Skeleton Loading to Sidebar

**Files:**
- Modify: `frontend/src/components/layout/Sidebar.tsx`

**Step 1: Add loading prop**

```tsx
interface SidebarProps {
  // ... existing props
  isDirectoryLoading?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  // ... existing props
  isDirectoryLoading = false 
}) => {
```

**Step 2: Add skeleton for directory section**

```tsx
{isDirectoryLoading ? (
  <div className="mt-6 space-y-2">
    <Skeleton className="h-4 w-24 mb-3" />
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex items-center space-x-3 p-2 rounded-lg">
        <Skeleton className="w-4 h-4" />
        <Skeleton className="h-4 w-40" />
      </div>
    ))}
  </div>
) : (
  <div className="mt-6">
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
      Direktori
    </p>
    {filteredDirectoryData.map(item => (
      <DirectoryItem key={item.id} item={item} />
    ))}
  </div>
)}
```

**Step 3: Commit**

```bash
git add frontend/src/components/layout/Sidebar.tsx
git commit -m "feat: add skeleton loading to Sidebar

- Add isDirectoryLoading prop
- Show skeleton directory tree during loading
- Prepare for API integration"
```

---

## Task 10: Add Skeleton Loading to Settings

**Files:**
- Modify: `frontend/src/components/pages/Settings.tsx`

**Step 1: Add loading states**

```tsx
const [isLoading, setIsLoading] = useState(true);
const [isImageLoading, setIsImageLoading] = useState(true);

useEffect(() => {
  const fetchProfile = async () => {
    setIsLoading(true);
    // Simulate API
    setTimeout(() => setIsLoading(false), 500);
  };
  fetchProfile();
}, []);
```

**Step 2: Add skeleton for profile section**

```tsx
{isLoading ? (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md">
    <div className="flex items-center space-x-6 mb-6">
      <SkeletonAvatar size="lg" />
      <div className="flex-1">
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
    <div className="space-y-4">
      <div>
        <Skeleton className="h-4 w-24 mb-2" />
        <SkeletonInput />
      </div>
      <div>
        <Skeleton className="h-4 w-24 mb-2" />
        <SkeletonInput />
      </div>
      <div className="flex justify-end">
        <SkeletonButton />
      </div>
    </div>
  </div>
) : (
  <ProfileForm ... />
)}
```

**Step 3: Add skeleton for profile image**

```tsx
<div className="relative">
  {isImageLoading && (
    <SkeletonAvatar size="lg" className="absolute inset-0" />
  )}
  <img
    src={profileImage}
    alt="Profile"
    className={`w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-lg ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
    onLoad={() => setIsImageLoading(false)}
  />
</div>
```

**Step 4: Commit**

```bash
git add frontend/src/components/pages/Settings.tsx
git commit -m "feat: add skeleton loading to Settings

- Add isLoading state for profile fetching
- Add isImageLoading state for avatar image
- Show skeleton profile form during loading
- Show skeleton avatar while image loads
- Prepare for API integration"
```

---

## Task 11: Add Loading Prop to GoalTracker

**Files:**
- Modify: `frontend/src/components/dashboard/GoalTracker.tsx`

**Step 1: Add loading prop**

```tsx
interface GoalTrackerProps {
  id: string;
  title: string;
  target: number;
  progress: number;
  unit: string;
  deadline: string;
  isLoading?: boolean;
}
```

**Step 2: Add skeleton render**

```tsx
const GoalTracker: React.FC<GoalTrackerProps> = ({ 
  title, target, progress, unit, deadline, isLoading 
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
  
  // ... rest of component
};
```

**Step 3: Update Dashboard to pass loading prop**

In Dashboard.tsx:
```tsx
{displayGoals.map(goal => (
  <GoalTracker key={goal.id} {...goal} isLoading={isLoading} />
))}
```

**Step 4: Commit**

```bash
git add frontend/src/components/dashboard/GoalTracker.tsx frontend/src/components/dashboard/Dashboard.tsx
git commit -m "feat: add loading prop to GoalTracker

- Add optional isLoading prop to GoalTracker
- Show skeleton UI when isLoading=true
- Update Dashboard to pass loading state"
```

---

## Task 12: Create Loading State Guidelines Documentation

**Files:**
- Create: `docs/api-loading-guide.md`

**Step 1: Create comprehensive guide**

```markdown
# API Loading States Guide

## Overview

All components in this project are now API-ready with skeleton loading states. When you migrate from localStorage/static data to API fetching, the loading states will automatically show during data fetching.

## Component Loading States

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
```

**Step 2: Commit**

```bash
git add docs/api-loading-guide.md
git commit -m "docs: add API loading states migration guide

- Document all components with loading states
- Provide migration examples
- Add best practices and guidelines"
```

---

## Summary

**Components Updated:** 11 components
**Total Tasks:** 12 tasks
**New Skeleton States:** 21+ locations
**Documentation:** 2 files (loading-states.md, api-loading-guide.md)

**What You Get:**
- ✅ All components API-ready with skeleton loading
- ✅ Consistent loading UX across the entire app
- ✅ Easy migration path from localStorage to APIs
- ✅ Comprehensive documentation
- ✅ Error handling patterns

**Ready for API Integration!**
