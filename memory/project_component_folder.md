---
name: Custom components go in appComponents folder
description: All app-specific components must be created in components/appComponents/, never directly in components/
type: feedback
---

All custom/app-specific components belong in `components/appComponents/`. Do NOT create files directly in `components/` root.

**Why:** The user has an established convention — `components/ui/` is for shadcn primitives, `components/appComponents/` is for app-level components built by the developer.

**How to apply:** Whenever creating a new component (header, footer, cards, modals, etc.), always place it in `components/appComponents/`. Import path: `@/components/appComponents/ComponentName`.
