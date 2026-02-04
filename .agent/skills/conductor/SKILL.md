---
name: conductor
description: Use when the user explicitly asks for Conductor, wants track/spec/plan artifacts, or needs long-lived project context management. Prefer start-dev for small or one-off tasks. If Conductor is not configured in the project, start with setup.
---

# Conductor

Conductor is a Context-Driven Development (CDD) framework that transforms AI agents into proactive project managers. The philosophy is "Measure twice, code once" - every feature follows a strict protocol: **Context -> Spec & Plan -> Implement**.

## Routing (Reduce Skill Confusion)

Use **Conductor** when the user explicitly wants:
- Track/spec/plan artifacts stored on disk
- Long-lived project context and workflow governance
- A feature/bug that will span multiple sessions or contributors

Use **start-dev** instead when the task is:
- Small, one-off, or exploratory
- Focused on quick implementation without new project artifacts

If ambiguous, ask: "Do you want this managed as a Conductor track (spec/plan artifacts), or should I just use start-dev for a quick implementation?"

## Compatibility Note

Conductor writes to a fixed `conductor/` directory. If the user asks for a custom artifact path, confirm that Conductor does not support custom paths by default, and offer either:
- Proceed with the default `conductor/` directory, or
- Pause for a manual refactor of the protocol files.

## Core Concepts

- **Track**: A unit of work (feature or bug fix) with its own spec and plan
- **Spec**: Detailed requirements document (`spec.md`)
- **Plan**: Phased task list with checkboxes (`plan.md`)
- **Workflow**: Rules for task lifecycle, TDD, commits, and quality gates

## Directory Structure

When initialized, Conductor creates this structure in the project:

```
conductor/
├── product.md              # Product vision and goals
├── product-guidelines.md   # UX/brand guidelines
├── tech-stack.md           # Technology choices
├── workflow.md             # Development workflow rules
├── tracks.md               # Master list of all tracks
├── code_styleguides/       # Language-specific style guides
├── tracks/                 # Active tracks
│   └── <track_id>/
│       ├── metadata.json
│       ├── spec.md
│       └── plan.md
└── archive/                # Completed tracks
```

## Available Commands

| Command | Purpose |
|---------|---------|
| **Setup** | Initialize Conductor in a project (new or existing) |
| **New Track** | Create a new feature/bug track with spec and plan |
| **Implement** | Execute tasks from a track's plan following TDD workflow |
| **Status** | Show progress overview of all tracks |
| **Revert** | Git-aware rollback of tracks, phases, or tasks |

## Protocol References

The detailed protocols are in TOML format. Read the `prompt` field from each file:

| Action | Protocol File |
|--------|---------------|
| Setup project | `commands/conductor/setup.toml` |
| Create new track | `commands/conductor/newTrack.toml` |
| Implement tasks | `commands/conductor/implement.toml` |
| Check status | `commands/conductor/status.toml` |
| Revert changes | `commands/conductor/revert.toml` |

**How to read**: Each `.toml` file has a `prompt` field containing the full protocol instructions.

## Task Status Markers

- `[ ]` - Pending
- `[~]` - In Progress
- `[x]` - Completed

## Key Workflow Principles

1. **The Plan is Source of Truth**: All work tracked in `plan.md`
2. **Test-Driven Development**: Write tests before implementing
3. **High Code Coverage**: Target >80% coverage
4. **Commit After Each Task**: With git notes for traceability
5. **Phase Checkpoints**: Manual verification at phase completion

## When to Use Each Protocol

- **"set up conductor" or "initialize project"** -> Read `commands/conductor/setup.toml`
- **"new feature", "new track", "plan a feature"** -> Read `commands/conductor/newTrack.toml`
- **"implement", "start working", "next task"** -> Read `commands/conductor/implement.toml`
- **"status", "progress", "where are we"** -> Read `commands/conductor/status.toml`
- **"revert", "undo", "rollback"** -> Read `commands/conductor/revert.toml`
 - **If the user does not mention Conductor and the task is small** -> Use `start-dev` instead

## Assets

- **Code Styleguides**: `templates/code_styleguides/` (general, go, python, javascript, typescript, html-css)
- **Workflow Template**: `templates/workflow.md`

## Critical Rules

1. **Validate every tool call** - If any fails, halt and report to user
2. **Sequential questions** - Ask one question at a time, wait for response
3. **User confirmation required** - Before writing files or making changes
4. **Check setup first** - Verify `conductor/` exists before any operation
5. **Agnostic language** - Do not suggest slash commands like `/conductor:xxx`. Instead, tell the user to ask you directly (e.g., "to start implementing, just ask me" instead of "run /conductor:implement")
