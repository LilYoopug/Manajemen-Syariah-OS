# Story 8.5: Admin Tool Management

Status: done

## Story

As an admin,
I want to create, update, and delete tools in the catalog,
So that I can keep the tools library current and relevant for users.

## Acceptance Criteria

1. **Admin Can List Tools**
   - Given an authenticated admin
   - When they GET `/api/admin/tools`
   - Then all tools are returned (same as user-facing)

2. **Admin Can Create Tool**
   - Given an authenticated admin
   - When they POST `/api/admin/tools` with tool data
   - Then a new tool is created and returned with status 201
   - And validation is applied via StoreToolRequest
   - And an activity log entry is recorded with action `'admin.tool_created'`

3. **Admin Can Update Tool**
   - Given an authenticated admin
   - When they PUT `/api/admin/tools/{id}` with updated fields
   - Then the tool is updated and returned via ToolResource
   - And validation is applied via UpdateToolRequest
   - And an activity log entry is recorded with action `'admin.tool_updated'`

4. **Admin Can Delete Tool**
   - Given an authenticated admin
   - When they DELETE `/api/admin/tools/{id}`
   - Then the tool is deleted and a success message is returned
   - And an activity log entry is recorded with action `'admin.tool_deleted'`

5. **Non-Admin Access Denied**
   - Given a non-admin user attempts any admin tool operation
   - When the request is made
   - Then a 403 response is returned

## Tasks / Subtasks

- [x] Task 1: Create AdminToolController (AC: 1-5)
  - [x] Create `app/Http/Controllers/Api/Admin/ToolController.php`
  - [x] Implement `index()`, `store()`, `update()`, `destroy()`

- [x] Task 2: Create StoreToolRequest validation (AC: 2)
  - [x] Create `app/Http/Requests/Admin/StoreToolRequest.php`

- [x] Task 3: Create UpdateToolRequest validation (AC: 3)
  - [x] Create `app/Http/Requests/Admin/UpdateToolRequest.php`

- [x] Task 4: Add admin tool routes (AC: 1-5)
  - [x] Add `GET /api/admin/tools` route
  - [x] Add `POST /api/admin/tools` route
  - [x] Add `PUT /api/admin/tools/{id}` route
  - [x] Add `DELETE /api/admin/tools/{id}` route

- [x] Task 5: Create feature tests (AC: 1-5)
  - [x] Create `tests/Feature/Admin/ToolManagementTest.php`

## Dev Notes

### Pre-existing Components

- `Tool` model - Exists at `app/Models/Tool.php`
- `ToolResource` - Exists at `app/Http/Resources/ToolResource.php`
- `ActivityLogService` - Has `logAdmin()` method

### Tool Model Fields

From existing Tool model:
- name, category, description, inputs, outputs, benefits
- shariaBasis, link, relatedDirectoryIds
- relatedDalilText, relatedDalilSource

### AdminToolController Implementation

```php
<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreToolRequest;
use App\Http\Requests\Admin\UpdateToolRequest;
use App\Http\Resources\ToolResource;
use App\Models\Tool;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;

class ToolController extends Controller
{
    protected ActivityLogService $activityLogService;

    public function __construct(ActivityLogService $activityLogService)
    {
        $this->activityLogService = $activityLogService;
    }

    public function index(): JsonResponse
    {
        $tools = Tool::all();
        return ToolResource::collection($tools)
            ->response()
            ->setStatusCode(200);
    }

    public function store(StoreToolRequest $request): JsonResponse
    {
        $tool = Tool::create($request->validated());
        $this->activityLogService->logAdmin('admin.tool_created', $tool);
        return (new ToolResource($tool))
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateToolRequest $request, Tool $tool): JsonResponse
    {
        $tool->update($request->validated());
        $this->activityLogService->logAdmin('admin.tool_updated', $tool);
        return (new ToolResource($tool))
            ->response()
            ->setStatusCode(200);
    }

    public function destroy(Tool $tool): JsonResponse
    {
        $this->activityLogService->logAdmin('admin.tool_deleted', $tool);
        $tool->delete();
        return response()->json(['message' => 'Tool deleted successfully.']);
    }
}
```

### File Structure

```
backend/
├── app/Http/
│   ├── Controllers/Api/Admin/
│   │   └── ToolController.php      ← NEW
│   └── Requests/Admin/
│       ├── StoreToolRequest.php    ← NEW
│       └── UpdateToolRequest.php   ← NEW
├── routes/
│   └── api.php                     ← MODIFY
└── tests/Feature/Admin/
    └── ToolManagementTest.php      ← NEW
```

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 8.5]
- [Source: backend/app/Models/Tool.php]
- [Source: backend/app/Http/Resources/ToolResource.php]

## Dev Agent Record

### Agent Model Used

glm-5

### Debug Log References

N/A - PHP runtime not available in development environment. Tests written but not executed.

### Completion Notes List

- AdminToolController created with full CRUD (list, create, update, delete)
- StoreToolRequest and UpdateToolRequest validation created
- Activity logging for all admin tool actions
- ToolResource reused for response formatting
- Comprehensive feature tests created (15 test cases)

### File List

**Created:**
- `backend/app/Http/Controllers/Api/Admin/ToolController.php`
- `backend/app/Http/Requests/Admin/StoreToolRequest.php`
- `backend/app/Http/Requests/Admin/UpdateToolRequest.php`
- `backend/tests/Feature/Admin/ToolManagementTest.php`

**Modified:**
- `backend/routes/api.php`
