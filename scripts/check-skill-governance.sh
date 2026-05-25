#!/usr/bin/env bash
set -euo pipefail

# Skill governance for oh-my-antigravity.
#
# Antigravity-native skills are invoked by name, and WORKFLOWS are invoked via
# slash commands (/autopilot, /plan, ...). So slash commands are legitimate and
# are NOT flagged. The blockers below catch foreign-runtime leakage from the
# Claude Code / Codex heritage that does not work under Antigravity.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SKILLS_DIR="$ROOT_DIR/.agent/skills/local"
ARTIFACT_GLOBS=(--glob 'SKILL.md' --glob 'commands/**/*.toml' --glob 'templates/workflow.md' --glob 'templates/rules/*.md')

while [[ $# -gt 0 ]]; do
  case "$1" in
    --skills-dir) SKILLS_DIR="$2"; shift 2 ;;
    --help)
      echo "Usage: ./scripts/check-skill-governance.sh [--skills-dir <path>]"
      exit 0 ;;
    *) echo "Unknown argument: $1" >&2; exit 1 ;;
  esac
done

if [[ ! -d "$SKILLS_DIR" ]]; then
  echo "Missing skills directory: $SKILLS_DIR" >&2
  exit 1
fi

failures=0

check_blocker() {
  local rule_id="$1"; local pattern="$2"; local message="$3"
  local output
  output="$(rg -n -P "${ARTIFACT_GLOBS[@]}" "$pattern" "$SKILLS_DIR" || true)"
  if [[ -n "$output" ]]; then
    failures=$((failures + 1))
    echo "BLOCKER [$rule_id]: $message"
    echo "$output"
    echo
  fi
}

# Foreign-runtime leakage (Claude Code / Codex artifacts that break in Antigravity).
check_blocker "claude_task_api" "\\bTask\\s*\\(\\s*(\\{|subagent_type|model|prompt|run_in_background)" \
  "Use Antigravity persona/subagent guidance, not the Claude Code Task(...) API."
check_blocker "claude_task_output" "TaskOutput" \
  "Use Antigravity-native waiting, not Claude Code TaskOutput references."
check_blocker "foreign_runtime_paths" "~/\\.claude/skills|~/\\.codex/skills|cc[[:space:]]+--plugin-dir" \
  "Avoid Claude Code / Codex runtime paths; Antigravity skills live under ~/.gemini/antigravity."

# Every skill must have frontmatter with a description (required for discovery).
while IFS= read -r skillfile; do
  [[ -z "$skillfile" ]] && continue
  if ! rg -q "^description:" "$skillfile"; then
    failures=$((failures + 1))
    echo "BLOCKER [missing_description]: $skillfile has no 'description:' frontmatter (required for Antigravity discovery)."
    echo
  fi
done < <(find "$SKILLS_DIR" -name SKILL.md)

if [[ "$failures" -gt 0 ]]; then
  echo "Skill governance check failed ($failures issue(s))."
  exit 1
fi

echo "Skill governance check passed."
