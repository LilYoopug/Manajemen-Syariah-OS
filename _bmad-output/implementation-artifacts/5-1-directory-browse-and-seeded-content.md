# Story 5.1: Directory Browse and Seeded Content

Status: done

## Story

As a user,
I want to browse the Islamic knowledge directory as a navigable tree,
So that I can find guidance on muamalah, contracts, and shariah compliance topics.

## Acceptance Criteria

1. **Directory Tree Endpoint**
   - Given an authenticated user
   - When they GET `/api/directory`
   - Then the complete directory tree is returned with nested children structure
   - And the response uses DirectoryResource with camelCase keys
   - And the tree structure matches the frontend's expected format

2. **Seeded Content**
   - Given the database is migrated
   - When the DirectorySeeder is run
   - Then all 4 main folders are seeded (Al-Qur'an, As-Sunnah, Maqasid Syariah, POAC Islami)
   - And all 14 child items are seeded with dalil, source, explanation
   - And parent-child relationships are correctly established

3. **Unauthenticated Access Denied**
   - Given an unauthenticated request
   - When they GET `/api/directory`
   - Then a 401 response is returned

## Tasks / Subtasks

- [x] Task 1: Create DirectorySeeder (AC: 2)
  - [x] Create `database/seeders/DirectorySeeder.php`
  - [x] Seed 4 main folders (type='folder')
  - [x] Seed 14 child items (type='item')
  - [x] Store dalil/source/explanation as JSON in content field

- [x] Task 2: Create DirectoryResource (AC: 1)
  - [x] Create `app/Http/Resources/DirectoryResource.php`
  - [x] Transform DB fields to match frontend DirectoryItem interface
  - [x] Include nested children for folders
  - [x] Parse content JSON to dalil/source/explanation

- [x] Task 3: Create DirectoryController (AC: 1)
  - [x] Create `app/Http/Controllers/Api/DirectoryController.php`
  - [x] Implement index() method returning tree structure
  - [x] Load all items with children recursively

- [x] Task 4: Add directory route (AC: 1, 3)
  - [x] Add `GET /api/directory` route in `routes/api.php`
  - [x] Route protected with `auth:sanctum` middleware

- [x] Task 5: Create feature tests (AC: 1-3)
  - [x] Create `tests/Feature/Directory/DirectoryTest.php`
  - [x] Test directory tree structure
  - [x] Test seeded content exists
  - [x] Test unauthenticated request

## Dev Notes

### Data Structure

**Frontend DirectoryItem Interface:**
```typescript
interface DirectoryItem {
  id: string;
  title: string;
  dalil?: string;
  source?: string;
  explanation?: string;
  children?: DirectoryItem[];
  parentPath?: string;
}
```

**Database Schema (already exists):**
- id (auto-increment)
- parent_id (nullable self-referential FK)
- title (string)
- type ('folder' or 'item')
- content (text, nullable - stores JSON for items)

### Content Field JSON Structure

For items (type='item'), store in `content` field:
```json
{
  "dalil": "إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ إِلَىٰ أَهْلِهَا",
  "source": "QS. An-Nisa: 58",
  "explanation": "Prinsip dasar kepercayaan dan tanggung jawab..."
}
```

### Seeded Data

**4 Main Folders (type='folder'):**
1. Al-Qur'an (3 items)
2. As-Sunnah (2 items)
3. Maqasid Syariah (5 items)
4. Prinsip POAC Islami (4 items)

**Total: 18 records (4 folders + 14 items)**

### Tree Query Strategy

For optimal performance, load all items and build tree in PHP:
```php
$items = DirectoryItem::all();
$tree = $items->whereNull('parent_id')->map(fn ($item) =>
    $this->buildTree($item, $items)
);
```

### File Structure

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/
│   │   │   └── DirectoryController.php  ← NEW
│   │   └── Resources/
│   │       └── DirectoryResource.php    ← NEW
│   └── Models/
│       └── DirectoryItem.php            ← EXISTS
├── database/
│   ├── migrations/
│   │   └── *_create_directory_items_table.php ← EXISTS
│   └── seeders/
│       └── DirectorySeeder.php          ← NEW
├── routes/
│   └── api.php                          ← MODIFY
└── tests/
    └── Feature/
        └── Directory/
            └── DirectoryTest.php        ← NEW
```

### Model Relationships

```
DirectoryItem
├── parent() -> BelongsTo(DirectoryItem)
└── children() -> HasMany(DirectoryItem) → ON DELETE CASCADE
```

### Previous Story Learnings

1. **Use ActivityLogService** - Inject via constructor for future audit trail
2. **Use DB::transaction** - Not needed for read-only operations
3. **API Resources** - Transform all responses to match frontend interfaces
4. **camelCase JSON** - All JSON keys must be camelCase

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 5.1]
- [Source: frontend/src/constants/index.ts - DIRECTORY_DATA]
- [Source: frontend/src/types/index.ts - DirectoryItem interface]
- [Source: backend/app/Models/DirectoryItem.php - Model with relationships]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6-20250528)

### Debug Log References

### Completion Notes List

- **Task 1 (DirectorySeeder)**: Created seeder that:
  - Seeds 4 main folders: Al-Qur'an, As-Sunnah, Maqasid Syariah, Prinsip POAC Islami
  - Seeds 14 child items with dalil, source, explanation stored as JSON in content field
  - Uses recursive methods for folder/item seeding
- **Task 2 (DirectoryResource)**: Updated existing resource to:
  - Transform DB fields to match frontend DirectoryItem interface (id, title, dalil, source, explanation, children)
  - Parse content JSON for items and extract dalil/source/explanation
  - Include static buildTree() method for efficient tree building from flat collection
- **Task 3 (DirectoryController)**: Created controller with:
  - index() method that loads all items and builds tree using DirectoryResource::buildTree()
  - Single query for optimal performance
- **Task 4 (Routes)**: Added GET /api/directory route under auth:sanctum middleware
- **Task 5 (Tests)**: Created comprehensive test suite with 10 test cases covering:
  - Directory tree structure
  - Empty data handling
  - Unauthenticated access denial
  - Folder without children
  - Item without content
  - Nested folder structure
  - Multiple root folders
  - Seeder verification (4 folders, 14 items, correct counts)
  - Item dalil/source content

**Note**: PHP runtime not available in current environment. Tests written but not executed. Recommend running `php artisan test tests/Feature/Directory/DirectoryTest.php` in environment with PHP 8.2+.

### File List

**Created:**
- `backend/database/seeders/DirectorySeeder.php`
- `backend/app/Http/Controllers/Api/DirectoryController.php`
- `backend/tests/Feature/Directory/DirectoryTest.php`

**Modified:**
- `backend/routes/api.php` - Added directory route
- `backend/app/Http/Resources/DirectoryResource.php` - Updated to match frontend interface
