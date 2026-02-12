# Story 1.3: User Login

Status: done

## Story

As a registered user,
I want to login with my email and password,
So that I receive a bearer token to access protected resources.

## Acceptance Criteria

1. **Successful Login**
   - Given a registered user exists
   - When they POST to `/api/auth/login` with correct email and password
   - Then a Sanctum bearer token is returned in the response body
   - And the response includes the user profile data (id, name, email, role)
   - And the response time is within 300ms (NFR3)
   - And an activity log entry is recorded with action `'user.login'`

2. **Invalid Credentials**
   - Given a user provides wrong email or password
   - When they POST to `/api/auth/login`
   - Then a 401 response is returned with message "Invalid credentials"

3. **Input Validation Errors**
   - Given a user provides missing or invalid fields
   - When they POST to `/api/auth/login`
   - Then a 422 response is returned with field-level validation errors via LoginRequest

## Tasks / Subtasks

- [x] Task 1: Create LoginRequest Form Request (AC: 3)
  - [x] Create `app/Http/Requests/Auth/LoginRequest.php`
  - [x] Define validation rules: email (required, email), password (required, string)
  - [x] Configure error messages for each field

- [x] Task 2: Add login method to AuthController (AC: 1, 2)
  - [x] Add `login()` method to existing `app/Http/Controllers/Api/AuthController.php`
  - [x] Validate credentials using `Auth::attempt()` or manual User lookup with `Hash::check()`
  - [x] Create Sanctum token using `createToken()`
  - [x] Log activity via ActivityLogService with action `'user.login'`
  - [x] Return response with token and UserResource on success
  - [x] Return 401 with "Invalid credentials" message on failure

- [x] Task 3: Add login route in api.php (AC: 1)
  - [x] Add `POST /api/auth/login` route in the auth prefix group
  - [x] Route should be publicly accessible (no auth middleware)

- [x] Task 4: Create feature test for login (AC: 1, 2, 3)
  - [x] Create `tests/Feature/Auth/LoginTest.php`
  - [x] Test successful login returns token and user data
  - [x] Test invalid credentials returns 401
  - [x] Test validation errors for missing fields
  - [x] Test activity log is created on successful login

## Dev Notes

### Architecture Patterns

- **Validation:** Use Laravel Form Requests (`LoginRequest`) for all input validation - NEVER validate in controller
- **Response Format:** Use API Resources (`UserResource`) for all JSON responses - NEVER return raw Eloquent models
- **Token Generation:** Use `$user->createToken('auth-token')->plainTextToken` for Sanctum tokens (same TOKEN_NAME constant as register)
- **Activity Logging:** Use `ActivityLogService::logAuth('user.login', $user->id)` for login logging
- **Credential Validation:** Use Laravel's `Hash::check($password, $user->password)` to verify password against bcrypt hash

### Response Format

**Success Response (200 OK):**
```json
{
  "message": "Login successful",
  "token": "2|xyz789...",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "theme": "light",
    "profilePicture": null,
    "zakatRate": null,
    "preferredAkad": null,
    "calculationMethod": null,
    "createdAt": "2026-02-12T10:00:00Z",
    "updatedAt": "2026-02-12T10:00:00Z"
  }
}
```

**Invalid Credentials Response (401 Unauthorized):**
```json
{
  "message": "Invalid credentials"
}
```

**Validation Error Response (422):**
```json
{
  "message": "Email is required.",
  "errors": {
    "email": ["Email is required."]
  }
}
```

### Previous Story Intelligence (Story 1.2)

From the completed User Registration story:

1. **AuthController Exists:** Already has `register()` method - add `login()` method to same controller
2. **TOKEN_NAME Constant:** Already defined as `'auth-token'` - reuse for login tokens
3. **ActivityLogService Injected:** Already injected via constructor - reuse `$this->activityLogService`
4. **UserFactory Available:** Created in Story 1.2 - use for test user creation
5. **UserResource Available:** Use for response transformation
6. **Routes Structure:** Add to existing auth prefix group in `routes/api.php`

### Security Considerations

- **Generic Error Message:** Always return "Invalid credentials" for wrong email OR password (prevents user enumeration)
- **No Password in Response:** UserResource already excludes password
- **Rate Limiting Consideration:** Consider adding rate limiting for login attempts (post-MVP)
- **Token Rotation:** Each login creates a NEW token - old tokens remain valid until manually revoked (Story 1.4 logout)

### File Structure Requirements

```
backend/
├── app/
│   └── Http/
│       ├── Controllers/
│       │   └── Api/
│       │       └── AuthController.php         ← MODIFY (add login method)
│       └── Requests/
│           └── Auth/
│               └── LoginRequest.php           ← NEW
└── tests/
    └── Feature/
        └── Auth/
            └── LoginTest.php                  ← NEW
```

### Key Files to Create/Modify

1. **NEW** `backend/app/Http/Requests/Auth/LoginRequest.php` - Login validation
2. **MODIFY** `backend/app/Http/Controllers/Api/AuthController.php` - Add login method
3. **MODIFY** `backend/routes/api.php` - Add login route
4. **NEW** `backend/tests/Feature/Auth/LoginTest.php` - Feature tests

### Testing Standards

- Feature tests in `tests/Feature/Auth/`
- Test both success and error scenarios
- Test validation rules specifically
- Verify activity log is created on successful login
- Test response format matches UserResource structure
- Test invalid credentials returns 401 (not 422)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.3]
- [Source: _bmad-output/planning-artifacts/architecture.md#Authentication & Security]
- [Source: _bmad-output/planning-artifacts/prd.md#FR2, FR3]
- [Source: backend/app/Http/Controllers/Api/AuthController.php - Existing controller]
- [Source: backend/app/Http/Requests/Auth/RegisterRequest.php - Pattern reference]
- [Source: backend/app/Services/ActivityLogService.php - Activity logging]
- [Source: backend/app/Http/Resources/UserResource.php - Response transformation]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6-20250528)

### Debug Log References

N/A - Implementation completed without blocking issues.

### Completion Notes List

1. Created LoginRequest Form Request with validation rules for email and password
2. Added login() method to existing AuthController using Hash::check() for credential validation
3. Login route added to auth prefix group (publicly accessible)
4. Created comprehensive feature tests covering:
   - Successful login with token and user data verification
   - Activity log creation on login
   - Wrong password returns 401 with "Invalid credentials"
   - Non-existent email returns 401 with "Invalid credentials"
   - Missing email validation
   - Missing password validation
   - Invalid email format validation
   - Same error message for wrong email/wrong password (prevents user enumeration)
5. All code follows Laravel 12 patterns and architecture standards from Dev Notes

### Code Review Fixes Applied

1. **HIGH** Wrapped token creation and activity logging in DB::transaction for consistency with register pattern
2. **MEDIUM** Removed unused `ActivityLog` import from LoginTest.php

### File List

**New Files:**
- backend/app/Http/Requests/Auth/LoginRequest.php
- backend/tests/Feature/Auth/LoginTest.php

**Modified Files:**
- backend/app/Http/Controllers/Api/AuthController.php
- backend/routes/api.php
