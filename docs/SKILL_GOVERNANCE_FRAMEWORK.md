# Skill Governance Framework (Cross-Project)

This framework is designed for repositories like `oh-my-codex` and `oh-my-antigravity` that maintain skill packs for AI-assisted development.

## 1. Governance Goals

1. Keep every skill executable in the current runtime (no stale syntax, no unavailable APIs).
2. Keep quality stable as skill count grows (consistent structure, clear boundaries, testable instructions).
3. Keep maintenance cost under control (ownership, debt tracking, measurable cleanup velocity).
4. Keep user trust high (safe defaults, explicit risk controls, predictable behavior).

## 2. Scope and Object Model

Governance applies to:
- Skill definitions (`SKILL.md` and supporting assets)
- Installation/distribution scripts
- Governance scripts, allowlists, and policy docs

Skill classes:
- Core skills: high-frequency, cross-project foundation (planning, review, verify, tdd)
- Domain skills: project/platform specific (for example editor, electron, workflow)
- Experimental skills: incubating, low-trust, fast iteration
- Deprecated skills: retained only for migration windows

## 3. Skill Contract (Minimum Standard)

Every skill must satisfy:
1. Metadata contract: `name`, `description`, explicit trigger guidance.
2. Runtime contract: examples runnable in target CLI/runtime only.
3. Boundary contract: clear "when to use / when not to use".
4. Dependency contract: external tools/paths declared.
5. Output contract: expected output format and completion criteria.

## 4. Lifecycle and Gates

### 4.1 Lifecycle

1. Proposal: problem statement + overlap check.
2. Draft: create skill with contract sections.
3. Validation: governance checks + dry-run examples.
4. Release: installable and documented.
5. Observe: usage, failures, confusion signals.
6. Evolve or retire: merge, split, deprecate, archive.

### 4.2 Quality Gates

Required pre-merge gates:
1. `npm run governance:skills` passes.
2. No new allowlist debt unless explicitly approved.
3. Backward-compatibility note for renamed/retired skills.
4. At least one runnable invocation example per skill.

Recommended gates:
1. Duplicate-intent detection (same trigger intent across multiple skills).
2. Link integrity check (paths/scripts in skill docs).
3. Install smoke test (`install-codex*.sh` equivalent for target project).

## 5. Debt and Compatibility Strategy

Debt types:
- Syntax debt: legacy command/task syntax no longer supported.
- Semantic debt: unclear role boundaries and overlapping responsibilities.
- Tooling debt: references to unavailable plugins/commands.

Policy:
1. New debt blocked by default.
2. Legacy debt recorded in allowlist with owner and target removal date.
3. Removing debt and allowlist entries happens in the same change.
4. High-risk debt (runtime-invalid instructions) is P0 and must be removed first.

## 6. Topology and Duplication Control

Use a 4-layer topology to avoid skill sprawl:
1. Foundation layer: universal skills (plan/review/verify/tdd).
2. Domain layer: project-specific capabilities.
3. Orchestration layer: sequencing/composition (pipeline/swarm-like skills).
4. Governance layer: quality, checks, migration, release.

De-dup rules:
1. One canonical skill per intent.
2. Variants become playbooks inside canonical skill, not separate top-level skills.
3. Keep aliases only during migration windows; set sunset date.

## 7. Ownership Model (RACI)

- Maintainer (A): final decision on merge/retire.
- Skill owner (R): authoring, bugfixes, compatibility.
- Reviewer (R/C): quality and risk review.
- Consumers (C): feedback on usability and ambiguity.

Each skill should declare:
- Owner
- Last reviewed date
- Maturity (`core`, `domain`, `experimental`, `deprecated`)

## 8. Metrics and SLOs

Track monthly:
1. Governance pass rate (`governance:skills` success in PRs).
2. Debt burndown (allowlist entries net change).
3. Duplication ratio (skills mapped to same intent cluster).
4. Time-to-fix for broken skills.
5. Deprecation lead time and completion rate.

Suggested SLOs:
- P0 governance breakage fixed within 24h.
- No net-new unresolved allowlist debt for 2 consecutive cycles.
- Duplicate-intent skills reduced cycle over cycle.

## 9. Release and Change Management

For every skill-facing release:
1. Changelog section: added/changed/deprecated/removed skills.
2. Migration notes: old -> new invocation mapping.
3. Install verification: local and global install checks.
4. Rollback path: previous known-good tag.

## 10. Cross-Project Federation (Codex + Antigravity)

Recommended model:
1. Shared governance baseline:
   - `docs/SKILL_GOVERNANCE_FRAMEWORK.md` (this file)
   - same governance checker philosophy
2. Project overlays:
   - `docs/SKILL_GOVERNANCE.<project>.md` for project-specific exceptions
3. Shared taxonomy:
   - same maturity labels and lifecycle states
4. Shared migration language:
   - consistent deprecation and replacement templates

## 11. Implementation Blueprint (Practical)

For each project repository:
1. Add governance docs:
   - `docs/SKILL_GOVERNANCE.md` (project policy)
   - `docs/SKILL_GOVERNANCE_FRAMEWORK.md` (shared framework)
2. Add governance machinery:
   - checker script (`scripts/check-skill-governance.sh`)
   - allowlist (`.governance/skill-lint.allowlist`)
   - package script (`governance:skills`)
3. Add CI gate:
   - run governance check on PRs touching skills.
4. Add ownership metadata policy:
   - owner + maturity + last-reviewed required in each skill.

## 12. 30/60/90 Day Rollout Plan

### Day 0-30

1. Establish baseline checker and debt inventory.
2. Freeze net-new debt.
3. Classify all skills by maturity and owner.

### Day 31-60

1. Merge duplicate-intent skills into canonical tracks.
2. Convert aliases to deprecation shims.
3. Introduce monthly governance report.

### Day 61-90

1. Remove expired deprecated skills.
2. Normalize cross-project taxonomy and templates.
3. Enforce SLO-based review cadence.

## 13. Definition of Done (Governance)

A repository is considered "governed" when:
1. Governance checks are mandatory and passing.
2. Debt is explicit, owned, and burning down.
3. Every active skill has a clear owner and maturity.
4. Duplicate-intent skills are consolidated.
5. Release notes include skill migration guidance.

## 14. Quick Import Checklist for `oh-my-antigravity`

1. Copy this file to `docs/SKILL_GOVERNANCE_FRAMEWORK.md`.
2. Create `docs/SKILL_GOVERNANCE.md` with antigravity-specific runtime blockers.
3. Port governance checker + allowlist + npm script.
4. Run baseline scan and generate debt register.
5. Start with P0 blockers, then duplicate-intent consolidation.

