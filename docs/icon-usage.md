# Icon Usage Guide

This project uses [Lucide React](https://lucide.dev/icons/) icons.

## Import Pattern

All icons are exported from `@/components/common/Icons`:

```tsx
import { HomeIcon, UserIcon } from '@/components/common/Icons';
```

## Available Icons

Icons are aliased from Lucide with familiar names:
- `HomeIcon` → Lucide `Home`
- `UserIcon` → Lucide `User`
- `TrashIcon` → Lucide `Trash2`
- `XMarkIcon` → Lucide `X`
- See `Icons.tsx` for full list

## Adding New Icons

1. Find icon on [lucide.dev](https://lucide.dev/icons/)
2. Add re-export to `Icons.tsx`:
   ```tsx
   export { IconName as MyIconName } from 'lucide-react';
   ```
3. Or import directly in component:
   ```tsx
   import { IconName } from 'lucide-react';
   ```

## Icon Styling

Use Tailwind classes:
- Size: `w-4 h-4`, `w-5 h-5`, `w-6 h-6`, `w-8 h-8`
- Color: `text-primary-500`, `text-gray-400`, `text-red-500`
- Current color: Icons inherit `currentColor` by default
