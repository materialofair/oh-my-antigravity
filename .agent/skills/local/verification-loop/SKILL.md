---
name: verification-loop
description: Use this skill for iterative verify-fix cycles across build, type, lint, test, and security gates until completion or explicit stop conditions.
version: 0.3.0
source: fork
checksum: 7d5cf41f8642dd50339027b46b43b64270906f5b7bcd18e8b4252d88091d4d08
updated_at: 2026-03-12T18:57:03+08:00
intent: verification
layer: quality
---


# Verification Loop Skill

> Codex invocation: use `$verification-loop ...` or `verification-loop: ...`

Run repeated verification cycles with bounded retries and clear blocker escalation.

## Capabilities

- Execute ordered quality gates with deterministic stop rules.
- Detect failure class and route to minimal fix scope.
- Repeat verify -> diagnose -> fix until pass or budget exhaustion.
- Produce machine-readable cycle status and blocker details.
- Support pre-PR hardening with security checks.

## Input Requirements

- `goal` (required): full-quality | tests | build | lint | typecheck | pre-pr.
- `scope` (optional): changed files/modules only.
- `max_cycles` (optional): default 5.
- `max_same_failure` (optional): default 3.
- `strict_security` (optional): true | false.

## How to Use

```text
$verification-loop full-quality
$verification-loop pre-pr
$verification-loop tests for src/auth/
```

## Routing Boundary

- Use `$verification-loop` when a single verification pass is not enough and automatic retry/fix cycling is needed.
- Use `$verify` for one-pass verification snapshot.
- Use `$test-gen` for adding missing tests after code changes.

## Native Subagent Protocol (Codex)

Codex supports native subagents. Delegate with `spawn_agent`, coordinate with `send_input`, collect via `wait`, and clean up with `close_agent`.

Minimal orchestration pattern:

```text
spawn_agent -> send_input (optional) -> wait -> close_agent
```

Fallback: execute the loop sequentially when delegation is unavailable.

## Command Resolution

Prefer project-native commands by package manager lockfile detection.

Node defaults:

- build: `npm run build`
- typecheck: `npx tsc --noEmit` (or `npm run typecheck` if defined)
- lint: `npm run lint`
- tests: `npm run test`

Security checks:

```bash
rg -n "sk-[A-Za-z0-9_-]{20,}" --glob '!node_modules' .
rg -n "api[_-]?key|secret|token\s*=\s*['\"]" --glob '!node_modules' .
```

Debug log audit:

```bash
rg -n "console\.log|print\(" src tests
```

## Cycle Algorithm

State file: `.omc/state/verification-loop-state.json`

Per cycle:

1. run selected quality gates in fixed order
2. if all pass -> complete
3. if any fail -> classify failure (build/type/lint/test/security)
4. apply minimal scoped fix
5. re-run failed gate first, then dependent gates
6. record cycle result and repeat

## Stop Conditions

- success: all selected gates pass
- max cycles reached (`max_cycles`)
- same failure repeats `max_same_failure` times
- environment blocker (missing deps/service unavailable)

## Output Contract

```text
[VERIFICATION-LOOP]
- goal
- cycle: <n>/<max_cycles>
- active gate

[RESULT]
- build/type/lint/test/security: pass|fail
- failure class
- fix applied

[NEXT]
- recheck command
- escalation decision

[STATUS]
- result: <complete|blocked|in_progress>
- promise: <PROMISE tag>
- stop_reason: <if blocked>
```

## Completion and Blocking Tags

- `[PROMISE:VERIFICATION_LOOP_COMPLETE]`
- `[PROMISE:VERIFICATION_LOOP_BLOCKED]`

## Continuous Mode Guidance

For long tasks, run this loop at checkpoints:

- before opening PR
- after major refactor
- after dependency upgrades

If loop blocks, handoff to focused skills:

- build/type errors -> `$build-fix`
- test coverage gaps -> `$test-gen`
- security-sensitive failures -> `$security-review`
