#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
UPSTREAM_REF="upstream/main"
TMP_ROOT="$ROOT_DIR/.oma/tmp/source-skills"
REPORT_ROOT="$ROOT_DIR/.oma/reports/skill-governance-sources"
LLM_MODE="heuristic"
SKIP_FETCH="false"
KEEP_TMP="false"

usage() {
  cat <<'EOF'
Usage: ./scripts/test-skill-governance-sources.sh [options]

Run skill governance checks for both local fork skills and upstream source skills.

Options:
  --upstream-ref <ref>   Upstream git ref to audit (default: upstream/main)
  --tmp-root <path>      Temporary extraction root
  --report-root <path>   Report output directory
  --llm-mode <mode>      LLM governance mode: auto|heuristic|llm (default: heuristic)
  --skip-fetch           Skip git fetch upstream
  --keep-tmp             Keep temporary extracted upstream files
  --help                 Show this help
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --upstream-ref)
      UPSTREAM_REF="$2"
      shift 2
      ;;
    --tmp-root)
      TMP_ROOT="$2"
      shift 2
      ;;
    --report-root)
      REPORT_ROOT="$2"
      shift 2
      ;;
    --llm-mode)
      LLM_MODE="$2"
      shift 2
      ;;
    --skip-fetch)
      SKIP_FETCH="true"
      shift
      ;;
    --keep-tmp)
      KEEP_TMP="true"
      shift
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

ensure_node() {
  if command -v node >/dev/null 2>&1; then
    return
  fi

  if [[ -s "$HOME/.nvm/nvm.sh" ]]; then
    # shellcheck disable=SC1090
    source "$HOME/.nvm/nvm.sh"
    nvm use --silent >/dev/null 2>&1 || true
  fi

  if ! command -v node >/dev/null 2>&1; then
    echo "node is required but was not found in PATH or nvm." >&2
    exit 1
  fi
}

detect_repo_skills_path() {
  local base="$1"
  local candidates=(".agent/skills/local" ".agent/skills" ".codex/skills" "skills")
  local candidate
  for candidate in "${candidates[@]}"; do
    if [[ -d "$base/$candidate" ]]; then
      printf '%s\n' "$candidate"
      return 0
    fi
  done
  return 1
}

detect_ref_skills_path() {
  local ref="$1"
  local candidates=(".agent/skills/local" ".agent/skills" ".codex/skills" "skills")
  local candidate
  for candidate in "${candidates[@]}"; do
    if git cat-file -e "$ref:$candidate" 2>/dev/null; then
      printf '%s\n' "$candidate"
      return 0
    fi
  done
  return 1
}

run_check() {
  local label="$1"
  shift

  echo ""
  echo "[$label]"
  echo "cmd: $*"

  if "$@"; then
    echo "result: PASS"
    return 0
  fi

  echo "result: FAIL"
  return 1
}

ensure_node
mkdir -p "$TMP_ROOT" "$REPORT_ROOT"

if [[ "$SKIP_FETCH" != "true" ]]; then
  git fetch upstream
fi

if ! git rev-parse --verify "$UPSTREAM_REF" >/dev/null 2>&1; then
  echo "Upstream ref not found: $UPSTREAM_REF" >&2
  exit 1
fi

if ! FORK_SKILLS_REL="$(detect_repo_skills_path "$ROOT_DIR")"; then
  echo "No local skills directory found (.agent/skills, .codex/skills, or skills)." >&2
  exit 1
fi

if ! UPSTREAM_SKILLS_REL="$(detect_ref_skills_path "$UPSTREAM_REF")"; then
  echo "No skills directory found in ref $UPSTREAM_REF (.agent/skills, .codex/skills, or skills)." >&2
  exit 1
fi

UPSTREAM_EXTRACT="$TMP_ROOT/upstream"
rm -rf "$UPSTREAM_EXTRACT"
mkdir -p "$UPSTREAM_EXTRACT"

git archive "$UPSTREAM_REF" "$UPSTREAM_SKILLS_REL" | tar -x -C "$UPSTREAM_EXTRACT"
mkdir -p "$UPSTREAM_EXTRACT/.governance"

