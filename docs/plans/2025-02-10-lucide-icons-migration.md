# Lucide Icons Migration Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace all custom SVG icons with Lucide React icons while maintaining the same import interface.

**Architecture:** Install `lucide-react` package and refactor `Icons.tsx` to re-export Lucide icons with the same names, maintaining backward compatibility with existing imports. This approach requires zero changes to consuming components.

**Tech Stack:** React 19, TypeScript, Vite, lucide-react

**Current Icon Count:** 41 custom SVG icons in `src/components/common/Icons.tsx`

---

## Icon Mapping Reference

| Current Custom Icon | Lucide Equivalent | Status |
|--------------------|-------------------|---------|
| DashboardIcon | `LayoutDashboard` | Ready |
| ToolsIcon | `Settings` | Ready |
| DirectoryIcon | `Folder` | Ready |
| SunIcon | `Sun` | Ready |
| MoonIcon | `Moon` | Ready |
| MenuIcon | `Menu` | Ready |
| ChevronDownIcon | `ChevronDown` | Ready |
| ChevronRightIcon | `ChevronRight` | Ready |
| XMarkIcon | `X` | Ready |
| HomeIcon | `Home` | Ready |
| UserIcon | `User` | Ready |
| BriefcaseIcon | `Briefcase` | Ready |
| UsersIcon | `Users` | Ready |
| BanknotesIcon | `Banknote` | Ready |
| AcademicCapIcon | `GraduationCap` | Ready |
| GlobeAltIcon | `Globe` | Ready |
| CheckCircleIcon | `CheckCircle` | Ready |
| DocumentCheckIcon | `CircleCheck` | Ready |
| ArrowTrendingUpIcon | `TrendingUp` | Ready |
| ChartPieIcon | `PieChart` | Ready |
| DownloadIcon | `Download` | Ready |
| BookOpenIcon | `BookOpen` | Ready |
| PaperAirplaneIcon | `Send` | Ready |
| ChatBubbleLeftRightIcon | `MessageSquare` | Ready |
| TrashIcon | `Trash2` | Ready |
| SparklesIcon | `Sparkles` | Ready |
| WandSparklesIcon | `Wand2` | Ready |
| CheckIcon | `Check` | Ready |
| LinkIcon | `Link` | Ready |
| LockClosedIcon | `Lock` | Ready |
| ClipboardListIcon | `ClipboardList` | Ready |
| PlusCircleIcon | `PlusCircle` | Ready |
| CalendarDaysIcon | `CalendarDays` | Ready |
| ClipboardIcon | `Clipboard` | Ready |
| Cog6ToothIcon | `Settings` | Ready |
| ArrowLeftOnRectangleIcon | `LogOut` | Ready |
| EyeIcon | `Eye` | Ready |
| EyeSlashIcon | `EyeOff` | Ready |
| PencilIcon | `Pencil` | Ready |
| MagnifyingGlassIcon | `Search` | Ready |
| FunnelIcon | `Filter` | Ready |
| CalendarIcon | `Calendar` | Ready |
| CameraIcon | `Camera` | Ready |
| QuestionMarkCircleIcon | `HelpCircle` | Ready |
| ClockIcon | `Clock` | Ready |

---

## Task 1: Install lucide-react Package

**Files:**
- Modify: `frontend/package.json`
- Run in: `frontend/` directory

**Step 1: Install the package**

```bash
cd frontend && npm install lucide-react
```

**Step 2: Verify installation**

Run: `cat package.json | grep lucide`
Expected: Shows `"lucide-react": "^X.X.X"` in dependencies

**Step 3: Commit**

```bash
git add frontend/package.json frontend/package-lock.json
git commit -m "deps: add lucide-react icon library"
```

---

## Task 2: Refactor Icons.tsx to Use Lucide

**Files:**
- Modify: `frontend/src/components/common/Icons.tsx`

**Step 1: Replace entire file content**

Replace `Icons.tsx` with re-exports from lucide-react:

