# oh-my-antigravity  - Project Rules (Antigravity)

These rules apply to this workspace when using Antigravity.

## Security
- Never hardcode secrets (API keys, tokens, passwords). Use environment variables.
- If a request includes secrets, ask for a safer alternative before proceeding.

## Code Hygiene
- Avoid `console.log` in production code; use a logger or remove before commit.
- Prefer deterministic output in scripts and tests.

## Testing
- When creating new source files, suggest tests and offer `/tdd`.
- If behavior changes, update or add tests accordingly.

## Quality Workflows
- Use `/format` for Prettier formatting.
- Use `/lint` for ESLint checks.
- Use `/typecheck` for TypeScript checks.

## Antigravity Constraints
- Hooks are not supported. Use skills, workflows, and these rules instead.
