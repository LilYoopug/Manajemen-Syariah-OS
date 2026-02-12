# Story 2.5: Toggle Task Completion with History Recording

Status: done

## Story

As a user,
I want to toggle my task completion (binary or incremental),
So that I can track my daily progress and the system records my activity history.

## Acceptance Criteria

1. **TaskHistories Table Exists**
   - Given the task_histories migration exists with columns: id, task_id (foreign, cascade delete), value (integer), note (string, nullable), timestamp, created_at, updated_at
   - And the TaskHistory model exists with relationship to Task

2. **Binary Toggle (hasLimit: false)**
   - Given a task with `hasLimit: false` (binary toggle)
   - When the user PATCHes `/api/tasks/{id}/toggle`
   - Then the task's `completed` field is toggled (true ↔ false)
   - And a TaskHistory entry is automatically created recording the change
   - And the response returns the updated task via TaskResource

3. **Incremental Progress (hasLimit: true)**
   - Given a task with `hasLimit: true` and `incrementValue: 5`
   - When the user PATCHes `/api/tasks/{id}/toggle`
   - Then `currentValue` is incremented by `incrementValue`
   - And if `currentValue >= targetValue`, the task is marked `completed: true`
   - And `progress` is recalculated as `(currentValue / targetValue) * 100`
   - And a TaskHistory entry is recorded with the new value

4. **View Task History**
   - Given an authenticated user owns a task with history entries
   - When they GET `/api/tasks/{id}` (or task includes history)
   - Then the task's history entries are included/accessible
   - And history is returned via TaskHistoryResource collection

## Tasks / Subtasks

- [x] Task 1: Create TaskHistoryResource (AC: 4)
  - [x] Create `app/Http/Resources/TaskHistoryResource.php`
  - [x] Transform snake_case to camelCase for JSON response
  - [x] Include id, value, note, timestamp, createdAt, updatedAt

- [x] Task 2: Add toggle method to TaskController (AC: 2, 3)
  - [x] Add `toggle()` method to existing `app/Http/Controllers/Api/TaskController.php`
  - [x] Implement binary toggle logic (hasLimit: false)
  - [x] Implement incremental progress logic (hasLimit: true)
  - [x] Create TaskHistory entry on each toggle
  - [x] Return updated task via TaskResource

- [x] Task 3: Add show method to TaskController (AC: 4)
  - [x] Add `show()` method to TaskController
  - [x] Include history entries in response
  - [x] Return task with history via TaskResource

- [x] Task 4: Add toggle and show routes in api.php (AC: 2, 4)
  - [x] Add `PATCH /api/tasks/{id}/toggle` route
  - [x] Add `GET /api/tasks/{id}` route
  - [x] Routes must be protected with `auth:sanctum` middleware

- [x] Task 5: Create feature tests (AC: 1-4)
  - [x] Create `tests/Feature/Task/TaskToggleTest.php`
  - [x] Test binary toggle completes task
  - [x] Test binary toggle uncompletes task
  - [x] Test incremental progress updates currentValue
  - [x] Test auto-complete when target reached
  - [x] Test progress calculation
  - [x] Test history entry is created
  - [x] Test user cannot toggle other user's task
  - [x] Test unauthenticated request returns 401

## Dev Notes

### Architecture Patterns

- **User Scoping:** Always scope task lookup to authenticated user
- **History Recording:** Every toggle creates a TaskHistory entry
- **Progress Calculation:** `progress = (currentValue / targetValue) * 100`
- **Activity Logging:** Use ActivityLogService for task completion activities

### Request/Response Format

**Toggle Request (no body needed):**
```
PATCH /api/tasks/{id}/toggle
```

**Toggle Success Response (200 OK):**
```json
{
  "message": "Task toggled successfully",
  "data": {
    "id": 1,
    "text": "Bayar Zakat Mal",
    "completed": true,
    "category": "Keuangan",
    "progress": 100,
    "hasLimit": true,
    "currentValue": 10000000,
    "targetValue": 10000000,
    "unit": "IDR",
    "resetCycle": "monthly",
    "perCheckEnabled": false,
    "incrementValue": 1000000,
    "lastResetAt": null,
    "createdAt": "2026-02-12T10:00:00Z",
    "updatedAt": "2026-02-12T12:00:00Z"
  }
}
```