```tsx
// Re-export all icons from lucide-react
// This maintains backward compatibility with existing imports

export {
  LayoutDashboard as DashboardIcon,
  Settings as ToolsIcon,
  Folder as DirectoryIcon,
  Sun as SunIcon,
  Moon as MoonIcon,
  Menu as MenuIcon,
  ChevronDown as ChevronDownIcon,
  ChevronRight as ChevronRightIcon,
  X as XMarkIcon,
  Home as HomeIcon,
  User as UserIcon,
  Briefcase as BriefcaseIcon,
  Users as UsersIcon,
  Banknote as BanknotesIcon,
  GraduationCap as AcademicCapIcon,
  Globe as GlobeAltIcon,
  CheckCircle as CheckCircleIcon,
  CircleCheck as DocumentCheckIcon,
  TrendingUp as ArrowTrendingUpIcon,
  PieChart as ChartPieIcon,
  Download as DownloadIcon,
  BookOpen as BookOpenIcon,
  Send as PaperAirplaneIcon,
  MessageSquare as ChatBubbleLeftRightIcon,
  Trash2 as TrashIcon,
  Sparkles as SparklesIcon,
  Wand2 as WandSparklesIcon,
  Check as CheckIcon,
  Link as LinkIcon,
  Lock as LockClosedIcon,
  ClipboardList as ClipboardListIcon,
  PlusCircle as PlusCircleIcon,
  CalendarDays as CalendarDaysIcon,
  Clipboard as ClipboardIcon,
  Settings as Cog6ToothIcon,
  LogOut as ArrowLeftOnRectangleIcon,
  Eye as EyeIcon,
  EyeOff as EyeSlashIcon,
  Pencil as PencilIcon,
  Search as MagnifyingGlassIcon,
  Filter as FunnelIcon,
  Calendar as CalendarIcon,
  Camera as CameraIcon,
  HelpCircle as QuestionMarkCircleIcon,
  Clock as ClockIcon,
} from 'lucide-react';
```

**Step 2: Verify no TypeScript errors**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

**Step 3: Test build**

Run: `cd frontend && npm run build`
Expected: Build completes successfully

**Step 4: Commit**

```bash
git add frontend/src/components/common/Icons.tsx
git commit -m "refactor(icons): replace custom SVGs with lucide-react icons

- Replace 41 custom hand-coded SVG icon components
- Re-export lucide-react icons with same names for backward compatibility
- Zero breaking changes to consuming components"
```

---

## Task 3: Visual Regression Testing

**Files:**
- Test in: All pages using icons

**Step 1: Start dev server**

Run: `cd frontend && npm run dev`

**Step 2: Manual visual verification checklist**

Navigate to each page and verify icons render correctly:

- [ ] LandingPage - HomeIcon
- [ ] Dashboard - CalendarDaysIcon, DownloadIcon
- [ ] Settings - UserIcon, BanknotesIcon, Cog6ToothIcon, etc.
- [ ] Sidebar - All navigation icons
- [ ] AIAssistant - Chat icons
- [ ] TaskManager - Clipboard, Plus, Trash icons
- [ ] Admin pages - All action icons

**Step 3: Verify icon styling**

Check that icons maintain:
- Same sizing (w-4 h-4, w-5 h-5, w-6 h-6, w-8 h-8)
- Same colors (text-primary-500, text-gray-400, etc.)
- Same hover states

**Step 4: Commit (if all tests pass)**

```bash
git commit --allow-empty -m "test(icons): verify lucide icons render correctly"
```

---

## Task 4: Cleanup & Documentation

**Files:**
- Create: `docs/icon-usage.md`

**Step 1: Create icon usage documentation**

```markdown
# Icon Usage Guide

This project uses [Lucide React](https://lucide.dev/icons/) icons.

## Import Pattern

All icons are exported from `@/components/common/Icons`:

```tsx
import { HomeIcon, UserIcon } from '@/components/common/Icons';
```

## Available Icons

Icons are aliased from Lucide with familiar names:
- `HomeIcon` → Lucide `Home`
- `UserIcon` → Lucide `User`
- `TrashIcon` → Lucide `Trash2`
- `XMarkIcon` → Lucide `X`
- See `Icons.tsx` for full list

## Adding New Icons

1. Find icon on [lucide.dev](https://lucide.dev/icons/)
2. Add re-export to `Icons.tsx`:
   ```tsx
   export { IconName as MyIconName } from 'lucide-react';
   ```
3. Or import directly in component:
   ```tsx
   import { IconName } from 'lucide-react';
   ```

## Icon Styling

Use Tailwind classes:
- Size: `w-4 h-4`, `w-5 h-5`, `w-6 h-6`, `w-8 h-8`
- Color: `text-primary-500`, `text-gray-400`, `text-red-500`
- Current color: Icons inherit `currentColor` by default
```

**Step 2: Commit documentation**

```bash
git add docs/icon-usage.md
git commit -m "docs: add icon usage guide for lucide-react"
```

---

## Summary

**What changes:**
- Package: Add `lucide-react` dependency
- Icons.tsx: Replace 41 custom SVGs with Lucide re-exports
- Zero changes to 12+ consuming components

**Benefits:**
- Consistent, maintained icon library
- 1000+ additional icons available
- Better TypeScript support
- Smaller bundle (tree-shakeable)
- Accessibility built-in

**Breaking changes:** None

**Estimated time:** 15-20 minutes
