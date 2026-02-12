# Story 1.4: User Logout

Status: done

## Story

As an authenticated user,
I want to logout,
So that my bearer token is invalidated and my session ends.

## Acceptance Criteria

1. **Successful Logout**
   - Given a user is authenticated with a valid bearer token
   - When they POST to `/api/auth/logout`
   - Then the current token is deleted/invalidated
   - And a success message is returned: `{ "message": "Logged out successfully" }`
   - And subsequent requests with the same token return 401
   - And an activity log entry is recorded with action `'user.logout'`

2. **Unauthenticated Request**
   - Given a request has no token or an invalid token
   - When they POST to `/api/auth/logout`
   - Then a 401 response is returned with message "Unauthenticated."

## Tasks / Subtasks

- [x] Task 1: Add logout method to AuthController (AC: 1)
  - [x] Add `logout()` method to existing `app/Http/Controllers/Api/AuthController.php`
  - [x] Delete current token using `$request->user()->currentAccessToken()->delete()`
  - [x] Log activity via ActivityLogService with action `'user.logout'`
  - [x] Return success message JSON response

- [x] Task 2: Add logout route in api.php (AC: 1, 2)
  - [x] Add `POST /api/auth/logout` route in the auth prefix group
  - [x] Route must be protected with `auth:sanctum` middleware

- [x] Task 3: Create feature test for logout (AC: 1, 2)
  - [x] Create `tests/Feature/Auth/LogoutTest.php`
  - [x] Test successful logout returns success message
  - [x] Test token is invalidated after logout
  - [x] Test activity log is created on logout
  - [x] Test unauthenticated request returns 401

## Dev Notes

### Architecture Patterns

- **Token Deletion:** Use `$request->user()->currentAccessToken()->delete()` to revoke the current token
- **Activity Logging:** Use `ActivityLogService::logAuth('user.logout', $user->id)` for logout logging
- **Route Protection:** Logout requires authentication - use `auth:sanctum` middleware

### Response Format

**Success Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

**Unauthenticated Response (401 Unauthorized):**
```json
{
  "message": "Unauthenticated."
}
```

### Previous Story Intelligence (Story 1.3)

From the completed User Login story:

1. **AuthController Exists:** Already has `register()` and `login()` methods - add `logout()` method to same controller
2. **ActivityLogService Injected:** Already injected via constructor - reuse `$this->activityLogService`
3. **Routes Structure:** Add to existing auth prefix group in `routes/api.php`
4. **UserFactory Available:** Use for test user creation

### Sanctum Token Management

- **Current Token Access:** `$request->user()->currentAccessToken()` returns the token used for the request
- **Token Deletion:** Calling `delete()` on the token removes it from the `personal_access_tokens` table
- **Multiple Tokens:** Users can have multiple tokens (one per device/session). Logout only invalidates the current token.

### File Structure Requirements

```
backend/
├── app/
│   └── Http/
│       └── Controllers/
│           └── Api/
│               └── AuthController.php         ← MODIFY (add logout method)
├── routes/
│   └── api.php                                ← MODIFY (add logout route)
└── tests/
    └── Feature/
        └── Auth/
            └── LogoutTest.php                 ← NEW
```

### Key Files to Create/Modify

1. **MODIFY** `backend/app/Http/Controllers/Api/AuthController.php` - Add logout method
2. **MODIFY** `backend/routes/api.php` - Add logout route with auth middleware
3. **NEW** `backend/tests/Feature/Auth/LogoutTest.php` - Feature tests

### Testing Standards

- Feature tests in `tests/Feature/Auth/`
- Test successful logout invalidates token
- Test subsequent request with same token fails
- Verify activity log is created on logout
- Test unauthenticated request handling

### Security Considerations

- Logout only invalidates the current token, not all user tokens
- Users can have multiple active sessions (web, mobile, etc.)
- Rate limiting not needed for logout endpoint

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.4]
- [Source: _bmad-output/planning-artifacts/architecture.md#Authentication & Security]
- [Source: backend/app/Http/Controllers/Api/AuthController.php - Existing controller]
- [Source: backend/app/Services/ActivityLogService.php - Activity logging]
- [Source: Laravel Sanctum documentation - Token Management]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6-20250528)

### Debug Log References

N/A - Implementation completed without blocking issues.

### Completion Notes List

1. Added logout() method to AuthController using `request()->user()->currentAccessToken()->delete()`
2. Logout route added to protected routes group (requires auth:sanctum)
3. Created comprehensive feature tests covering:
   - Successful logout returns success message
   - Token is invalidated after logout (subsequent requests fail with 401)
   - Activity log is created on logout
   - Unauthenticated request returns 401
   - Invalid token returns 401
   - Multiple tokens: only current token is invalidated, others remain valid
4. All code follows Laravel 12 patterns and architecture standards from Dev Notes

### Code Review Fixes Applied

1. **MEDIUM** Wrapped token deletion and activity logging in DB::transaction for consistency
2. **LOW** Changed `auth()->user()` to `request()->user()` for consistency

### File List

**New Files:**
- backend/tests/Feature/Auth/LogoutTest.php

**Modified Files:**
- backend/app/Http/Controllers/Api/AuthController.php
- backend/routes/api.php
