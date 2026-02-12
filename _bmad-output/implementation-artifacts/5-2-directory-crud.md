# Story 5.2: Directory CRUD

Status: review

## Story

As a user,
I want to create, update, and delete directory items,
So that I can customize the knowledge base with my own notes and references.

## Acceptance Criteria

1. **Create Directory Item**
   - Given an authenticated user
   - When they POST `/api/directory` with title, type, content, and optional parentId
   - Then a new directory item is created and returned via DirectoryResource with status 201
   - And validation is applied via StoreDirectoryRequest
   - And an activity log is recorded with action `'directory.item_created'`

2. **Update Directory Item**
   - Given an authenticated user
   - When they PUT `/api/directory/{id}` with updated title, content, or parentId
   - Then the item is updated and returned via DirectoryResource
   - And validation is applied via UpdateDirectoryRequest
   - And an activity log is recorded with action `'directory.item_updated'`

3. **Delete Directory Item**
   - Given an authenticated user
   - When they DELETE `/api/directory/{id}`
   - Then the item and all its children are deleted (cascade via FK)
   - And a success message is returned: `{ "message": "Directory item deleted successfully" }`
   - And an activity log is recorded with action `'directory.item_deleted'`

4. **Validation Errors**
   - Given a user provides invalid data (missing title, invalid type)
   - When they POST or PUT
   - Then a 422 response is returned with field-level errors

5. **Unauthenticated Access Denied**
   - Given an unauthenticated request
   - When they POST, PUT, or DELETE `/api/directory`
   - Then a 401 response is returned

## Tasks / Subtasks

- [x] Task 1: Create StoreDirectoryRequest (AC: 1, 4)
  - [x] Create `app/Http/Requests/Directory/StoreDirectoryRequest.php`
  - [x] Validate title (required, string, max 255)
  - [x] Validate type (required, in:folder,item)
  - [x] Validate parentId (nullable, exists:directory_items,id)
  - [x] Validate content (nullable, JSON object with dalil/source/explanation)

- [x] Task 2: Create UpdateDirectoryRequest (AC: 2, 4)
  - [x] Create `app/Http/Requests/Directory/UpdateDirectoryRequest.php`
  - [x] Validate title (sometimes, string, max 255)
  - [x] Validate content (nullable, JSON object)
  - [x] Validate parentId (nullable, exists:directory_items,id)

- [x] Task 3: Add CRUD methods to DirectoryController (AC: 1-5)
  - [x] Add store() method for creating items
  - [x] Add update() method for updating items
  - [x] Add destroy() method for deleting items
  - [x] Inject ActivityLogService for audit trail
  - [x] Use DB::transaction for write operations

- [x] Task 4: Add CRUD routes (AC: 1-5)
  - [x] Add `POST /api/directory` route
  - [x] Add `PUT /api/directory/{id}` route
  - [x] Add `DELETE /api/directory/{id}` route
  - [x] Routes protected with `auth:sanctum` middleware

- [x] Task 5: Create feature tests (AC: 1-5)
  - [x] Create `tests/Feature/Directory/DirectoryCrudTest.php`
  - [x] Test create folder
  - [x] Test create item with content
  - [x] Test update item
  - [x] Test delete item (cascade)
  - [x] Test validation errors
  - [x] Test unauthenticated requests

## Dev Notes

### Validation Rules

**StoreDirectoryRequest:**
```php
'title' => ['required', 'string', 'max:255'],
'type' => ['required', 'in:folder,item'],
'parentId' => ['nullable', 'exists:directory_items,id'],
'content' => ['nullable', 'array'],
'content.dalil' => ['nullable', 'string'],
'content.source' => ['nullable', 'string', 'max:255'],
'content.explanation' => ['nullable', 'string'],
```

**UpdateDirectoryRequest:**
```php
'title' => ['sometimes', 'string', 'max:255'],
'parentId' => ['nullable', 'exists:directory_items,id'],
'content' => ['nullable', 'array'],
```

### Content Field Handling

For items, content is stored as JSON string:
```php
$content = null;
if ($request->has('content')) {
    $content = json_encode($request->input('content'));
}
```

### Cascade Delete

The migration already has `onDelete('cascade')` on parent_id FK, so deleting a folder automatically deletes all children.

### Activity Logging

Log actions:
- `directory.item_created` - After creating item
- `directory.item_updated` - After updating item
- `directory.item_deleted` - After deleting item

### File Structure

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/
│   │   │   └── DirectoryController.php  ← MODIFY (add CRUD methods)
│   │   └── Requests/Directory/
│   │       ├── StoreDirectoryRequest.php ← NEW
│   │       └── UpdateDirectoryRequest.php ← NEW
│   └── Resources/
│       └── DirectoryResource.php        ← EXISTS
├── routes/
│   └── api.php                          ← MODIFY
└── tests/
    └── Feature/
        └── Directory/
            └── DirectoryCrudTest.php    ← NEW
```

### Previous Story Learnings (5-1)

1. **DirectoryResource exists** - Already has toArray() and buildTree() methods
2. **DirectoryController exists** - Already has index() method
3. **Content stored as JSON** - dalil/source/explanation in content field
4. **Cascade delete works** - onDelete('cascade') on FK

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 5.2]
- [Source: backend/app/Http/Controllers/Api/DirectoryController.php - Existing index()]
- [Source: backend/database/migrations/2026_02_12_000005_create_directory_items_table.php - Schema]

## Dev Agent Record

### Agent Model Used

glm-5

### Debug Log References

N/A - PHP runtime not available in environment

### Completion Notes List

1. PHP runtime not available in environment - tests written but not executed
2. All 5 tasks completed:
   - Task 1: StoreDirectoryRequest created with proper validation rules
   - Task 2: UpdateDirectoryRequest created with 'sometimes' rule for partial updates
   - Task 3: DirectoryController updated with store(), update(), destroy() methods
   - Task 4: CRUD routes added to api.php within auth:sanctum middleware
   - Task 5: DirectoryCrudTest.php created with 24 test cases
3. Code review passed - no critical issues found
4. Used `array_key_exists()` for null-safe handling of parentId and content fields

### File List

**Created:**
- backend/app/Http/Requests/Directory/StoreDirectoryRequest.php
- backend/app/Http/Requests/Directory/UpdateDirectoryRequest.php
- backend/tests/Feature/Directory/DirectoryCrudTest.php

**Modified:**
- backend/app/Http/Controllers/Api/DirectoryController.php (added store, update, destroy methods)
- backend/routes/api.php (added POST, PUT, DELETE /api/directory routes)
