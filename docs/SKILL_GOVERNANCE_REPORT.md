# Skill Governance Report

Date: 2026-02-06
Repository: oh-my-antigravity
Runtime Target: Antigravity IDE

## Summary

- Skills total: 72
- Workflows total: 35
- Governance check: PASS
- Debt allowlist: 0 active entries

## Maturity Distribution

### Skills

- core: 13
- domain: 52
- experimental: 7
- deprecated: 0

### Workflows

- core: 16
- domain: 13
- experimental: 5
- deprecated: 1

## Deprecated Set

### Workflows
learn-about-omc

### Migration Map
- learn-about-omc -> learn-about-oma (sunset: 2026-06-30)

## Governance Notes

- Removed non-portable subagent task syntax and migrated to Antigravity-compatible delegation language.
- Enforced metadata contract in frontmatter (`owner`, `maturity`, `last-reviewed`).
- Enforced output contract (`## Output` or `## Outputs`) across all governed files.
- Governance checker command: `bash scripts/check-skill-governance.sh`.