**Show Task Response (200 OK):**
```json
{
  "data": {
    "id": 1,
    "text": "Bayar Zakat Mal",
    "completed": true,
    "history": [
      {
        "id": 1,
        "value": 1000000,
        "note": null,
        "timestamp": "2026-02-12T10:00:00Z",
        "createdAt": "2026-02-12T10:00:00Z",
        "updatedAt": "2026-02-12T10:00:00Z"
      }
    ]
  }
}
```

### TaskHistory Model Fields

| Field | Type | Description |
|-------|------|-------------|
| task_id | foreign | Parent task ID |
| value | integer | Value recorded (increment amount or 1 for binary) |
| note | string | Optional note |
| timestamp | datetime | When the history entry was recorded |

### Previous Story Intelligence

From completed stories:

1. **Task Model Has History Relationship:** `$task->history()` returns HasMany
2. **TaskHistory Model Exists:** With fillable fields and task() relationship
3. **Task_histories Migration Exists:** With cascade delete on task deletion
4. **TaskController Exists:** Add toggle() and show() methods
5. **TaskResource Exists:** May need to add history transformation

### File Structure Requirements

```
backend/
├── app/
│   └── Http/
│       ├── Controllers/
│       │   └── Api/
│       │       └── TaskController.php           ← MODIFY (add toggle, show)
│       └── Resources/
│           └── TaskHistoryResource.php          ← NEW
├── routes/
│   └── api.php                                  ← MODIFY
└── tests/
    └── Feature/
        └── Task/
            └── TaskToggleTest.php               ← NEW
```

### Key Files to Create/Modify

1. **NEW** `backend/app/Http/Resources/TaskHistoryResource.php` - History response transformation
2. **MODIFY** `backend/app/Http/Controllers/Api/TaskController.php` - Add toggle/show methods
3. **MODIFY** `backend/app/Http/Resources/TaskResource.php` - Add history to response (optional)
4. **MODIFY** `backend/routes/api.php` - Add toggle and show routes
5. **NEW** `backend/tests/Feature/Task/TaskToggleTest.php` - Toggle feature tests

### Testing Standards

- Feature tests in `tests/Feature/Task/`
- Test both binary and incremental toggle modes
- Test history creation on toggle
- Test progress calculation
- Test auto-complete when target reached
- Test user scoping
- Test unauthenticated request handling

### Security Considerations

- Tasks are user-scoped - users can only toggle their own tasks
- History is created server-side - no user input needed for toggle
- Use findOrFail() through user's tasks relationship

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.5]
- [Source: backend/app/Models/Task.php - Task model with history relationship]
- [Source: backend/app/Models/TaskHistory.php - TaskHistory model]
- [Source: backend/database/migrations/2026_02_12_000004_create_task_histories_table.php]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6-20250528)

### Debug Log References

N/A - Implementation completed without blocking issues.

### Completion Notes List

1. TaskHistoryResource already existed - added updatedAt field
2. TaskResource already included history via whenLoaded('history')
3. Added show() method to TaskController with eager loading of history
4. Added toggle() method with two modes:
   - Binary toggle: toggles completed status, sets progress to 0 or 100
   - Incremental: increments currentValue, calculates progress percentage, auto-completes when target reached
5. Created TaskHistory entry on every toggle
6. Activity logging for completed, uncompleted, and progressed actions
7. Created TaskToggleTest.php with 12 test cases covering:
   - Binary toggle completes/uncompletes
   - Incremental progress updates
   - Auto-complete when target reached
   - Progress capping at 100
   - History entry creation
   - User scoping (404 for other user's task)
   - Unauthenticated request handling
   - Multiple history entries from multiple toggles
8. Created TaskShowTest.php with 6 test cases

### File List

**New Files:**
- backend/tests/Feature/Task/TaskToggleTest.php
- backend/tests/Feature/Task/TaskShowTest.php

**Modified Files:**
- backend/app/Http/Controllers/Api/TaskController.php
- backend/app/Http/Resources/TaskHistoryResource.php
- backend/routes/api.php
