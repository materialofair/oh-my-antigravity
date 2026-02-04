---
description: Run Prettier formatting on files or the whole repo
aliases: [fmt]
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
