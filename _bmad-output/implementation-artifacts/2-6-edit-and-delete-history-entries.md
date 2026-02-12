# Story 2.6: Edit and Delete History Entries

Status: done

## Story

As a user,
I want to edit or delete individual history entries,
So that I can correct mistakes and the system recalculates my task progress accurately.

## Acceptance Criteria

1. **Edit History Entry**
   - Given an authenticated user owns a task with history entries
   - When they PUT `/api/tasks/{id}/history/{entryId}` with updated value and/or note
   - Then the history entry is updated via UpdateHistoryRequest validation
   - And the parent task's `currentValue` and `progress` are recalculated from all remaining history entries
   - And the response returns the updated history entry

2. **Delete History Entry**
   - Given an authenticated user owns a task with history entries
   - When they DELETE `/api/tasks/{id}/history/{entryId}`
   - Then the history entry is deleted
   - And the parent task's `currentValue` and `progress` are recalculated from remaining entries
   - And if no entries remain, `currentValue` resets to 0 and `completed` to false

3. **Ownership Scoping**
   - Given a user tries to access history of a task they don't own
   - When they PUT or DELETE a history entry
   - Then a 404 response is returned (ownership scoping)

## Tasks / Subtasks

- [x] Task 1: Create UpdateHistoryRequest Form Request (AC: 1)
  - [x] Create `app/Http/Requests/Task/UpdateHistoryRequest.php`
  - [x] Define validation rules for value (integer, min:0) and note (nullable string)
  - [x] Configure error messages

- [x] Task 2: Add history update and delete methods to TaskController (AC: 1, 2, 3)
  - [x] Add `updateHistory()` method to TaskController
  - [x] Add `destroyHistory()` method to TaskController
  - [x] Scope lookup through user's tasks to verify ownership
  - [x] Implement recalculation logic for currentValue and progress
  - [x] Return appropriate responses

- [x] Task 3: Add history routes in api.php (AC: 1, 2)
  - [x] Add `PUT /api/tasks/{id}/history/{entryId}` route
  - [x] Add `DELETE /api/tasks/{id}/history/{entryId}` route
  - [x] Routes must be protected with `auth:sanctum` middleware

- [x] Task 4: Create feature tests (AC: 1-3)
  - [x] Create `tests/Feature/Task/TaskHistoryUpdateTest.php`
  - [x] Create `tests/Feature/Task/TaskHistoryDeleteTest.php`
  - [x] Test update history entry
  - [x] Test update triggers recalculation
  - [x] Test delete history entry
  - [x] Test delete triggers recalculation
  - [x] Test delete last entry resets task
  - [x] Test user cannot modify other user's history
  - [x] Test unauthenticated request returns 401

## Dev Notes

### Architecture Patterns

- **User Scoping:** Scope through user->tasks()->findOrFail($taskId)->history()->findOrFail($entryId)
- **Recalculation:** Sum all history values to get currentValue, then calculate progress percentage
- **Activity Logging:** Log history modifications via ActivityLogService

### Request/Response Format

**Update History Request:**
```json
{
  "value": 500,
  "note": "Corrected value"
}
```

**Update History Response (200 OK):**
```json
{
  "message": "History entry updated successfully",
  "data": {
    "id": 1,
    "value": 500,
    "note": "Corrected value",
    "timestamp": "2026-02-12T10:00:00Z"
  }
}
```

**Delete History Response (200 OK):**
```json
{
  "message": "History entry deleted successfully"
}
```

### Recalculation Logic

```php
$totalValue = $task->history()->sum('value');
$progress = $task->target_value > 0
    ? min(100, (int) round(($totalValue / $task->target_value) * 100))
    : 0;
$completed = $task->has_limit && $task->target_value > 0 && $totalValue >= $task->target_value;

$task->update([
    'current_value' => $totalValue,
    'progress' => $progress,
    'completed' => $completed,
]);
```

### File Structure Requirements

```
backend/
├── app/
│   └── Http/
│       ├── Controllers/
│       │   └── Api/
│       │       └── TaskController.php           ← MODIFY (add updateHistory, destroyHistory)
│       └── Requests/
│           └── Task/
│               └── UpdateHistoryRequest.php     ← NEW
├── routes/
│   └── api.php                                  ← MODIFY
└── tests/
    └── Feature/
        └── Task/
            ├── TaskHistoryUpdateTest.php        ← NEW
            └── TaskHistoryDeleteTest.php        ← NEW
```

### Key Files to Create/Modify

1. **NEW** `backend/app/Http/Requests/Task/UpdateHistoryRequest.php` - History validation
2. **MODIFY** `backend/app/Http/Controllers/Api/TaskController.php` - Add history update/delete
3. **MODIFY** `backend/routes/api.php` - Add history routes
4. **NEW** `backend/tests/Feature/Task/TaskHistoryUpdateTest.php` - Update tests
5. **NEW** `backend/tests/Feature/Task/TaskHistoryDeleteTest.php` - Delete tests

### Testing Standards

- Feature tests in `tests/Feature/Task/`
- Test update and delete operations
- Test recalculation logic
- Test reset behavior when all entries deleted
- Test user scoping
- Test unauthenticated request handling

### Security Considerations

- History entries are scoped through task ownership
- Use nested findOrFail() to verify ownership chain
- Input validation via Form Request

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.6]
- [Source: backend/app/Models/Task.php - Task model]
- [Source: backend/app/Models/TaskHistory.php - TaskHistory model]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6-20250528)

### Debug Log References

N/A - Implementation completed without blocking issues.

### Completion Notes List

1. Created UpdateHistoryRequest with validation for value and note fields
2. Added updateHistory() and destroyHistory() methods to TaskController
3. Implemented recalculateTaskProgress() helper method that:
   - Sums all history values for current_value
   - Calculates progress percentage for tasks with limits
   - Auto-completes when target reached
   - Resets to uncompleted when all history deleted
4. Created TaskHistoryUpdateTest.php with 8 test cases covering:
   - Update history entry
   - Recalculation on update
   - User scoping (404 for other user's history)
   - Validation for negative value
   - Unauthenticated request
   - Non-existent history/task
   - Partial update (only note)
5. Created TaskHistoryDeleteTest.php with 9 test cases covering:
   - Delete history entry
   - Recalculation on delete
   - Reset when last entry deleted
   - Uncomplete when progress falls below target
   - User scoping
   - Unauthenticated request
   - Non-existent history/task

### File List

**New Files:**
- backend/app/Http/Requests/Task/UpdateHistoryRequest.php
- backend/tests/Feature/Task/TaskHistoryUpdateTest.php
- backend/tests/Feature/Task/TaskHistoryDeleteTest.php

**Modified Files:**
- backend/app/Http/Controllers/Api/TaskController.php
- backend/routes/api.php
