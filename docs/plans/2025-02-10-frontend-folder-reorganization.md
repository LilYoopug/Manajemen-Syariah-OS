# Frontend Folder Structure Reorganization Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reorganize the frontend folder structure to follow industry-standard React/TypeScript project organization while ensuring zero import breakage.

**Architecture:** Implement a feature-based folder structure with clear separation of concerns: pages, components (common/feature-specific), hooks, types, and constants. Use path aliases (`@/*`) configured in tsconfig.json to make imports clean and maintainable.

**Tech Stack:** React, TypeScript, Vite, Tailwind CSS

---

## Current Structure Analysis

```
frontend/
├── App.tsx
├── index.tsx
├── types.ts
├── constants/index.ts
├── hooks/useLocalStorage.ts
├── components/
│   ├── AdminDashboard.tsx
│   ├── AdminToolManager.tsx
│   ├── AdminUserManager.tsx
│   ├── AIAssistant.tsx
│   ├── AIGenerator.tsx
│   ├── AIInsightCard.tsx
│   ├── Auth.tsx
│   ├── Dashboard.tsx
│   ├── Directory.tsx
│   ├── DirectoryDetailModal.tsx
│   ├── GoalTracker.tsx
│   ├── Header.tsx
│   ├── Icons.tsx
│   ├── KpiCard.tsx
│   ├── LandingPage.tsx
│   ├── Settings.tsx
│   ├── Sidebar.tsx
│   ├── TaskManager.tsx
│   ├── ToolDetailModal.tsx
│   └── ToolsCatalog.tsx
```

## Target Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── AdminToolManager.tsx
│   │   │   └── AdminUserManager.tsx
│   │   ├── ai/
│   │   │   ├── AIAssistant.tsx
│   │   │   ├── AIGenerator.tsx
│   │   │   └── AIInsightCard.tsx
│   │   ├── auth/
│   │   │   └── Auth.tsx
│   │   ├── common/
│   │   │   ├── Icons.tsx
│   │   │   └── KpiCard.tsx
│   │   ├── dashboard/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Directory.tsx
│   │   │   ├── DirectoryDetailModal.tsx
│   │   │   ├── GoalTracker.tsx
│   │   │   ├── TaskManager.tsx
│   │   │   ├── ToolDetailModal.tsx
│   │   │   └── ToolsCatalog.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   └── Sidebar.tsx
│   │   └── pages/
│   │       ├── LandingPage.tsx
│   │       └── Settings.tsx
│   ├── constants/
│   │   └── index.ts
│   ├── hooks/
│   │   └── useLocalStorage.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   └── index.tsx
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Import Mapping Reference

All imports need to be updated from relative paths (`./components/...`, `../types`) to path aliases (`@/components/...`, `@/types`).

**tsconfig.json already has path alias configured:**
```json
"paths": {
  "@/*": ["./*"]
}
```

**Import Transformations:**
- `./components/Sidebar` → `@/components/layout/Sidebar`
- `./components/Dashboard` → `@/components/dashboard/Dashboard`
- `../types` → `@/types`
- `../components/Icons` → `@/components/common/Icons`
- `./constants` → `@/constants`
- `./hooks/useLocalStorage` → `@/hooks/useLocalStorage`

---

## Task Breakdown

### Task 1: Create New Directory Structure

**Files:**
- Create directories only (no file moves yet)

**Step 1: Create directory tree**

```bash
cd frontend
mkdir -p src/components/admin
mkdir -p src/components/ai
mkdir -p src/components/auth
mkdir -p src/components/common
mkdir -p src/components/dashboard
mkdir -p src/components/layout
mkdir -p src/components/pages
mkdir -p src/constants
mkdir -p src/hooks
mkdir -p src/types
```

**Step 2: Verify directory creation**

```bash
ls -la src/
ls -la src/components/
```

Expected: All directories exist

**Step 3: Commit**

```bash
git add -A
git commit -m "chore: create new folder structure for frontend organization"
```

---

### Task 2: Move and Update Types File

**Files:**
- Move: `types.ts` → `src/types/index.ts`
- Update all imports referencing `../types` or `./types`

**Step 1: Move the file**

```bash
cd frontend
mv types.ts src/types/index.ts
```

**Step 2: Update imports in all files referencing types**

Files to update:
- `constants/index.ts`: Change `../types` → `@/types`
- All component files with `../types` → `@/types`
- All component files with `./types` → `@/types`

**Step 3: Verify no broken imports**

```bash
npm run build 2>&1 | head -50
```

Expected: Build succeeds or shows errors we can fix

**Step 4: Commit**

```bash
git add -A
git commit -m "refactor: move types.ts to src/types/index.ts"
```

---

### Task 3: Move Constants

