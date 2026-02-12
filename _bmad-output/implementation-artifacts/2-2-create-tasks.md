# Story 2.2: Create Tasks

Status: review

## Story

As a user,
I want to create tasks with descriptions, categories, reset cycles, and optional numeric targets,
So that I can track my Islamic business compliance activities.

## Acceptance Criteria

1. **Successful Task Creation**
   - Given an authenticated user
   - When they POST to `/api/tasks` with valid data
   - Then a new task is created scoped to that user
   - And the response returns the created task via TaskResource with status 201
   - And an activity log entry is recorded with action `'task.created'`

2. **Task with Numeric Target**
   - Given a user provides a task with `hasLimit: true`
   - When they POST to `/api/tasks` with targetValue, unit, and incrementValue
   - Then the task is created with numeric target configuration

3. **Validation Errors**
   - Given a user provides invalid data (missing text, invalid category, invalid resetCycle)
   - When they POST to `/api/tasks`
   - Then a 422 response is returned with field-level errors via StoreTaskRequest

## Tasks / Subtasks

- [x] Task 1: Create StoreTaskRequest Form Request (AC: 3)
  - [x] Create `app/Http/Requests/Task/StoreTaskRequest.php`
  - [x] Define validation rules: text (required, string, max:255), category (required, string), resetCycle (nullable, in:daily,weekly,monthly,yearly)
  - [x] Add conditional validation for numeric targets (targetValue, unit, incrementValue when hasLimit is true)
  - [x] Configure error messages for each field

- [x] Task 2: Create TaskController with store method (AC: 1, 2)
  - [x] Create `app/Http/Controllers/Api/TaskController.php`
  - [x] Implement `store()` method using StoreTaskRequest
  - [x] Create task scoped to authenticated user
  - [x] Log activity via ActivityLogService with action `'task.created'`
  - [x] Return response with TaskResource and status 201

- [x] Task 3: Add task store route in api.php (AC: 1)
  - [x] Add `POST /api/tasks` route in the protected routes group
  - [x] Route must be protected with `auth:sanctum` middleware

- [x] Task 4: Create feature tests (AC: 1, 2, 3)
  - [x] Create `tests/Feature/Task/TaskStoreTest.php`
  - [x] Test successful task creation returns 201 with task data
  - [x] Test task with numeric target configuration
  - [x] Test validation errors for invalid data
  - [x] Test activity log is created
  - [x] Test task is scoped to authenticated user

## Dev Notes

### Architecture Patterns

- **Validation:** Use Laravel Form Requests (`StoreTaskRequest`) for all input validation
- **Response Format:** Use API Resources (`TaskResource`) for all JSON responses
- **User Scoping:** Always scope tasks to authenticated user
- **Activity Logging:** Use `ActivityLogService::logCrud('task.created', $task)`

### Request/Response Format

**Create Task Request:**
```json
{
  "text": "Bayar Zakat Mal",
  "category": "Keuangan",
  "resetCycle": "monthly",
  "hasLimit": true,
  "targetValue": 10000000,
  "unit": "IDR",
  "incrementValue": 1000000
}
```

**Success Response (201 Created):**
```json
{
  "message": "Task created successfully",
  "data": {
    "id": 1,
    "text": "Bayar Zakat Mal",
    "completed": false,
    "category": "Keuangan",
    "progress": 0,
    "hasLimit": true,
    "currentValue": 0,
    "targetValue": 10000000,
    "unit": "IDR",
    "resetCycle": "monthly",
    "perCheckEnabled": false,
    "incrementValue": 1000000,
    "lastResetAt": null,
    "createdAt": "2026-02-12T10:00:00Z",
    "updatedAt": "2026-02-12T10:00:00Z"
  }
}
```

**Validation Error Response (422):**
```json
{
  "message": "The text field is required.",
  "errors": {
    "text": ["The text field is required."]
  }
}
```

