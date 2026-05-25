# Project AGENTS.md (Enhanced)

This template is designed for repository root `AGENTS.md`.
It should complement global guidance with project-specific rules.

## Project Identity

- Project name: <project-name>
- Runtime/stack: <stack>
- Main build/test commands: <commands>
- Deploy boundary: <what must not be touched>

## Source of Truth

When rules conflict, use this order:
1. Current task instructions.
2. This repository's docs/config (`README`, `docs/`, `config files`).
3. Skill workflow instructions.

## Repository Working Rules

- Edit files in-repo first; do not patch runtime mirrors first.
- Keep changes minimal and scoped.
- If touching scripts or build config, run at least one quick verification command.
- Preserve existing architecture/style unless migration is explicitly requested.

## Mandatory Execution Sequence

1. Read task + locate impacted files.
2. Read exact local docs/config related to those files.
3. Implement minimal change.
4. Run verification commands.
5. Report with command evidence and changed file list.

## Skill Policy (Project)

- Use explicit skill requests as-is.
- For ambiguous tasks, prefer conservative skill composition:
  - implementation: `start-dev` or `autopilot`
  - quality: `verification-loop` or `verify`
  - risk-critical areas: `security-review`
- If a skill suggests behavior that conflicts with this repo's docs/config, follow repo docs/config.

## Definition of Done

A task is done only when:

1. Requested code/docs changes are applied.
2. Appropriate checks have been run (or explicitly blocked with reason).
3. Output includes what changed, where, and validation status.

## High-Risk Guardrails

- No credential leaks in code, logs, or docs.
- No destructive git commands without explicit user request.
- No silent behavior changes without documenting impact.

## Suggested Project-Specific Additions

Add concrete sections for your repo:

- Directory ownership (who/what owns `src/*`, `scripts/*`, `docs/*`)
- Command matrix (`lint`, `typecheck`, `test`, `build`)
- Release checklist (version bump, changelog, tag, package publish)
- Runtime compatibility constraints (Node version, package manager, OS)