**Files:**
- Move: `constants/index.ts` → `src/constants/index.ts`

**Step 1: Move the file**

```bash
cd frontend
mv constants/index.ts src/constants/index.ts
rmdir constants 2>/dev/null || true
```

**Step 2: Update imports**

Update `App.tsx`:
- Change `from './constants'` → `from '@/constants'`

**Step 3: Verify build**

```bash
npm run build 2>&1 | head -50
```

**Step 4: Commit**

```bash
git add -A
git commit -m "refactor: move constants to src/constants/"
```

---

### Task 4: Move Hooks

**Files:**
- Move: `hooks/useLocalStorage.ts` → `src/hooks/useLocalStorage.ts`

**Step 1: Move the file**

```bash
cd frontend
mv hooks/useLocalStorage.ts src/hooks/useLocalStorage.ts
rmdir hooks 2>/dev/null || true
```

**Step 2: Update imports**

Update `App.tsx`:
- Change `from './hooks/useLocalStorage'` → `from '@/hooks/useLocalStorage'`

**Step 3: Verify build**

```bash
npm run build 2>&1 | head -50
```

**Step 4: Commit**

```bash
git add -A
git commit -m "refactor: move hooks to src/hooks/"
```

---

### Task 5: Move Common Components (Icons, KpiCard)

**Files:**
- Move: `components/Icons.tsx` → `src/components/common/Icons.tsx`
- Move: `components/KpiCard.tsx` → `src/components/common/KpiCard.tsx`

**Step 1: Move the files**

```bash
cd frontend
mv components/Icons.tsx src/components/common/Icons.tsx
mv components/KpiCard.tsx src/components/common/KpiCard.tsx
```

**Step 2: Update imports in all files**

Files referencing `Icons.tsx`:
- `App.tsx`: `./components/Icons` → `@/components/common/Icons`
- `constants/index.ts`: `../components/Icons` → `@/components/common/Icons`
- `Dashboard.tsx`: `./Icons` → `@/components/common/Icons`
- `AIAssistant.tsx`: `./Icons` → `@/components/common/Icons`
- `AdminDashboard.tsx`: `./Icons` → `@/components/common/Icons`
- `AIGenerator.tsx`: `./Icons` → `@/components/common/Icons`
- `GoalTracker.tsx`: `./Icons` → `@/components/common/Icons`
- `Header.tsx`: `./Icons` → `@/components/common/Icons`
- `LandingPage.tsx`: `./Icons` → `@/components/common/Icons`
- `Settings.tsx`: `./Icons` → `@/components/common/Icons`
- `Sidebar.tsx`: `./Icons` → `@/components/common/Icons`
- `TaskManager.tsx`: `./Icons` → `@/components/common/Icons`
- `ToolDetailModal.tsx`: `./Icons` → `@/components/common/Icons`
- `ToolsCatalog.tsx`: `./Icons` → `@/components/common/Icons`

Files referencing `KpiCard.tsx`:
- `Dashboard.tsx`: `./KpiCard` → `@/components/common/KpiCard`

**Step 3: Verify build**

```bash
npm run build 2>&1 | head -50
```

**Step 4: Commit**

```bash
git add -A
git commit -m "refactor: move Icons and KpiCard to src/components/common/"
```

---

### Task 6: Move Layout Components (Header, Sidebar)

**Files:**
- Move: `components/Header.tsx` → `src/components/layout/Header.tsx`
- Move: `components/Sidebar.tsx` → `src/components/layout/Sidebar.tsx`

**Step 1: Move the files**

```bash
cd frontend
mv components/Header.tsx src/components/layout/Header.tsx
mv components/Sidebar.tsx src/components/layout/Sidebar.tsx
```

**Step 2: Update imports**

Update `App.tsx`:
- `./components/Header` → `@/components/layout/Header`
- `./components/Sidebar` → `@/components/layout/Sidebar`

Update `Header.tsx` internal imports:
- `./Icons` → `@/components/common/Icons`
- `./Sidebar` import (if any internal) → `@/components/layout/Sidebar`

Update `Sidebar.tsx` internal imports:
- `./Icons` → `@/components/common/Icons`
- `./Directory` → `@/components/dashboard/Directory`
- `../types` → `@/types`

**Step 3: Verify build**

```bash
npm run build 2>&1 | head -50
```

**Step 4: Commit**

```bash
git add -A
git commit -m "refactor: move Header and Sidebar to src/components/layout/"
```

---

### Task 7: Move Auth Component

**Files:**
- Move: `components/Auth.tsx` → `src/components/auth/Auth.tsx`

**Step 1: Move the file**

```bash
cd frontend
mv components/Auth.tsx src/components/auth/Auth.tsx
```

