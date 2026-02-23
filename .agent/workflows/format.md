---
description: Run Prettier formatting on files or the whole repo
aliases: [fmt]
owner: "@maintainers"
maturity: core
last-reviewed: "2026-02-06"
---

# Format Workflow

1. Determine target paths from arguments (if provided).
2. If no targets are provided, format the repo with Prettier.
3. Report what was formatted and any errors.

## Default Commands
- Single file: `npx prettier --write <path>`
- Repo: `npx prettier --write .`

## Notes
- If Prettier is not configured, explain and stop.
- Prefer project scripts if available (e.g., `npm run format`).

## Output

- Produce a concrete deliverable in markdown aligned with the workflow/skill goal.
- Include key decisions, actions taken, and final status for Antigravity IDE visibility.
