---
name: verify
description: Use this skill to run deterministic project verification (build, types, lint, tests, security, git status) with mode-based command sets.
version: 0.3.0
source: fork
checksum: b1daa6b6d105b8e325f541119e3d9a523f709b16a650702e9f4e5cfd93f3f011
updated_at: 2026-03-12T18:57:03+08:00
intent: verification
layer: foundation
---


# Verify Skill

> Codex invocation: use `$verify [mode]` or `verify: [mode]`

Run comprehensive verification on current codebase state.

## Capabilities

- Standardized verification order.
- Mode-specific command subsets (`quick`, `full`, `pre-commit`, `pre-pr`).
- Security and debug-log audits.
- Clear pass/fail report with blockers.

## Input Requirements

- `mode` (optional): `quick` | `full` | `pre-commit` | `pre-pr`.
- default mode: `full`.

## How to Use

```text
$verify
$verify quick
$verify pre-commit
$verify pre-pr
```

## Mode Matrix

1. `quick`: build + typecheck
2. `full`: build + typecheck + lint + tests + logs + git status
3. `pre-commit`: typecheck + lint + targeted tests + git status
4. `pre-pr`: full + security scan

## Verification Order

1. **Build Check**
- Run project build command.
- If it fails, report and stop.

2. **Type Check**
- Run type checker (`tsc --noEmit` / equivalent).

3. **Lint Check**
- Run lint command.

4. **Test Suite**
- If implementation files changed, run `omcodex test changed` first.
- Run tests (targeted first, then broader if needed).
- Report pass/fail counts and coverage if available.

5. **Security Scan** (`pre-pr` + `full` recommended)

```bash
rg -n "sk-[A-Za-z0-9_-]{20,}" --glob '!node_modules' .
rg -n "api[_-]?key|secret|token\s*=\s*['\"]" --glob '!node_modules' .
```

6. **Console Log Audit**

```bash
rg -n "console\.log|print\(" src tests
```

7. **Git Status**

```bash
git status --short
git diff --name-only
```

## Output Format

```text
VERIFICATION: [PASS/FAIL]

Mode:     [quick/full/pre-commit/pre-pr]
Build:    [OK/FAIL]
Types:    [OK/X errors]
Lint:     [OK/X issues]
Tests:    [X/Y passed, Z% coverage or N/A]
Security: [OK/X findings]
Logs:     [OK/X console logs]
Git:      [clean/dirty]

Ready for PR: [YES/NO]
```

If failed, include blocker list ordered by severity and recommended next commands.