**Step 2: Update imports**

Update `App.tsx`:
- `./components/Auth` → `@/components/auth/Auth`

Update `Auth.tsx` internal imports:
- `./Icons` → `@/components/common/Icons`

**Step 3: Verify build**

```bash
npm run build 2>&1 | head -50
```

**Step 4: Commit**

```bash
git add -A
git commit -m "refactor: move Auth to src/components/auth/"
```

---

### Task 8: Move Admin Components

**Files:**
- Move: `components/AdminDashboard.tsx` → `src/components/admin/AdminDashboard.tsx`
- Move: `components/AdminToolManager.tsx` → `src/components/admin/AdminToolManager.tsx`
- Move: `components/AdminUserManager.tsx` → `src/components/admin/AdminUserManager.tsx`

**Step 1: Move the files**

```bash
cd frontend
mv components/AdminDashboard.tsx src/components/admin/AdminDashboard.tsx
mv components/AdminToolManager.tsx src/components/admin/AdminToolManager.tsx
mv components/AdminUserManager.tsx src/components/admin/AdminUserManager.tsx
```

**Step 2: Update imports**

Update `App.tsx`:
- `./components/AdminDashboard` → `@/components/admin/AdminDashboard`
- `./components/AdminToolManager` → `@/components/admin/AdminToolManager`
- `./components/AdminUserManager` → `@/components/admin/AdminUserManager`

Update admin component internal imports:
- `./Icons` → `@/components/common/Icons`
- `./KpiCard` → `@/components/common/KpiCard`
- `../types` → `@/types`

**Step 3: Verify build**

```bash
npm run build 2>&1 | head -50
```

**Step 4: Commit**

```bash
git add -A
git commit -m "refactor: move admin components to src/components/admin/"
```

---

### Task 9: Move AI Components

**Files:**
- Move: `components/AIAssistant.tsx` → `src/components/ai/AIAssistant.tsx`
- Move: `components/AIGenerator.tsx` → `src/components/ai/AIGenerator.tsx`
- Move: `components/AIInsightCard.tsx` → `src/components/ai/AIInsightCard.tsx`

**Step 1: Move the files**

```bash
cd frontend
mv components/AIAssistant.tsx src/components/ai/AIAssistant.tsx
mv components/AIGenerator.tsx src/components/ai/AIGenerator.tsx
mv components/AIInsightCard.tsx src/components/ai/AIInsightCard.tsx
```

**Step 2: Update imports**

Update `App.tsx`:
- `./components/AIAssistant` → `@/components/ai/AIAssistant`
- `./components/AIGenerator` → `@/components/ai/AIGenerator`

Update AI component internal imports:
- `./Icons` → `@/components/common/Icons`
- `./AIInsightCard` → `@/components/ai/AIInsightCard`
- `../types` → `@/types`

**Step 3: Verify build**

```bash
npm run build 2>&1 | head -50
```

**Step 4: Commit**

```bash
git add -A
git commit -m "refactor: move AI components to src/components/ai/"
```

---

### Task 10: Move Page Components

**Files:**
- Move: `components/LandingPage.tsx` → `src/components/pages/LandingPage.tsx`
- Move: `components/Settings.tsx` → `src/components/pages/Settings.tsx`

**Step 1: Move the files**

```bash
cd frontend
mv components/LandingPage.tsx src/components/pages/LandingPage.tsx
mv components/Settings.tsx src/components/pages/Settings.tsx
```

**Step 2: Update imports**

Update `App.tsx`:
- `./components/LandingPage` → `@/components/pages/LandingPage`
- `./components/Settings` → `@/components/pages/Settings`

Update page component internal imports:
- `./Icons` → `@/components/common/Icons`
- `../types` → `@/types`

**Step 3: Verify build**

```bash
npm run build 2>&1 | head -50
```

**Step 4: Commit**

```bash
git add -A
git commit -m "refactor: move page components to src/components/pages/"
```

---

### Task 11: Move Dashboard Components

**Files:**
- Move: `components/Dashboard.tsx` → `src/components/dashboard/Dashboard.tsx`
- Move: `components/Directory.tsx` → `src/components/dashboard/Directory.tsx`
- Move: `components/DirectoryDetailModal.tsx` → `src/components/dashboard/DirectoryDetailModal.tsx`
- Move: `components/GoalTracker.tsx` → `src/components/dashboard/GoalTracker.tsx`
- Move: `components/TaskManager.tsx` → `src/components/dashboard/TaskManager.tsx`
- Move: `components/ToolDetailModal.tsx` → `src/components/dashboard/ToolDetailModal.tsx`
- Move: `components/ToolsCatalog.tsx` → `src/components/dashboard/ToolsCatalog.tsx`

