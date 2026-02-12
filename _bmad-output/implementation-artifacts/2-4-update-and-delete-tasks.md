# Story 2.4: Update and Delete Tasks

Status: done

## Story

As a user,
I want to update task details or delete tasks,
So that I can keep my task list accurate and current.

## Acceptance Criteria

1. **Update Task**
   - Given an authenticated user owns a task
   - When they PUT `/api/tasks/{id}` with updated fields
   - Then the task is updated and the response returns the updated task via TaskResource
   - And validation is applied via UpdateTaskRequest
   - And an activity log entry is recorded with action `'task.updated'`

2. **Update Non-Owned Task**
   - Given a user tries to update a task they do not own
   - When they PUT `/api/tasks/{id}`
   - Then a 404 response is returned (query scoping prevents access)

3. **Delete Task**
   - Given an authenticated user owns a task
   - When they DELETE `/api/tasks/{id}`
   - Then the task and all its history entries are deleted (cascade)
   - And a success message is returned
   - And an activity log entry is recorded with action `'task.deleted'`

4. **Delete Non-Owned Task**
   - Given a user tries to delete a task they do not own
   - When they DELETE `/api/tasks/{id}`
   - Then a 404 response is returned

## Tasks / Subtasks

- [x] Task 1: Create UpdateTaskRequest Form Request (AC: 1, 2)
  - [x] Create `app/Http/Requests/Task/UpdateTaskRequest.php`
  - [x] Define validation rules for updatable fields (text, category, resetCycle, hasLimit, targetValue, unit, incrementValue, perCheckEnabled)
  - [x] Add conditional validation for numeric targets (similar to StoreTaskRequest)
  - [x] Configure error messages for each field

- [x] Task 2: Add update and destroy methods to TaskController (AC: 1, 2, 3, 4)
  - [x] Add `update()` method to existing `app/Http/Controllers/Api/TaskController.php`
  - [x] Add `destroy()` method to TaskController
  - [x] Scope task lookup to authenticated user (404 if not found or not owned)
  - [x] Log activity via ActivityLogService with actions `'task.updated'` and `'task.deleted'`
  - [x] Return appropriate responses

- [x] Task 3: Add task update and delete routes in api.php (AC: 1, 3)
  - [x] Add `PUT /api/tasks/{id}` route in the protected routes group
  - [x] Add `DELETE /api/tasks/{id}` route in the protected routes group
  - [x] Routes must be protected with `auth:sanctum` middleware

- [x] Task 4: Create feature tests (AC: 1-4)
  - [x] Create `tests/Feature/Task/TaskUpdateTest.php`
  - [x] Create `tests/Feature/Task/TaskDeleteTest.php`
  - [x] Test successful task update returns 200 with updated task data
  - [x] Test update with numeric target configuration
  - [x] Test validation errors for invalid data
  - [x] Test user cannot update other user's task (404)
  - [x] Test successful task deletion
  - [x] Test user cannot delete other user's task (404)
  - [x] Test activity log is created for both update and delete
  - [x] Test unauthenticated request returns 401

## Dev Notes

### Architecture Patterns

- **Validation:** Use Laravel Form Requests (`UpdateTaskRequest`) for all input validation
- **User Scoping:** Always scope task lookup to authenticated user via `request()->user()->tasks()->findOrFail($id)`
- **Activity Logging:** Use `ActivityLogService::logCrud('task.updated', $task)` and `logCrud('task.deleted', $task)`
- **Cascade Delete:** TaskHistories should cascade delete when task is deleted (migration should handle this)

### Request/Response Format

**Update Task Request:**
```json
{
  "text": "Bayar Zakat Mal - Updated",
  "category": "Keuangan",
  "resetCycle": "yearly",
  "hasLimit": true,
  "targetValue": 15000000,
  "unit": "IDR",
  "incrementValue": 500000
}
```

**Update Success Response (200 OK):**
```json
{
  "message": "Task updated successfully",
  "data": {
    "id": 1,
    "text": "Bayar Zakat Mal - Updated",
    "completed": false,
    "category": "Keuangan",
    "progress": 0,
    "hasLimit": true,
    "currentValue": 0,
    "targetValue": 15000000,
    "unit": "IDR",
    "resetCycle": "yearly",
    "perCheckEnabled": false,
    "incrementValue": 500000,
    "lastResetAt": null,
    "createdAt": "2026-02-12T10:00:00Z",
    "updatedAt": "2026-02-12T12:00:00Z"
  }
}
```

