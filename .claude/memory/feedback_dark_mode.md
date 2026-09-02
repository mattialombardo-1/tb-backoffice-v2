---
name: Dark mode awareness
description: Always account for dark mode when writing UI code in this project
type: feedback
---

Every UI change must be dark-mode compatible. The app has a `ThemeProvider` (`src/lib/theme.tsx`) that toggles the `dark` class on `<html>`. shadcn/ui components adapt automatically via CSS variables in `src/app.css`, but custom styles must too.

**Why:** Dark mode was explicitly implemented and the user expects it to be a first-class concern going forward.

**How to apply:**
- Never hardcode light-only colors (e.g. `bg-white`, `text-gray-900`). Use semantic tokens: `bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`, etc.
- For conditional styling use `dark:` Tailwind variants only when semantic tokens aren't enough.
- When adding new components, test mentally (or visually) in both modes.
- Inline styles with fixed hex/rgb colors are a red flag — replace with CSS variables or Tailwind semantic classes.