**Step 1: Move the files**

```bash
cd frontend
mv components/Dashboard.tsx src/components/dashboard/Dashboard.tsx
mv components/Directory.tsx src/components/dashboard/Directory.tsx
mv components/DirectoryDetailModal.tsx src/components/dashboard/DirectoryDetailModal.tsx
mv components/GoalTracker.tsx src/components/dashboard/GoalTracker.tsx
mv components/TaskManager.tsx src/components/dashboard/TaskManager.tsx
mv components/ToolDetailModal.tsx src/components/dashboard/ToolDetailModal.tsx
mv components/ToolsCatalog.tsx src/components/dashboard/ToolsCatalog.tsx
```

**Step 2: Update imports**

Update `App.tsx`:
- `./components/Dashboard` → `@/components/dashboard/Dashboard`
- `./components/ToolsCatalog` → `@/components/dashboard/ToolsCatalog`
- `./components/TaskManager` → `@/components/dashboard/TaskManager`
- `./components/AIGenerator` → `@/components/ai/AIGenerator` (already done)
- `./components/DirectoryDetailModal` → `@/components/dashboard/DirectoryDetailModal`

Update dashboard component internal imports:
- `./Icons` → `@/components/common/Icons`
- `./KpiCard` → `@/components/common/KpiCard`
- `./GoalTracker` → `@/components/dashboard/GoalTracker`
- `./AIInsightCard` → `@/components/ai/AIInsightCard`
- `./ToolDetailModal` → `@/components/dashboard/ToolDetailModal`
- `./ToolsCatalog` → `@/components/dashboard/ToolsCatalog`
- `./Directory` → `@/components/dashboard/Directory`
- `../types` → `@/types`
- `../constants` → `@/constants`

**Step 3: Remove empty components directory**

```bash
rmdir components 2>/dev/null || true
```

**Step 4: Verify build**

```bash
npm run build 2>&1 | head -50
```

**Step 5: Commit**

```bash
git add -A
git commit -m "refactor: move dashboard components to src/components/dashboard/"
```

---

### Task 12: Move Root Files to src/

**Files:**
- Move: `App.tsx` → `src/App.tsx`
- Move: `index.tsx` → `src/index.tsx`

**Step 1: Move the files**

```bash
cd frontend
mv App.tsx src/App.tsx
mv index.tsx src/index.tsx
```

**Step 2: Update imports in index.tsx**

Update `index.tsx`:
- `./App` → `@/App`

**Step 3: Update index.html script src**

Update `index.html`:
- Change `src="/index.tsx"` → `src="/src/index.tsx"`

**Step 4: Verify build**

```bash
npm run build 2>&1 | head -50
```

**Step 5: Commit**

```bash
git add -A
git commit -m "refactor: move App.tsx and index.tsx to src/"
```

---

### Task 13: Final Verification and Cleanup

**Step 1: Run full build**

```bash
cd frontend
npm run build
```

Expected: Clean build with no errors

**Step 2: Verify file structure**

```bash
tree -L 4 -I 'node_modules' src/
```

Expected structure:
```
src/
├── App.tsx
├── components/
│   ├── admin/
│   ├── ai/
│   ├── auth/
│   ├── common/
│   ├── dashboard/
│   ├── layout/
│   └── pages/
├── constants/
├── hooks/
├── index.tsx
└── types/
```

**Step 3: Create barrel exports for cleaner imports (optional but recommended)**

Create `src/components/index.ts`:
```typescript
export * from './common';
export * from './layout';
export * from './dashboard';
export * from './admin';
export * from './ai';
export * from './auth';
export * from './pages';
```

Create index files for each component folder:
- `src/components/common/index.ts`
- `src/components/layout/index.ts`
- etc.

**Step 4: Final commit**

```bash
git add -A
git commit -m "chore: add barrel exports for cleaner imports"
```

---

## Rollback Plan

If something goes wrong at any step:

```bash
git reset --hard HEAD~1  # Go back one commit
git status               # Verify working directory is clean
```

---

## Testing Checklist

- [ ] `npm run build` completes without errors
- [ ] All imports use `@/` path alias
- [ ] No relative imports crossing folder boundaries (`../../`)
- [ ] Directory structure matches target structure
- [ ] Application runs correctly (`npm run dev`)
- [ ] All component functionality preserved

---

## Summary

This reorganization:
1. **Groups components by feature** (admin, ai, auth, dashboard, layout, pages)
2. **Separates shared components** into `common/` folder
3. **Centralizes types and constants** in dedicated folders
4. **Uses path aliases** for cleaner, maintainable imports
5. **Follows industry standards** for React/TypeScript projects
6. **Preserves all functionality** with zero breaking changes
