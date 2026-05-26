---
name: checkpoint
description: Imported from everything-codex command checkpoint
version: 0.1.0
source: fork
checksum: 62622f7bbbaae8df8dad4280cb81eaad46425aabc59e3360a16ac3f32bd37e51
updated_at: 2026-02-11T09:29:16+08:00
layer: utility
---


# Checkpoint Command


## Native Subagent Protocol (Codex)

Codex supports native subagents. Delegate with `spawn_agent`, coordinate with `send_input`, collect via `wait`, and clean up with `close_agent`.

Execution preference:
1. Use native subagents first for independent workstreams (parallel when possible).
2. Merge results in main thread and run final verification.
3. Fallback only when delegation is blocked: use the `[ANALYST]`/`[ARCHITECT]`/`[EXECUTOR]`/`[REVIEWER]` structure in a single response.

Minimal orchestration pattern:
```text
spawn_agent -> send_input (optional) -> wait -> close_agent
```

Create or verify a checkpoint in your workflow.

## Usage

`$checkpoint [create|verify|list] [name]`

## Create Checkpoint

When creating a checkpoint:

1. Run `$verify` (quick mode if supported) to ensure current state is clean
2. Create a git stash or commit with checkpoint name
3. Log checkpoint to `.codex/checkpoints.log`:

```bash
echo "$(date +%Y-%m-%d-%H:%M) | $CHECKPOINT_NAME | $(git rev-parse --short HEAD)" >> .codex/checkpoints.log
```

4. Report checkpoint created

## Verify Checkpoint

When verifying against a checkpoint:

1. Read checkpoint from log
2. Compare current state to checkpoint:
   - Files added since checkpoint
   - Files modified since checkpoint
   - Test pass rate now vs then
   - Coverage now vs then

3. Report:
```
CHECKPOINT COMPARISON: $NAME
============================
Files changed: X
Tests: +Y passed / -Z failed
Coverage: +X% / -Y%
Build: [PASS/FAIL]
```

## List Checkpoints

Show all checkpoints with:
- Name
- Timestamp
- Git SHA
- Status (current, behind, ahead)

## Workflow

Typical checkpoint flow:

```
[Start] --> $checkpoint create "feature-start"
   |
[Implement] --> $checkpoint create "core-done"
   |
[Test] --> $checkpoint verify "core-done"
   |
[Refactor] --> $checkpoint create "refactor-done"
   |
[PR] --> $checkpoint verify "feature-start"
```

## Arguments

$ARGUMENTS:
- `create <name>` - Create named checkpoint
- `verify <name>` - Verify against named checkpoint
- `list` - Show all checkpoints
- `clear` - Remove old checkpoints (keeps last 5)
