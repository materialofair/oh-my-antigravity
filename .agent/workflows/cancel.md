---
description: Cancel any active OMA mode (autopilot, ralph, ultrawork, ecomode, ultraqa, swarm, ultrapilot, pipeline)
---

# Cancel Command

[UNIFIED CANCEL - INTELLIGENT MODE DETECTION]

You are cancelling the active OMA mode. The cancel skill will automatically detect which mode is running and clean it up properly.

## Auto-Detection

The skill checks state files to determine what's active and cancels in order of dependency:

1. **Autopilot** - Stops workflow, preserves progress for resume, cleans up ralph/ultraqa
2. **Ralph** - Stops persistence loop, cleans up linked ultrawork or ecomode
3. **Ultrawork** - Stops parallel execution (standalone)
4. **Ecomode** - Stops token-efficient execution (standalone)
5. **UltraQA** - Stops QA cycling workflow
6. **Swarm** - Stops coordinated agents, releases claimed tasks
7. **Ultrapilot** - Stops parallel autopilot workers
8. **Pipeline** - Stops sequential agent chain

## Usage

Basic cancellation (auto-detects mode):
```
/oh-my-antigravity :cancel
```

Force clear ALL state files:
```
/oh-my-antigravity :cancel --force
/oh-my-antigravity :cancel --all
```

## User Arguments

{{ARGUMENTS}}

## State Files Checked

- `.oma/state/autopilot-state.json` → Autopilot
- `.oma/state/ralph-state.json` → Ralph
- `.oma/state/ultrawork-state.json` → Ultrawork
- `.oma/state/ecomode-state.json` → Ecomode
- `.oma/state/ultraqa-state.json` → UltraQA
- `.oma/state/swarm.db` (SQLite) or `.oma/state/swarm-active.marker` → Swarm
- `.oma/state/ultrapilot-state.json` → Ultrapilot
- `.oma/state/pipeline-state.json` → Pipeline

## What Gets Preserved

| Mode | Progress Preserved | Resume |
|------|-------------------|--------|
| Autopilot | Yes (phase, spec, plan) | `/oh-my-antigravity :autopilot` |
| All Others | No | N/A |

## Dependency-Aware Cleanup

- **Autopilot cancellation** → Cleans ralph + ultraqa if active
- **Ralph cancellation** → Cleans linked ultrawork OR ecomode if applicable
- **Force mode** → Clears ALL state files regardless of what's active

## Exit Messages

The skill will report:
- Which mode was cancelled
- What phase/iteration it was in (if applicable)
- What dependent modes were cleaned up
- How to resume (if applicable)

## Implementation

Run the cancel skill which contains the full bash implementation for intelligent mode detection and cleanup.
