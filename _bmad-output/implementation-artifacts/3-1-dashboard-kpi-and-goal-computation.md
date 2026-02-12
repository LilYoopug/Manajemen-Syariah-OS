# Story 3.1: Dashboard KPI and Goal Computation

Status: done

## Story

As a user,
I want to view my dashboard with KPI metrics and goal progress,
So that I can understand my overall Islamic business compliance performance at a glance.

## Acceptance Criteria

1. **Dashboard KPI Data**
   - Given an authenticated user has tasks
   - When they GET `/api/dashboard`
   - Then the response includes computed KPI data:
     - Total tasks count
     - Completed tasks count
     - Completion percentage
     - Tasks by category with completion rates
     - Kepatuhan Syariah score (% of compliance tasks completed)

2. **Goal Progress Data**
   - Given an authenticated user has tasks with targets
   - When they GET `/api/dashboard`
   - Then the response includes goal progress data:
     - Per-category goal progress computed from tasks with targets
     - Overall goal achievement percentage

3. **Live Computation**
   - All metrics are computed live from the tasks table via `DashboardService` (no stored aggregates)
   - Response uses DashboardResource with camelCase keys
   - Response time is within 1 second for up to 1,000 tasks (NFR2)

4. **Empty State**
   - Given a user has no tasks
   - When they GET `/api/dashboard`
   - Then the response returns zeroed-out metrics (not an error)

## Tasks / Subtasks

- [x] Task 1: Create DashboardService (AC: 1, 2, 3)
  - [x] Create `app/Services/DashboardService.php`
  - [x] Implement getKpiData() method
  - [x] Implement getGoalProgress() method
  - [x] Compute metrics live from tasks table

- [x] Task 2: Create DashboardController (AC: 1, 2, 3, 4)
  - [x] Create `app/Http/Controllers/Api/DashboardController.php`
  - [x] Implement index() method using DashboardService
  - [x] Handle empty tasks case

- [x] Task 3: Create DashboardResource (AC: 3)
  - [x] Create `app/Http/Resources/DashboardResource.php`
  - [x] Transform data to camelCase format

- [x] Task 4: Add dashboard route (AC: 1)
  - [x] Add `GET /api/dashboard` route in api.php
  - [x] Route protected with `auth:sanctum` middleware

- [x] Task 5: Create feature tests (AC: 1-4)
  - [x] Create `tests/Feature/Dashboard/DashboardTest.php`
  - [x] Test KPI computation
  - [x] Test goal progress computation
  - [x] Test empty state
  - [x] Test unauthenticated request

## Dev Notes

### KPI Metrics

| Metric | Description |
|--------|-------------|
| totalTasks | Total number of user's tasks |
| completedTasks | Number of completed tasks |
| completionPercentage | (completedTasks / totalTasks) * 100 |
| tasksByCategory | Array of { category, total, completed, rate } |
| kepatuhanSyariahScore | % of tasks in "Kepatuhan" category completed |

### Goal Progress

| Metric | Description |
|--------|-------------|
| goals | Array of per-category goal progress |
| overallProgress | Average of all goal progress percentages |

### Response Format

```json
{
  "data": {
    "kpi": {
      "totalTasks": 10,
      "completedTasks": 5,
      "completionPercentage": 50,
      "tasksByCategory": [
        { "category": "Keuangan", "total": 4, "completed": 2, "rate": 50 }
      ],
      "kepatuhanSyariahScore": 75
    },
    "goals": [
      { "category": "Keuangan", "currentValue": 5000000, "targetValue": 10000000, "progress": 50 }
    ],
    "overallProgress": 50
  }
}
```

### File Structure

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/
│   │   │   └── DashboardController.php  ← NEW
│   │   └── Resources/
│   │       └── DashboardResource.php    ← NEW
│   └── Services/
│       └── DashboardService.php         ← NEW
├── routes/
│   └── api.php                          ← MODIFY
└── tests/
    └── Feature/
        └── Dashboard/
            └── DashboardTest.php        ← NEW
```

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.1]
- [Source: frontend/src/types/index.ts - Kpi, Goal interfaces]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6-20250528)

### Debug Log References

N/A - Implementation completed without blocking issues.

### Completion Notes List

1. Created DashboardService with:
   - getKpiData(): Computes total/completed tasks, completion %, tasks by category, Kepatuhan Syariah score
   - getGoalProgress(): Computes per-category goals and overall progress from tasks with numeric targets
   - getChartTrendData(): Aggregates history entries by week for last 8 weeks
   - getDashboardData(): Combines all data for the dashboard endpoint
2. Created DashboardController with index() method
3. Updated DashboardResource to transform data to camelCase
4. Added GET /api/dashboard route
5. Created DashboardTest with 10 test cases covering:
   - KPI data structure and computation
   - Tasks by category calculation
   - Kepatuhan Syariah score
   - Goal progress computation
   - Overall progress calculation
   - Empty state handling
   - User scoping
   - Unauthenticated request
   - Chart trend data
   - Progress capping at 100

### File List

**New Files:**
- backend/app/Services/DashboardService.php
- backend/app/Http/Controllers/Api/DashboardController.php
- backend/tests/Feature/Dashboard/DashboardTest.php

**Modified Files:**
- backend/app/Http/Resources/DashboardResource.php
- backend/routes/api.php
