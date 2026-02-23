# Metadata Sync System

This project uses `scripts/sync-metadata.js` to keep key docs aligned with actual repository state.

## What It Syncs

- Skill count from `.agent/skills/*`
- Workflow count from `.agent/workflows/*.md`
- Current version from `CHANGELOG.md` (latest section)

Target files:

- `README.md`
- `README_CN.md`
- `MIGRATION_STATUS.md`
- `docs/REFERENCE.md`
- `docs/SKILL_GOVERNANCE_REPORT.md`
- `AGENTS.md` (version field)

## Commands

Sync files:

```bash
node scripts/sync-metadata.js
```

Preview changes without writing:

```bash
node scripts/sync-metadata.js --dry-run
```

Verify CI-style consistency:

```bash
node scripts/sync-metadata.js --verify
```

## Failure Behavior

`--verify` exits with non-zero status when synced content differs from tracked files.

Typical fix:

```bash
node scripts/sync-metadata.js
git add -A
```

## Recommended Workflow

1. Make content changes.
2. Run `node scripts/generate-catalog-docs.js`.
3. Run `node scripts/sync-metadata.js`.
4. Run `bash scripts/verify-repo.sh`.