if git show "$UPSTREAM_REF:.governance/skill-lint.allowlist" > "$UPSTREAM_EXTRACT/.governance/skill-lint.allowlist" 2>/dev/null; then
  :
else
  : > "$UPSTREAM_EXTRACT/.governance/skill-lint.allowlist"
fi

if git show "$UPSTREAM_REF:.governance/skill-llm.allowlist" > "$UPSTREAM_EXTRACT/.governance/skill-llm.allowlist" 2>/dev/null; then
  :
else
  : > "$UPSTREAM_EXTRACT/.governance/skill-llm.allowlist"
fi

FORK_SKILLS="$ROOT_DIR/$FORK_SKILLS_REL"
FORK_ALLOWLIST="$ROOT_DIR/.governance/skill-lint.allowlist"
FORK_LLM_ALLOWLIST="$ROOT_DIR/.governance/skill-llm.allowlist"

UPSTREAM_SKILLS="$UPSTREAM_EXTRACT/$UPSTREAM_SKILLS_REL"
UPSTREAM_ALLOWLIST="$UPSTREAM_EXTRACT/.governance/skill-lint.allowlist"
UPSTREAM_LLM_ALLOWLIST="$UPSTREAM_EXTRACT/.governance/skill-llm.allowlist"

FORK_REPORT="$REPORT_ROOT/fork"
UPSTREAM_REPORT="$REPORT_ROOT/upstream"
mkdir -p "$FORK_REPORT" "$UPSTREAM_REPORT"

failures=0

run_check "fork governance" \
  "$ROOT_DIR/scripts/check-skill-governance.sh" \
  --skills-dir "$FORK_SKILLS" \
  --allowlist "$FORK_ALLOWLIST" \
  --skills-rel-prefix "$FORK_SKILLS_REL" || failures=$((failures + 1))

run_check "fork llm governance ($LLM_MODE)" \
  node "$ROOT_DIR/scripts/check-skill-llm-governance.js" \
  --mode="$LLM_MODE" \
  --skills-dir="$FORK_SKILLS" \
  --allowlist="$FORK_LLM_ALLOWLIST" \
  --out-dir="$FORK_REPORT" || failures=$((failures + 1))

run_check "fork eval" \
  node "$ROOT_DIR/scripts/eval-skills.js" \
  --skills-dir="$FORK_SKILLS" \
  --out-dir="$FORK_REPORT" || failures=$((failures + 1))

run_check "upstream governance ($UPSTREAM_REF)" \
  "$ROOT_DIR/scripts/check-skill-governance.sh" \
  --skills-dir "$UPSTREAM_SKILLS" \
  --allowlist "$UPSTREAM_ALLOWLIST" \
  --skills-rel-prefix "$UPSTREAM_SKILLS_REL" || failures=$((failures + 1))

run_check "upstream llm governance ($LLM_MODE)" \
  node "$ROOT_DIR/scripts/check-skill-llm-governance.js" \
  --mode="$LLM_MODE" \
  --skills-dir="$UPSTREAM_SKILLS" \
  --allowlist="$UPSTREAM_LLM_ALLOWLIST" \
  --out-dir="$UPSTREAM_REPORT" || failures=$((failures + 1))

run_check "upstream eval" \
  node "$ROOT_DIR/scripts/eval-skills.js" \
  --skills-dir="$UPSTREAM_SKILLS" \
  --out-dir="$UPSTREAM_REPORT" || failures=$((failures + 1))

echo ""
echo "Summary"
echo "======="
echo "Upstream ref: $UPSTREAM_REF"
echo "Fork skills path: $FORK_SKILLS_REL"
echo "Upstream skills path: $UPSTREAM_SKILLS_REL"
echo "Report root: $REPORT_ROOT"
echo "Temporary extract: $UPSTREAM_EXTRACT"
echo "Failures: $failures"

if [[ "$KEEP_TMP" != "true" ]]; then
  rm -rf "$UPSTREAM_EXTRACT"
  echo "Temporary extract cleaned."
fi

if [[ "$failures" -gt 0 ]]; then
  exit 1
fi

echo "All source governance checks passed."
