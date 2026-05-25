#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPORT_PATH="$ROOT_DIR/.oma/reports/skill-overlap-governance-latest.json"
OUTPUT_DIR="$ROOT_DIR/.oma/patches/upstream-overlap"

usage() {
  cat <<'EOF'
Usage: ./scripts/generate-upstream-overlap-patches.sh [options]

Generate per-skill upstream patch files from overlap governance report.

Options:
  --report <path>   Overlap report JSON path
  --out-dir <path>  Output directory for .patch files
  --help            Show this help
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --report)
      REPORT_PATH="$2"
      shift 2
      ;;
    --out-dir)
      OUTPUT_DIR="$2"
      shift 2
      ;;
    --help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if [[ ! -f "$REPORT_PATH" ]]; then
  echo "Missing report: $REPORT_PATH" >&2
  exit 1
fi

cd "$ROOT_DIR"
mkdir -p "$OUTPUT_DIR"
rm -f "$OUTPUT_DIR"/*.patch "$OUTPUT_DIR"/manifest.md "$OUTPUT_DIR"/apply-all.sh

MANIFEST="$OUTPUT_DIR/manifest.md"
{
  echo "# Upstream Overlap Patch Manifest"
  echo
  echo "Generated at: $(date -u +'%Y-%m-%dT%H:%M:%SZ')"
  echo "Source report: $REPORT_PATH"
  echo
  echo "| Skill | Decision | Reason | Issues | Patch |"
  echo "|---|---|---|---|---|"
} > "$MANIFEST"

PATCH_COUNT=0
SKIP_COUNT=0
MISSING_COUNT=0

while IFS=$'\t' read -r skill decision reason issues; do
  [[ -z "$skill" ]] && continue

  upstream_file="$ROOT_DIR/.agent/skills/upstream/oh-my-codex/$skill/SKILL.md"
  local_file="$ROOT_DIR/.agent/skills/local/$skill/SKILL.md"
  patch_file="$OUTPUT_DIR/$skill.patch"

  if [[ ! -f "$upstream_file" || ! -f "$local_file" ]]; then
    MISSING_COUNT=$((MISSING_COUNT + 1))
    echo "| $skill | $decision | $reason | $issues | missing file |" >> "$MANIFEST"
    continue
  fi

  if cmp -s "$upstream_file" "$local_file"; then
    SKIP_COUNT=$((SKIP_COUNT + 1))
    echo "| $skill | $decision | $reason | $issues | no diff |" >> "$MANIFEST"
    continue
  fi

  set +e
  diff -u \
    -L "a/skills/$skill/SKILL.md" \
    -L "b/skills/$skill/SKILL.md" \
    "$upstream_file" \
    "$local_file" > "$patch_file"
  diff_status=$?
  set -e

  if [[ "$diff_status" -gt 1 ]]; then
    echo "Failed to generate patch for $skill" >&2
    exit 1
  fi

  PATCH_COUNT=$((PATCH_COUNT + 1))
  echo "| $skill | $decision | $reason | $issues | $(basename "$patch_file") |" >> "$MANIFEST"
done < <(
  node - <<'NODE' "$REPORT_PATH"
const fs = require('fs');
const reportPath = process.argv[2];
const data = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
for (const row of data.overlap || []) {
  if (row.decision !== 'prefer-fork') continue;
  const issues = (row.upstreamIssues || []).join(', ') || '-';
  console.log([row.skill, row.decision, row.reason, issues].join('\t'));
}
NODE
)

cat > "$OUTPUT_DIR/apply-all.sh" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

# Run this inside upstream repository root.
for patch in ./*.patch; do
  [ -f "$patch" ] || continue
  git apply "$patch"
done
echo "Applied all patches."
EOF
chmod +x "$OUTPUT_DIR/apply-all.sh"

{
  echo
  echo "## Summary"
  echo
  echo "- patches generated: $PATCH_COUNT"
  echo "- no diff: $SKIP_COUNT"
  echo "- missing file: $MISSING_COUNT"
} >> "$MANIFEST"

echo "Patch bundle generated:"
echo "  output: $OUTPUT_DIR"
echo "  patches: $PATCH_COUNT"
echo "  skipped(no diff): $SKIP_COUNT"
echo "  missing: $MISSING_COUNT"
