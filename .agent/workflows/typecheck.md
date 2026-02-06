---
description: Run TypeScript type checking
aliases: [tsc, type-check]
owner: @maintainers
maturity: core
last-reviewed: 2026-02-06
---

# Typecheck Workflow

1. If the project has a `typecheck` script, run it.
2. Otherwise run `npx tsc --noEmit`.
3. Report errors clearly and suggest fixes.

## Default Commands
- Script: `npm run typecheck`
- Fallback: `npx tsc --noEmit`

## Output

- Produce a concrete deliverable in markdown aligned with the workflow/skill goal.
- Include key decisions, actions taken, and final status for Antigravity IDE visibility.
