# Story 4.3: Reset User Data

Status: done

## Story

As a user,
I want to reset all my data,
So that I can start fresh without creating a new account.

## Acceptance Criteria

1. **Reset All User Data**
   - Given an authenticated user
   - When they POST `/api/profile/reset`
   - Then all their tasks are deleted (with cascading history deletion)
   - And all their categories are deleted
   - And default categories are re-seeded for the user
   - And profile settings (zakatRate, preferredAkad, calculationMethod) are reset to null
   - And theme resets to 'light'
   - And the user account itself (email, password, name) is NOT deleted
   - And a success message is returned: `{ "message": "All your data has been reset successfully" }`
   - And an activity log entry is recorded with action `'user.data_reset'`

2. **Unauthenticated Access Denied**
   - Given an unauthenticated request
   - When they POST `/api/profile/reset`
   - Then a 401 response is returned

## Tasks / Subtasks

- [x] Task 1: Add reset route (AC: 1, 2)
  - [x] Add `POST /api/profile/reset` route in `routes/api.php`
  - [x] Route protected with `auth:sanctum` middleware

- [x] Task 2: Implement reset method in ProfileController (AC: 1)
  - [x] Add `reset()` method to ProfileController
  - [x] Delete all user's tasks (cascade handles history)
  - [x] Delete all user's categories
  - [x] Re-seed default categories
  - [x] Reset profile settings to defaults
  - [x] Return success message
  - [x] Log activity with action `'user.data_reset'`

- [x] Task 3: Create feature tests (AC: 1-2)
  - [x] Create `tests/Feature/Profile/ProfileResetTest.php`
  - [x] Test reset with existing data
  - [x] Test reset preserves user account
  - [x] Test default categories re-seeded
  - [x] Test unauthenticated request

## Dev Notes

### Architecture Compliance

**Pattern:** Use DB::transaction for all destructive operations to ensure atomicity.

**Default Categories:** Use the same DEFAULT_CATEGORIES constant from UserObserver:
```php
private const DEFAULT_CATEGORIES = [
    'SDM',
    'Keuangan',
    'Kepatuhan',
    'Pemasaran',
    'Operasional',
    'Teknologi',
];
```

**Activity Logging:** Use ActivityLogService to record reset action.

### Reset Logic Flow

```php
DB::transaction(function () use ($user): void {
    // 1. Delete all tasks (history cascades via foreign key)
    $user->tasks()->delete();

    // 2. Delete all categories
    $user->categories()->delete();

    // 3. Re-seed default categories
    $defaultCategories = array_map(
        fn ($name) => ['name' => $name],
        self::DEFAULT_CATEGORIES
    );
    $user->categories()->createMany($defaultCategories);

    // 4. Reset profile settings
    $user->update([
        'theme' => 'light',
        'profile_picture' => null,
        'zakat_rate' => null,
        'preferred_akad' => null,
        'calculation_method' => null,
    ]);

    // 5. Log activity
    $this->activityLogService->log('user.data_reset', $user->id);
});
```

### Cascade Delete Verification

The `task_histories` table should have `task_id` with `onDelete('cascade')`. Verify in migration:
```php
$table->foreignId('task_id')->constrained()->onDelete('cascade');
```

### File Structure

```
backend/
├── app/
│   └── Http/
│       └── Controllers/Api/
│           └── ProfileController.php   ← MODIFY (add reset method)
├── routes/
│   └── api.php                          ← MODIFY (add reset route)
└── tests/
    └── Feature/
        └── Profile/
            └── ProfileResetTest.php     ← NEW
```

### Previous Story Learnings (4-1, 4-2)

1. **Use ActivityLogService** - Inject via constructor and log all user actions
2. **Use DB::transaction** - Wrap all operations that modify data
3. **Data scoping** - Use `$user->relationship()` for all queries
4. **Return simple JSON** - Not a Resource for simple message responses

### Model Relationships

```
User
├── tasks() -> HasMany(Task) → ON DELETE CASCADE for history
├── categories() -> HasMany(Category)
└── activityLogs() -> HasMany(ActivityLog)

Task
└── history() -> HasMany(TaskHistory) → ON DELETE CASCADE
```

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 4.3]
- [Source: backend/app/Observers/UserObserver.php - DEFAULT_CATEGORIES]
- [Source: backend/app/Models/User.php - User model relationships]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6-20250528)

### Debug Log References

### Completion Notes List

- **Task 1 (Routes)**: Added `POST /api/profile/reset` route under auth:sanctum middleware
- **Task 2 (ProfileController)**: Added `reset()` method that:
  - Deletes all user's tasks (history cascades via foreign key)
  - Deletes all user's categories
  - Re-seeds 6 default categories (SDM, Keuangan, Kepatuhan, Pemasaran, Operasional, Teknologi)
  - Resets profile settings (theme to 'light', others to null)
  - Preserves user account (email, password, name, role)
  - Logs activity with action `user.data_reset` via ActivityLogService
  - Uses DB::transaction for atomicity
- **Task 3 (Tests)**: Created comprehensive test suite with 8 test cases covering:
  - Reset all user data
  - Reset preserves user account
  - Default categories re-seeded
  - Unauthenticated access denial
  - Data isolation between users
  - Activity log creation
  - Reset with no existing data
  - Task history cascade deletion

**Note**: PHP runtime not available in current environment. Tests written but not executed. Recommend running `php artisan test tests/Feature/Profile/ProfileResetTest.php` in environment with PHP 8.2+.

### File List

**Created:**
- `backend/tests/Feature/Profile/ProfileResetTest.php`

**Modified:**
- `backend/routes/api.php` - Added reset route
- `backend/app/Http/Controllers/Api/ProfileController.php` - Added reset() method
