---
description: Run ESLint on files or the whole repo
aliases: [eslint]
owner: @maintainers
maturity: core
last-reviewed: 2026-02-06
---

# Lint Workflow

1. Determine target paths from arguments (if provided).
2. If no targets are provided, lint the repo.
3. Report any lint failures and next steps.

## Default Commands
- Single file: `npx eslint <path>`
- Repo: `npx eslint .`

## Notes
- Prefer project scripts if available (e.g., `npm run lint`).
- Avoid auto-fixing unless the user asks for it.

## Output

- Produce a concrete deliverable in markdown aligned with the workflow/skill goal.
- Include key decisions, actions taken, and final status for Antigravity IDE visibility.
