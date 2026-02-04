# Hooks Migration Guide (Claude Code → Antigravity)

Antigravity does **not** support Claude Code hooks. Use skills, workflows, and rules instead.

## Legacy Hooks → Antigravity Alternatives

| Legacy Hook | Original Behavior | Antigravity Replacement |
|---|---|---|
| `auto-format-on-save` | Run Prettier after file write | **Workflow**: `/format` (new) |
| `typecheck-on-ts-edit` | Run `tsc --noEmit` after TS edits | **Workflow**: `/typecheck` (new) |
| `lint-on-js-edit` | Run ESLint after JS edits | **Workflow**: `/lint` (new) |
| `warn-console-log` | Warn on `console.log` | **Rule**: `GEMINI.md` “Avoid console.log in production code.” |
| `prevent-secrets` | Block hardcoded secrets | **Rule**: `GEMINI.md` “Never hardcode secrets.” |
| `remind-tests` | Remind to add tests | **Rule**: `GEMINI.md` “Suggest tests when creating new files.” |

## Notes
- The legacy hooks file remains at `examples/hooks.json` for reference only.
- Workflows are manual (slash commands) rather than automatic post-edit hooks.
- Rules apply globally for the workspace via `GEMINI.md`.
