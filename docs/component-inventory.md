# Component Inventory: Manajemen Syariah OS

## Component Categories

### 1. Layout Components

| Component | File | Props Interface | Description |
|-----------|------|-----------------|-------------|
| **Header** | `layout/Header.tsx` | `HeaderProps` | Top navigation bar with theme toggle, AI assistant button, user avatar |
| **Sidebar** | `layout/Sidebar.tsx` | `SidebarProps` | Left navigation with menu items, directory tree, edit mode |

### 2. Common/Shared Components

| Component | File | Props Interface | Description |
|-----------|------|-----------------|-------------|
| **Icons** | `common/Icons.tsx` | N/A (re-exports) | Barrel export of Lucide icons with familiar names |
| **KpiCard** | `common/KpiCard.tsx` | `Kpi` | KPI display card with icon, value, change indicator |
| **Skeleton** | `common/Skeleton.tsx` | `SkeletonProps` | Base skeleton loader with pulse animation |
| **SkeletonCard** | `common/Skeleton.tsx` | `{ className?: string }` | Card-shaped skeleton placeholder |
| **SkeletonText** | `common/Skeleton.tsx` | `{ lines?: number }` | Multi-line text skeleton |
| **SkeletonChart** | `common/Skeleton.tsx` | `{ className?: string }` | Chart area skeleton with bars |
| **SkeletonAvatar** | `common/Skeleton.tsx` | `{ size?: 'sm' \| 'md' \| 'lg' }` | Avatar placeholder skeleton |
| **SkeletonButton** | `common/Skeleton.tsx` | `{ className?: string }` | Button-shaped skeleton |
| **SkeletonInput** | `common/Skeleton.tsx` | `{ className?: string }` | Input field skeleton |
| **SkeletonList** | `common/Skeleton.tsx` | `{ items?: number }` | List with avatar and text lines |

### 3. Dashboard Components

| Component | File | Props Interface | Description |
|-----------|------|-----------------|-------------|
| **Dashboard** | `dashboard/Dashboard.tsx` | `DashboardProps` | Main dashboard with KPIs, charts, goals |
| **Directory** | `dashboard/Directory.tsx` | N/A | Directory tree view component |
| **DirectoryDetailModal** | `dashboard/DirectoryDetailModal.tsx` | `{ item, onClose }` | Modal showing directory item details |
| **GoalTracker** | `dashboard/GoalTracker.tsx` | `Goal` | Goal progress bar with percentage |
| **TaskManager** | `dashboard/TaskManager.tsx` | N/A | Task management interface |
| **ToolDetailModal** | `dashboard/ToolDetailModal.tsx` | `{ tool, onClose }` | Modal showing tool details |
| **ToolsCatalog** | `dashboard/ToolsCatalog.tsx` | N/A | Grid of available tools |

### 4. AI Components

| Component | File | Props Interface | Description |
|-----------|------|-----------------|-------------|
| **AIAssistant** | `ai/AIAssistant.tsx` | `AIAssistantProps` | Chat sidebar with Gemini integration |
| **AIGenerator** | `ai/AIGenerator.tsx` | N/A | AI content generation tool |
| **AIInsightCard** | `ai/AIInsightCard.tsx` | `{ kpiData?, goalData? }` | AI-powered dashboard insights card |

### 5. Admin Components

| Component | File | Props Interface | Description |
|-----------|------|-----------------|-------------|
| **AdminDashboard** | `admin/AdminDashboard.tsx` | N/A | Admin overview dashboard |
| **AdminToolManager** | `admin/AdminToolManager.tsx` | N/A | Tool management CRUD interface |
| **AdminUserManager** | `admin/AdminUserManager.tsx` | N/A | User management CRUD interface |

### 6. Auth Components

| Component | File | Props Interface | Description |
|-----------|------|-----------------|-------------|
| **Auth** | `auth/Auth.tsx` | `AuthProps` | Login and registration forms |

### 7. Page Components

| Component | File | Props Interface | Description |
|-----------|------|-----------------|-------------|
| **LandingPage** | `pages/LandingPage.tsx` | `{ onEnter: () => void }` | Entry landing page |
| **Settings** | `pages/Settings.tsx` | `{ toggleTheme, theme, setView }` | User settings page |

### 8. Root Component

| Component | File | Description |
|-----------|------|-------------|
| **App** | `App.tsx` | Root application component with routing logic |
| **WelcomeBanner** | `App.tsx` | Welcome banner sub-component (admin/user variants) |

---

## Component Exports

### Barrel Export (`components/index.ts`)

