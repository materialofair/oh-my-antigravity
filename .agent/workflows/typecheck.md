---
description: Run TypeScript type checking
aliases: [tsc, type-check]
---

# Typecheck Workflow

1. If the project has a `typecheck` script, run it.
2. Otherwise run `npx tsc --noEmit`.
3. Report errors clearly and suggest fixes.

## Default Commands
- Script: `npm run typecheck`
- Fallback: `npx tsc --noEmit`
