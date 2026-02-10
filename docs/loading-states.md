# Loading States Guide

This project uses skeleton loading states for better UX during async operations.

## Available Skeleton Components

### Basic Skeleton
```tsx
import { Skeleton } from '@/components/common/Skeleton';

<Skeleton className="h-4 w-32" />
```

### Skeleton Variants

**SkeletonCard** - For content cards
```tsx
<SkeletonCard />
```

**SkeletonText** - For paragraphs
```tsx
<SkeletonText lines={3} />
```

**SkeletonChart** - For chart areas
```tsx
<SkeletonChart />
```

**SkeletonAvatar** - For user avatars
```tsx
<SkeletonAvatar size="md" />
```

**SkeletonButton** - For buttons
```tsx
<SkeletonButton />
```

**SkeletonInput** - For form inputs
```tsx
<SkeletonInput />
```

**SkeletonList** - For list items
```tsx
<SkeletonList items={5} />
```

## When to Use Skeletons

Use skeletons when:
- Loading data from API
- AI is generating content
- Form is submitting
- Page content is initializing

Don't use skeletons for:
- Button click feedback (use spinner)
- Very short operations (< 300ms)
- Background processes

## Implementation Pattern

```tsx
const [isLoading, setIsLoading] = useState(false);

// During loading
{isLoading ? (
  <SkeletonCard />
) : (
  <ActualContent />
)}
```

## Consistency Guidelines

1. Match skeleton dimensions to actual content
2. Use same border radius as actual components
3. Maintain layout structure during loading
4. Animate with `animate-pulse` class