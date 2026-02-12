# Story 3.2: Dashboard Chart Trend Data

Status: done

## Story

As a user,
I want to view chart data showing my task completion trends over time,
So that I can track my performance trajectory visually.

## Acceptance Criteria

1. **Chart Trend Data Included**
   - Given an authenticated user has tasks with history entries
   - When they GET `/api/dashboard`
   - Then the response includes chart trend data:
     - Weekly completion counts (last 8 weeks)
     - Aggregated from task_histories timestamps
     - Formatted for frontend chart consumption (labels + values arrays)

2. **Empty State**
   - Given a user has no history data
   - When they GET `/api/dashboard`
   - Then chart data returns empty arrays (not an error)

3. **Service Implementation**
   - Chart computation is handled in `DashboardService`
   - Response shape matches frontend's chart component expectations

## Tasks / Subtasks

- [x] Task 1: Implement chart trend in DashboardService (AC: 1, 2)
  - [x] Add getChartTrendData() method
  - [x] Aggregate history entries by week
  - [x] Return labels and values arrays

- [x] Task 2: Include in DashboardResource (AC: 1)
  - [x] Add chartTrend to DashboardResource transformation
  - [x] Format as { labels: [], values: [] }

- [x] Task 3: Test chart trend data (AC: 1, 2)
  - [x] Test chart data structure
  - [x] Test empty state

## Dev Notes

### Chart Data Format

```json
{
  "chartTrend": {
    "labels": ["Jan 01 - Jan 07", "Jan 08 - Jan 14", ...],
    "values": [5, 3, 8, 2, 6, 4, 7, 10]
  }
}
```

### Implementation

Chart trend data was implemented in Story 3-1's DashboardService as part of the complete dashboard data. The `getChartTrendData()` method:
- Generates labels for last 8 weeks
- Counts history entries per week
- Returns arrays for frontend chart consumption

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6-20250528)

### Completion Notes List

Chart trend data was implemented as part of Story 3-1:
- getChartTrendData() method in DashboardService
- Aggregates task_histories by week for last 8 weeks
- Returns labels (date ranges) and values (activity counts) arrays
- Tests included in DashboardTest

### File List

All files created/modified in Story 3-1:
- backend/app/Services/DashboardService.php
- backend/app/Http/Resources/DashboardResource.php
- backend/tests/Feature/Dashboard/DashboardTest.php