```typescript
// Common components
export { default as Icons } from './common/Icons';
export { default as KpiCard } from './common/KpiCard';
export { 
  Skeleton, SkeletonCard, SkeletonText, SkeletonChart,
  SkeletonAvatar, SkeletonButton, SkeletonInput, SkeletonList 
} from './common/Skeleton';

// Layout components
export { default as Header } from './layout/Header';
export { default as Sidebar } from './layout/Sidebar';

// Dashboard components
export { default as Dashboard } from './dashboard/Dashboard';
export { default as ToolsCatalog } from './dashboard/ToolsCatalog';
export { default as TaskManager } from './dashboard/TaskManager';
export { default as Directory } from './dashboard/Directory';
export { default as DirectoryDetailModal } from './dashboard/DirectoryDetailModal';
export { default as GoalTracker } from './dashboard/GoalTracker';
export { default as ToolDetailModal } from './dashboard/ToolDetailModal';

// Admin components
export { default as AdminDashboard } from './admin/AdminDashboard';
export { default as AdminToolManager } from './admin/AdminToolManager';
export { default as AdminUserManager } from './admin/AdminUserManager';

// AI components
export { default as AIAssistant } from './ai/AIAssistant';
export { default as AIGenerator } from './ai/AIGenerator';
export { default as AIInsightCard } from './ai/AIInsightCard';

// Auth components
export { default as Auth } from './auth/Auth';

// Page components
export { default as LandingPage } from './pages/LandingPage';
export { default as Settings } from './pages/Settings';
```

---

## Props Interfaces

### Layout Props

```typescript
interface HeaderProps {
  toggleTheme: () => void;
  theme: 'light' | 'dark';
  setSidebarOpen: (isOpen: boolean) => void;
  onOpenAssistant: () => void;
}

interface SidebarProps {
  view: View;
  setView: (view: View) => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  onSelectItem: (item: DirectoryItem) => void;
  directoryData: DirectoryItem[];
  setDirectoryData: React.Dispatch<React.SetStateAction<DirectoryItem[]>>;
  isDirectoryLoading?: boolean;
}
```

### Dashboard Props

```typescript
interface DashboardProps {
  dateRange: '7' | '30' | 'all';
  setDateRange: (range: '7' | '30' | 'all') => void;
}

type DateRange = '7' | '30' | 'all';
```

### AI Props

```typescript
interface AIAssistantProps {
  onClose: () => void;
  currentView: View;
  kpiData?: Kpi[];
  goalData?: Goal[];
}
```

### Auth Props

```typescript
interface AuthProps {
  type: 'login' | 'register';
  setView: (view: View) => void;
}
```

### Common Props

```typescript
interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}
```

---

## Component Size Analysis

| Component | Lines | Complexity | Notes |
|-----------|-------|------------|-------|
| Sidebar.tsx | 582 | High | Complex tree navigation with edit mode |
| Dashboard.tsx | 187 | Medium | Charts, KPIs, data fetching |
| AIAssistant.tsx | 150+ | Medium | AI integration with streaming |
| Auth.tsx | 150+ | Low-Medium | Form handling |
| App.tsx | 163 | Medium | Routing and state coordination |
| Header.tsx | 69 | Low | Simple presentation |
| Skeleton.tsx | 118 | Low | Variants of skeleton loaders |
| Icons.tsx | 51 | Low | Re-exports only |

---

## Reusable vs Specific Components

### Reusable Components (Shared)

| Component | Usage Count | Locations |
|-----------|-------------|-----------|
| Icons | 15+ | Throughout app |
| Skeleton variants | 10+ | Dashboard, Sidebar, loading states |
| KpiCard | 4 | Dashboard |
| Header | 1 | App layout |
| Sidebar | 1 | App layout |

### Feature-Specific Components

| Component | Feature | Specific Use |
|-----------|---------|--------------|
| Dashboard | Dashboard | Main view only |
| ToolsCatalog | Tools | Tools view only |
| TaskManager | Tasks | Tasks view only |
| AIAssistant | AI | Modal/sidebar only |
| AIGenerator | AI | Generator view only |
| AdminDashboard | Admin | Admin route only |
| AdminUserManager | Admin | Admin route only |
| AdminToolManager | Admin | Admin route only |

---

## Component Design Patterns

### 1. Compound Component Pattern
- **Sidebar**: Contains `DirectorySidebarNode` for recursive tree rendering
- **Skeleton**: Multiple variants from single file

### 2. Render Props
- **App**: `renderView()` function for view switching

### 3. Higher-Order Components
- None currently used

### 4. Custom Hooks
- `useLocalStorage` - For persisted state

### 5. Props Drilling Reduction
- Deep props in Sidebar (directory operations)
- Consider Context API for future expansion

---

## Styling Approach

All components use **Tailwind CSS**:

```typescript
// Example pattern
<div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md">
```

### Common Tailwind Patterns

| Pattern | Usage |
|---------|-------|
| `dark:` prefix | Dark mode support |
| `rounded-2xl` | Consistent border radius |
| `shadow-md` | Consistent elevation |
| `space-y-4` | Vertical spacing |
| `flex`, `grid` | Layout |

---

## Icon Usage

All icons imported from `@/components/common/Icons`:

| Icon | Lucide Source | Usage |
|------|---------------|-------|
| HomeIcon | Home | Navigation, welcome |
| DashboardIcon | LayoutDashboard | Dashboard nav |
| ToolsIcon | Settings | Tools nav |
| UserIcon | User | User-related |
| SunIcon/MoonIcon | Sun/Moon | Theme toggle |
| MenuIcon | Menu | Mobile menu |
| Plus | PlusCircle | Add actions |
| TrashIcon | Trash2 | Delete actions |

---

*Generated by BMad Master - Document Project Workflow*
*Date: 2026-02-11*
