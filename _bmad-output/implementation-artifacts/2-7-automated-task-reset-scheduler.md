# Story 2.7: Automated Task Reset Scheduler

Status: done

## Story

As the system,
I want to auto-reset recurring tasks based on their cycle,
So that users' daily/weekly/monthly/yearly tasks start fresh at the appropriate interval.

## Acceptance Criteria

1. **ResetTasksCommand Exists**
   - Given a `ResetTasksCommand` artisan command exists
   - When it runs via Laravel's task scheduler
   - Then it queries all tasks where `reset_cycle` is not null and the cycle period has elapsed since `last_reset_at`
   - And for each matching task: `completed` is set to false, `current_value` to 0, `progress` to 0
   - And `last_reset_at` is updated to the current timestamp
   - And the command uses `TaskResetService` for the reset logic

2. **Daily Reset**
   - Given a task with `reset_cycle: 'daily'` and `last_reset_at` was yesterday
   - When the scheduler runs
   - Then the task is reset

3. **Weekly Reset**
   - Given a task with `reset_cycle: 'weekly'` and `last_reset_at` was more than 7 days ago
   - When the scheduler runs
   - Then the task is reset

4. **Monthly Reset**
   - Given a task with `reset_cycle: 'monthly'` and `last_reset_at` was more than 30 days ago
   - When the scheduler runs
   - Then the task is reset

5. **Yearly Reset**
   - Given a task with `reset_cycle: 'yearly'` and `last_reset_at` was more than 365 days ago
   - When the scheduler runs
   - Then the task is reset

6. **No Reset If Not Elapsed**
   - Given a task with `reset_cycle: 'weekly'` and `last_reset_at` was 3 days ago
   - When the scheduler runs
   - Then the task is NOT reset (cycle not elapsed)

7. **Scheduler Registration**
   - The command is registered in `routes/console.php` to run daily

## Tasks / Subtasks

- [x] Task 1: Create TaskResetService (AC: 1)
  - [x] Create `app/Services/TaskResetService.php`
  - [x] Implement reset logic with cycle period calculation
  - [x] Query tasks where reset_cycle is not null and cycle has elapsed
  - [x] Reset task fields: completed=false, current_value=0, progress=0
  - [x] Update last_reset_at timestamp

- [x] Task 2: Create ResetTasksCommand (AC: 1)
  - [x] Create `app/Console/Commands/ResetTasksCommand.php`
  - [x] Command signature: `tasks:reset`
  - [x] Use TaskResetService for reset logic
  - [x] Output count of reset tasks

- [x] Task 3: Register command in scheduler (AC: 7)
  - [x] Add command to `routes/console.php` to run daily
  - [x] Schedule at midnight

- [x] Task 4: Create unit tests (AC: 1-6)
  - [x] Create `tests/Unit/TaskResetServiceTest.php`
  - [x] Test daily reset
  - [x] Test weekly reset
  - [x] Test monthly reset
  - [x] Test yearly reset
  - [x] Test no reset if cycle not elapsed
  - [x] Test only tasks with reset_cycle are processed

## Dev Notes

### Architecture Patterns

- **Service Pattern:** Complex business logic in TaskResetService
- **Command Pattern:** Artisan command for CLI/scheduler execution
- **Testing:** Unit tests for service, feature test for command

### Cycle Period Calculations

| Cycle | Period | Description |
|-------|--------|-------------|
| daily | 1 day | Reset if last_reset_at < today midnight |
| weekly | 7 days | Reset if last_reset_at < 7 days ago |
| monthly | 30 days | Reset if last_reset_at < 30 days ago |
| yearly | 365 days | Reset if last_reset_at < 365 days ago |

### TaskResetService Logic

```php
public function resetEligibleTasks(): int
{
    $now = now();
    $resetCount = 0;

    $cycles = [
        'daily' => 1,
        'weekly' => 7,
        'monthly' => 30,
        'yearly' => 365,
    ];

    foreach ($cycles as $cycle => $days) {
        $cutoff = $now->copy()->subDays($days);

        $tasks = Task::where('reset_cycle', $cycle)
            ->where(function ($query) use ($cutoff) {
                $query->whereNull('last_reset_at')
                    ->orWhere('last_reset_at', '<', $cutoff);
            })
            ->get();

        foreach ($tasks as $task) {
            $task->update([
                'completed' => false,
                'current_value' => 0,
                'progress' => 0,
                'last_reset_at' => $now,
            ]);
            $resetCount++;
        }
    }

    return $resetCount;
}
```

### File Structure Requirements

```
backend/
├── app/
│   ├── Console/
│   │   └── Commands/
│   │       └── ResetTasksCommand.php       ← NEW
│   └── Services/
│       └── TaskResetService.php            ← NEW
├── routes/
│   └── console.php                         ← MODIFY
└── tests/
    └── Unit/
        └── TaskResetServiceTest.php        ← NEW
```

### Key Files to Create/Modify

1. **NEW** `backend/app/Services/TaskResetService.php` - Reset logic
2. **NEW** `backend/app/Console/Commands/ResetTasksCommand.php` - Artisan command
3. **MODIFY** `backend/routes/console.php` - Schedule command
4. **NEW** `backend/tests/Unit/TaskResetServiceTest.php` - Unit tests

### Testing Standards

- Unit tests for TaskResetService
- Test each cycle type independently
- Test cutoff calculations
- Test that only eligible tasks are reset
- Test command execution

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.7]
- [Source: backend/app/Models/Task.php - Task model]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6-20250528)

### Debug Log References

N/A - Implementation completed without blocking issues.

### Completion Notes List

1. Created TaskResetService with:
   - resetEligibleTasks(): Main method that processes all cycle types
   - shouldReset(): Check if a single task should be reset
   - resetTask(): Reset a single task
2. Cycle periods: daily=1, weekly=7, monthly=30, yearly=365 days
3. Created ResetTasksCommand with signature 'tasks:reset'
4. Registered command in scheduler to run daily
5. Created TaskResetServiceTest with 11 test cases covering:
   - Daily, weekly, monthly, yearly resets
   - No reset if cycle not elapsed
   - Only tasks with reset_cycle are processed
   - Null last_reset_at handling
   - shouldReset() method
   - resetTask() method
   - Multiple tasks with different cycles

### File List

**New Files:**
- backend/app/Services/TaskResetService.php
- backend/app/Console/Commands/ResetTasksCommand.php
- backend/tests/Unit/TaskResetServiceTest.php

**Modified Files:**
- backend/routes/console.php
