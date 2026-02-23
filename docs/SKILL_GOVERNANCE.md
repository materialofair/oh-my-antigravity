# Skill Governance Policy (oh-my-antigravity)

This document is the project overlay of `docs/SKILL_GOVERNANCE_FRAMEWORK.md`, tailored for this repository and the Antigravity IDE runtime.

## 1. Runtime Baseline (Antigravity IDE)

Governance in this repository assumes the execution environment is Antigravity IDE:

1. Skills are discovered from `SKILL.md` files.
2. Workflows are discovered from markdown files in `.agent/workflows/` and triggered by slash commands.
3. Persistent behavioral rules are defined in `GEMINI.md`.
4. Multi-agent execution and iterative building are supported in IDE flow.
5. Artifacts and execution can involve editor, terminal, and browser-preview style outputs.

## 2. Governance Scope in This Repo

Governed objects:

1. `.agent/skills/*/SKILL.md`
2. `.agent/workflows/*.md`
3. `scripts/check-skill-governance.sh`
4. `.governance/skill-lint.allowlist`
5. Catalog baseline files (`.governance/catalog-manifest.json`, `docs/generated/public-catalog.json`)
6. Governance docs under `docs/`

Out of scope (for now):

1. Historical migration docs under `MIGRATION_*.md`
2. Legacy compatibility documentation explicitly marked as historical

## 3. Local Contract (Skill + Workflow)

Required for every Skill:

1. YAML frontmatter exists.
2. `name` exists and matches folder name.
3. `description` exists.
4. Metadata governance fields are present:
   - `owner`
   - `maturity` in `core|domain|experimental|deprecated`
   - `last-reviewed` in `YYYY-MM-DD`
5. Content contains at least one explicit output contract section (`## Output` or `## Outputs`) describing expected deliverables for IDE usage.

Required for every Workflow:

1. YAML frontmatter exists.
2. `description` exists.
3. Metadata governance fields are present:
   - `owner`
   - `maturity` in `core|domain|experimental|deprecated`
   - `last-reviewed` in `YYYY-MM-DD`
4. Content contains explicit output contract section (`## Output` or `## Outputs`) so the IDE can render predictable deliverables.

## 4. Antigravity IDE Compatibility Rules

Hard blockers (P0):

1. References to `~/.claude/` paths inside active skills/workflows.
2. References to `oh-my-claudecode` in active skills/workflows.
3. References to unsupported legacy hook events (`PreToolUse`, `PostToolUse`) as executable requirements.
4. Explicit task API syntax (for example `Task(subagent_type=...)` or `Task(agent=...)`) that is not natively executable in Antigravity workflow runtime.

Soft blockers (debt, tracked via allowlist):

1. Missing governance metadata (`owner`, `maturity`, `last-reviewed`).
2. Missing output contract section.
3. Name mismatch between skill folder and frontmatter `name`.

## 5. Debt Registry and Expiry

Debt is tracked in `.governance/skill-lint.allowlist` with:

1. Rule key pattern (supports `*` glob).
2. Owner.
3. Expiry date.
4. Reason.

Policy:

1. New debt requires explicit allowlist entry.
2. Expired allowlist entries are treated as governance failures.
3. Debt cleanup must remove matching allowlist entries in the same change.

## 6. Execution

Run governance check:

```bash
bash scripts/check-skill-governance.sh
```

This includes catalog consistency verification when Node.js is available.

Expected behavior:

1. Exit 0 when all violations are either fixed or explicitly allowlisted.
2. Exit 1 when unallowlisted or expired debt exists.

## 7. Rollout Plan (This Repository)

1. Phase A: keep metadata/output-contract debt in allowlist and maintain no net-new debt.
2. Phase B: batch-add `owner`, `maturity`, `last-reviewed` to all skills/workflows.
3. Phase C: add output contract sections to all active skills/workflows and shrink allowlist to zero.
