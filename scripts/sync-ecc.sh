#!/usr/bin/env bash
set -euo pipefail

# Refresh .agent/skills/upstream/ecc/ from affaan-m/everything-claude-code
# Keeps only Codex-relevant subtrees (.codex/, .agents/skills/) and flattens
# skills to the source root so the standard skill loader picks them up.
#
# .omc-source/manifest.json and the curated selection are preserved.
#
# Refuses to overwrite local edits unless --force is passed. Local edits are
# detected by comparing on-disk file mtimes against manifest.syncedAt.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET_DIR="$ROOT_DIR/.agent/skills/upstream/ecc"
REMOTE_URL="https://github.com/affaan-m/everything-claude-code.git"
REF="${ECC_REF:-main}"
FORCE="false"

usage() {
  cat <<'EOF'
Usage: ./scripts/sync-ecc.sh [options]

Options:
  --force      Overwrite local edits in .agent/skills/upstream/ecc/
  --help       Show this help

Environment:
  ECC_REF      Git ref to sync (default: main)
EOF
}

for arg in "$@"; do
  case "$arg" in
    --force) FORCE="true" ;;
    --help)  usage; exit 0 ;;
    *)       echo "Unknown argument: $arg" >&2; usage >&2; exit 1 ;;
  esac
done

if [[ ! -d "$TARGET_DIR" ]]; then
  mkdir -p "$TARGET_DIR"
fi

# Local-edit guard: any tracked file with mtime > manifest.syncedAt aborts
# the sync unless --force is set. .omc-source/ itself is exempted.
# Implemented in Node for cross-platform ISO 8601 parsing (BSD find can't).
MANIFEST_FILE="$TARGET_DIR/.omc-source/manifest.json"
if [[ "$FORCE" != "true" && -f "$MANIFEST_FILE" ]]; then
  EDITED=$(node -e "
    const fs = require('fs');
    const path = require('path');
    const target = '$TARGET_DIR';
    const manifest = JSON.parse(fs.readFileSync('$MANIFEST_FILE', 'utf8'));
    const syncedAt = manifest.syncedAt ? Date.parse(manifest.syncedAt) : 0;
    if (!syncedAt) process.exit(0);
    const out = [];
    function walk(dir) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (full.startsWith(path.join(target, '.omc-source'))) continue;
        if (entry.isDirectory()) { walk(full); continue; }
        const mtime = fs.statSync(full).mtimeMs;
        if (mtime > syncedAt + 1000) out.push(full);
        if (out.length >= 5) return;
      }
    }
    walk(target);
    if (out.length > 0) console.log(out.join('\n'));
  " 2>/dev/null)
  if [[ -n "$EDITED" ]]; then
    SYNCED_AT=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$MANIFEST_FILE','utf8')).syncedAt||'')" 2>/dev/null)
    echo "Refusing to overwrite local edits made after manifest.syncedAt=$SYNCED_AT:" >&2
    echo "$EDITED" | sed 's/^/  /' >&2
    echo "Re-run with --force to discard them." >&2
    exit 1
  fi
fi

# Preserve provenance + selection across resync.
TMP_PRESERVE=$(mktemp -d)
[[ -d "$TARGET_DIR/.omc-source" ]] && cp -R "$TARGET_DIR/.omc-source" "$TMP_PRESERVE/"

echo "Wiping $TARGET_DIR (except .omc-source backup)..."
find "$TARGET_DIR" -mindepth 1 -maxdepth 1 -exec rm -rf {} +

echo "Sparse-cloning $REMOTE_URL@$REF..."
TMP_CLONE=$(mktemp -d)
git -C "$TMP_CLONE" init -q
git -C "$TMP_CLONE" remote add origin "$REMOTE_URL"
git -C "$TMP_CLONE" config core.sparseCheckout true
printf '%s\n' '/.codex/' '/.agents/skills/' '/README.md' '/LICENSE' \
  > "$TMP_CLONE/.git/info/sparse-checkout"
git -C "$TMP_CLONE" fetch --depth 1 origin "$REF" -q
git -C "$TMP_CLONE" checkout -q FETCH_HEAD

echo "Copying assets to $TARGET_DIR..."
cp -R "$TMP_CLONE/.codex" "$TARGET_DIR/"
cp "$TMP_CLONE/README.md" "$TARGET_DIR/" 2>/dev/null || true
cp "$TMP_CLONE/LICENSE" "$TARGET_DIR/" 2>/dev/null || true

if [[ -d "$TMP_CLONE/.agents/skills" ]]; then
  cp -R "$TMP_CLONE/.agents/skills/." "$TARGET_DIR/"
fi

# Restore provenance + selection link, then bump syncedAt to "now" so the
# next sync's local-edit guard has a fresh baseline.
if [[ -d "$TMP_PRESERVE/.omc-source" ]]; then
  rm -rf "$TARGET_DIR/.omc-source"
  cp -R "$TMP_PRESERVE/.omc-source" "$TARGET_DIR/"
fi

if [[ -f "$MANIFEST_FILE" ]]; then
  NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  node -e "
    const fs=require('fs');
    const p='$MANIFEST_FILE';
    const m=JSON.parse(fs.readFileSync(p,'utf8'));
    m.syncedAt='$NOW';
    fs.writeFileSync(p,JSON.stringify(m,null,2)+'\n');
  " 2>/dev/null || true
fi

rm -rf "$TMP_CLONE" "$TMP_PRESERVE"

SKILL_COUNT=$(find "$TARGET_DIR" -mindepth 2 -maxdepth 2 -name SKILL.md | wc -l | tr -d ' ')
AGENT_COUNT=$(find "$TARGET_DIR/.codex/agents" -name '*.toml' 2>/dev/null | wc -l | tr -d ' ')

echo ""
echo "ECC synced:"
echo "  skills: $SKILL_COUNT"
echo "  codex agents: $AGENT_COUNT"
echo "  config.toml: $([[ -f "$TARGET_DIR/.codex/config.toml" ]] && echo present || echo missing)"
echo "  selection: $ROOT_DIR/.agent/curation/ecc-codex-selection.json"
echo ""
echo "Run: oma setup       # install selected skills + agents + MCP block"
