---
description: Activate maximum performance mode with parallel agent orchestration for high-throughput task completion
aliases: [ulw, uw, turbo]
owner: "@maintainers"
maturity: domain
last-reviewed: "2026-02-06"
---

# Ultrawork Skill

Activates maximum performance mode with parallel agent orchestration.

## When Activated

This skill enhances Antigravity's capabilities by:

1. **Parallel Execution**: Running multiple agents simultaneously for independent tasks
2. **Aggressive Delegation**: Routing tasks to specialist agents immediately
3. **Background Operations**: Using `run_in_background: true` for long operations
4. **Persistence Enforcement**: Never stopping until all tasks are verified complete
5. **Smart Model Routing**: Using tiered agents to save tokens

## DELEGATION ENFORCEMENT (CRITICAL)

**YOU ARE AN ORCHESTRATOR, NOT AN IMPLEMENTER.**

| Action | YOU Do | DELEGATE |
|--------|--------|----------|
| Read files for context | ✓ | |
| Track progress (TODO) | ✓ | |
| Spawn parallel agents | ✓ | |
| **ANY code change** | ✗ NEVER | executor-low/executor/executor-high |
| **UI work** | ✗ NEVER | designer/designer-high |
| **Docs** | ✗ NEVER | writer |

**Path Exception**: Only write to `.oma/`, `.agent/`, `GEMINI.md`, `AGENTS.md`

Delegation rules and audit checks will flag direct code changes.

## Smart Model Routing (CRITICAL - SAVE TOKENS)

**Choose tier based on task complexity: LOW (haiku) → MEDIUM (sonnet) → HIGH (opus)**

### Available Agents by Tier

| Domain | LOW (Haiku) | MEDIUM (Sonnet) | HIGH (Opus) |
|--------|-------------|-----------------|-------------|
| **Analysis** | `architect-low` | `architect-medium` | `architect` |
| **Execution** | `executor-low` | `executor` | `executor-high` |
| **Search** | `explore` | `explore-medium` | - |
| **Research** | `researcher-low` | `researcher` | - |
| **Frontend** | `designer-low` | `designer` | `designer-high` |
| **Docs** | `writer` | - | - |
| **Visual** | - | `vision` | - |
| **Planning** | - | - | `planner`, `critic`, `analyst` |
| **Testing** | - | `qa-tester` | - |

### Tier Selection Guide

| Task Complexity | Tier | Examples |
|-----------------|------|----------|
| Simple lookups | LOW | "What does this function return?", "Find where X is defined" |
| Standard work | MEDIUM | "Add error handling", "Implement this feature" |
| Complex analysis | HIGH | "Debug this race condition", "Refactor auth module across 5 files" |

### Routing Examples

**CRITICAL: Always pass `model` parameter explicitly - Antigravity does NOT auto-apply models from agent definitions!**

```
// Simple question → LOW tier (saves tokens!)
Invoke agent `architect-low` (model: `haiku`) with prompt: "What does this function return?"

// Standard implementation → MEDIUM tier
Invoke agent `executor` (model: `sonnet`) with prompt: "Add error handling to login"

// Complex refactoring → HIGH tier
Invoke agent `executor-high` (model: `opus`) with prompt: "Refactor auth module using JWT across 5 files"

// Quick file lookup → LOW tier
Invoke agent `explore` (model: `haiku`) with prompt: "Find where UserService is defined"

// Thorough search → MEDIUM tier
Invoke agent `explore-medium` (model: `sonnet`) with prompt: "Find all authentication patterns in the codebase"
```

## Background Execution Rules

**Run in Background** (set `run_in_background: true`):
- Package installation: npm install, pip install, cargo build
- Build processes: npm run build, make, tsc
- Test suites: npm test, pytest, cargo test
- Docker operations: docker build, docker pull

**Run Blocking** (foreground):
- Quick status checks: git status, ls, pwd
- File reads (NOT edits - delegate edits to executor)
- Simple commands

## Verification Checklist

Before stopping, verify:
- [ ] TODO LIST: Zero pending/in_progress tasks
- [ ] FUNCTIONALITY: All requested features work
- [ ] TESTS: All tests pass (if applicable)
- [ ] ERRORS: Zero unaddressed errors

**If ANY checkbox is unchecked, CONTINUE WORKING.**

## Output

- Produce a concrete deliverable in markdown aligned with the workflow/skill goal.
- Include key decisions, actions taken, and final status for Antigravity IDE visibility.