### Task Model Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| user_id | foreign | - | Owner of the task |
| text | string | - | Task description |
| completed | boolean | false | Completion status |
| category | string | - | Category name |
| progress | integer | 0 | Percentage progress (0-100) |
| has_limit | boolean | false | Whether task has numeric target |
| current_value | integer | 0 | Current value toward target |
| target_value | integer | null | Target value (if has_limit) |
| unit | string | null | Unit of measurement |
| reset_cycle | string | null | daily/weekly/monthly/yearly |
| per_check_enabled | boolean | false | Auto-increment on completion |
| increment_value | integer | 1 | Value to increment per check |
| last_reset_at | timestamp | null | Last reset timestamp |

### Previous Story Intelligence (Story 2.1)

From the completed Task Categories story:

1. **Task Model Exists:** `app/Models/Task.php` with all fields and relationships
2. **TaskResource Exists:** `app/Http/Resources/TaskResource.php` with camelCase transformation
3. **Tasks Migration Exists:** Table already created with all required columns
4. **ActivityLogService Available:** Use for task activity logging
5. **Default Categories:** Users have SDM, Keuangan, Kepatuhan, Pemasaran, Operasional, Teknologi

### File Structure Requirements

```
backend/
├── app/
│   └── Http/
│       ├── Controllers/
│       │   └── Api/
│       │       └── TaskController.php           ← NEW
│       └── Requests/
│           └── Task/
│               └── StoreTaskRequest.php         ← NEW
├── database/
│   └── factories/
│       └── TaskFactory.php                      ← NEW
├── routes/
│   └── api.php                                  ← MODIFY
└── tests/
    └── Feature/
        └── Task/
            └── TaskStoreTest.php                ← NEW
```

### Key Files to Create/Modify

1. **NEW** `backend/app/Http/Requests/Task/StoreTaskRequest.php` - Task validation
2. **NEW** `backend/app/Http/Controllers/Api/TaskController.php` - Task controller
3. **MODIFY** `backend/routes/api.php` - Add task store route
4. **NEW** `backend/database/factories/TaskFactory.php` - Test factory
5. **NEW** `backend/tests/Feature/Task/TaskStoreTest.php` - Feature tests

### Testing Standards

- Feature tests in `tests/Feature/Task/`
- Test both basic task and numeric target task creation
- Test validation rules specifically
- Verify activity log is created
- Test task is scoped to authenticated user

### Security Considerations

- Tasks are user-scoped - users can only create tasks for themselves
- Category validation should check against user's available categories
- Input sanitization via Form Request validation

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.2]
- [Source: backend/app/Models/Task.php - Task model]
- [Source: backend/app/Http/Resources/TaskResource.php - Response transformation]
- [Source: backend/database/migrations/2026_02_12_000003_create_tasks_table.php]
- [Source: frontend/src/types/index.ts - Task interface]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6-20250528)

### Debug Log References

N/A - Implementation completed without blocking issues.

### Completion Notes List

1. Created StoreTaskRequest with validation rules including conditional validation for numeric targets
2. Created TaskController with store() method using ActivityLogService::logCrud()
3. Added POST /api/tasks route under auth:sanctum middleware
4. Created TaskFactory for test data generation with helper states (withLimit, completed, withResetCycle)
5. Created comprehensive feature tests covering:
   - Successful task creation returns 201 with task data
   - Task with numeric target configuration
   - Activity log creation
   - Validation errors for missing text
   - Validation errors for missing category
   - Validation errors for invalid reset cycle
   - Validation errors for missing target value when hasLimit is true
   - Task scoping to authenticated user
   - Unauthenticated request returns 401
   - Task with per check enabled

### File List

**New Files:**
- backend/app/Http/Requests/Task/StoreTaskRequest.php
- backend/app/Http/Controllers/Api/TaskController.php
- backend/database/factories/TaskFactory.php
- backend/tests/Feature/Task/TaskStoreTest.php

**Modified Files:**
- backend/routes/api.php