**Delete Success Response (200 OK):**
```json
{
  "message": "Task deleted successfully"
}
```

**Not Found Response (404):**
```json
{
  "message": "No query results for model [App\\Models\\Task]"
}
```

### Updateable Fields

| Field | Type | Validation |
|-------|------|------------|
| text | string | optional, max:255 |
| category | string | optional |
| resetCycle | string | nullable, in:daily,weekly,monthly,yearly |
| hasLimit | boolean | optional |
| targetValue | integer | required if hasLimit is true, min:1 |
| unit | string | required if hasLimit is true |
| incrementValue | integer | optional, min:1, default:1 |
| perCheckEnabled | boolean | optional |

### Previous Story Intelligence (Story 2.2 & 2.3)

From the completed Create Tasks and View Tasks stories:

1. **TaskController Exists:** Already has `store()` and `index()` methods - add `update()` and `destroy()` methods
2. **TaskResource Exists:** Already transforms snake_case to camelCase
3. **StoreTaskRequest Exists:** Can reference for validation patterns
4. **TaskFactory Available:** Use for test task creation
5. **Route Structure:** Add to existing task routes in `routes/api.php`
6. **ActivityLogService:** Already injected into TaskController

### File Structure Requirements

```
backend/
├── app/
│   └── Http/
│       ├── Controllers/
│       │   └── Api/
│       │       └── TaskController.php           ← MODIFY (add update, destroy)
│       └── Requests/
│           └── Task/
│               └── UpdateTaskRequest.php        ← NEW
├── routes/
│   └── api.php                                  ← MODIFY
└── tests/
    └── Feature/
        └── Task/
            ├── TaskUpdateTest.php               ← NEW
            └── TaskDeleteTest.php               ← NEW
```

### Key Files to Create/Modify

1. **NEW** `backend/app/Http/Requests/Task/UpdateTaskRequest.php` - Update validation
2. **MODIFY** `backend/app/Http/Controllers/Api/TaskController.php` - Add update/destroy methods
3. **MODIFY** `backend/routes/api.php` - Add task update/delete routes
4. **NEW** `backend/tests/Feature/Task/TaskUpdateTest.php` - Update feature tests
5. **NEW** `backend/tests/Feature/Task/TaskDeleteTest.php` - Delete feature tests

### Testing Standards

- Feature tests in `tests/Feature/Task/`
- Test update and delete operations
- Test user scoping (users can't modify other users' tasks)
- Test validation rules
- Test activity log creation
- Test unauthenticated request handling

### Security Considerations

- Tasks are user-scoped - users can only update/delete their own tasks
- Use `findOrFail()` through user's tasks relationship to prevent access to other users' tasks
- Input sanitization via Form Request validation

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.4]
- [Source: backend/app/Models/Task.php - Task model]
- [Source: backend/app/Http/Resources/TaskResource.php - Response transformation]
- [Source: backend/app/Http/Controllers/Api/TaskController.php - Existing controller]
- [Source: backend/app/Http/Requests/Task/StoreTaskRequest.php - Validation pattern]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6-20250528)

### Debug Log References

N/A - Implementation completed without blocking issues.

### Completion Notes List

1. Created UpdateTaskRequest with validation rules for partial updates (all fields optional)
2. Added update() method to TaskController with user-scoped task lookup via findOrFail()
3. Added destroy() method to TaskController with activity logging before deletion
4. Added PUT and DELETE routes under auth:sanctum middleware
5. Created TaskUpdateTest.php with 10 test cases covering:
   - Successful task update
   - Update with numeric target
   - User cannot update other user's task (404)
   - Validation error for invalid reset cycle
   - Validation error for missing target value when hasLimit enabled
   - Activity log creation on update
   - Unauthenticated request returns 401
   - Update non-existent task returns 404
   - Partial update preserves unchanged fields
   - Update preserves completion status
6. Created TaskDeleteTest.php with 9 test cases covering:
   - Successful task deletion
   - User cannot delete other user's task (404)
   - Activity log creation on delete
   - Unauthenticated request returns 401
   - Delete non-existent task returns 404
   - Delete removes task from user's list
   - Delete task with numeric target
   - Delete task with reset cycle
   - Admin can delete their own task

### File List

**New Files:**
- backend/app/Http/Requests/Task/UpdateTaskRequest.php
- backend/tests/Feature/Task/TaskUpdateTest.php
- backend/tests/Feature/Task/TaskDeleteTest.php

**Modified Files:**
- backend/app/Http/Controllers/Api/TaskController.php
- backend/routes/api.php
