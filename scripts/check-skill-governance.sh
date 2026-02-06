#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SKILLS_DIR="$PROJECT_ROOT/.agent/skills"
WORKFLOWS_DIR="$PROJECT_ROOT/.agent/workflows"
ALLOWLIST_FILE="$PROJECT_ROOT/.governance/skill-lint.allowlist"

red='\033[0;31m'
green='\033[0;32m'
yellow='\033[1;33m'
nc='\033[0m'

total_issues=0
allowed_issues=0
failed_issues=0
checked_skills=0
checked_workflows=0

today="$(date +%F)"

declare -a ALLOW_PATTERNS=()
declare -a ALLOW_OWNERS=()
declare -a ALLOW_EXPIRES=()
declare -a ALLOW_REASONS=()

load_allowlist() {
  if [[ ! -f "$ALLOWLIST_FILE" ]]; then
    return
  fi

  while IFS='|' read -r pattern owner expires reason; do
    [[ -z "${pattern:-}" ]] && continue
    [[ "$pattern" =~ ^[[:space:]]*# ]] && continue

    ALLOW_PATTERNS+=("$(echo "$pattern" | xargs)")
    ALLOW_OWNERS+=("$(echo "${owner:-}" | xargs)")
    ALLOW_EXPIRES+=("$(echo "${expires:-}" | xargs)")
    ALLOW_REASONS+=("${reason:-}")
  done < "$ALLOWLIST_FILE"
}

allow_match_index() {
  local issue_key="$1"
  local i
  for i in "${!ALLOW_PATTERNS[@]}"; do
    if [[ "$issue_key" == ${ALLOW_PATTERNS[$i]} ]]; then
      echo "$i"
      return 0
    fi
  done
  return 1
}

record_issue() {
  local issue_key="$1"
  local message="$2"
  local idx

  total_issues=$((total_issues + 1))

  if idx="$(allow_match_index "$issue_key")"; then
    local expires="${ALLOW_EXPIRES[$idx]}"
    local owner="${ALLOW_OWNERS[$idx]}"
    local reason="${ALLOW_REASONS[$idx]}"

    if [[ -n "$expires" && "$today" > "$expires" ]]; then
      failed_issues=$((failed_issues + 1))
      printf "${red}FAIL${nc} %s | allowlist expired %s | owner=%s | %s\n" "$issue_key" "$expires" "$owner" "$message"
      return
    fi

    allowed_issues=$((allowed_issues + 1))
    printf "${yellow}ALLOW${nc} %s | expires=%s | owner=%s | %s\n" "$issue_key" "${expires:-n/a}" "${owner:-n/a}" "${reason:-$message}"
  else
    failed_issues=$((failed_issues + 1))
    printf "${red}FAIL${nc} %s | %s\n" "$issue_key" "$message"
  fi
}

extract_frontmatter() {
  local file="$1"
  awk '
    NR==1 && $0=="---" { in_fm=1; next }
    in_fm && $0=="---" { exit }
    in_fm { print }
  ' "$file"
}

has_frontmatter() {
  local file="$1"
  local first
  first="$(head -n 1 "$file" 2>/dev/null || true)"
  [[ "$first" == "---" ]]
}

has_key() {
  local frontmatter="$1"
  local key="$2"
  echo "$frontmatter" | grep -Eiq "^${key}:"
}

get_value() {
  local frontmatter="$1"
  local key="$2"
  echo "$frontmatter" | grep -Ei "^${key}:" | head -n 1 | sed -E "s/^${key}:[[:space:]]*//I" | sed -E "s/[[:space:]]+$//"
}

check_common_content() {
  local kind="$1"
  local name="$2"
  local file="$3"

  if rg -n "oh-my-claudecode|~/.claude/" "$file" >/dev/null 2>&1; then
    record_issue "${kind}:${name}:LEGACY_CLAUDE_REFERENCE" "Legacy Claude path/reference found in ${file}"
  fi

  if rg -n "PreToolUse|PostToolUse|hooks\\.json" "$file" >/dev/null 2>&1; then
    record_issue "${kind}:${name}:UNSUPPORTED_HOOK_REFERENCE" "Legacy hook reference found in ${file}"
  fi

  if rg -n "Task\\s*\\(\\s*agent\\s*=|Task\\s*\\(.*subagent_type\\s*=|subagent_type\\s*=" "$file" >/dev/null 2>&1; then
    record_issue "${kind}:${name}:UNSUPPORTED_SUBAGENT_CALL" "Task/subagent_type/agent syntax is not guaranteed executable in Antigravity runtime: ${file}"
  fi

  if ! rg -n "^##[[:space:]]+Outputs?$" "$file" >/dev/null 2>&1; then
    record_issue "${kind}:${name}:MISSING_OUTPUT_CONTRACT" "Missing '## Output'/'## Outputs' contract section in ${file}"
  fi
}

check_skill_file() {
  local skill_name="$1"
  local file="$2"
  local fm

  checked_skills=$((checked_skills + 1))

  if ! has_frontmatter "$file"; then
    record_issue "SKILL:${skill_name}:MISSING_FRONTMATTER" "Missing YAML frontmatter in ${file}"
    return
  fi

  fm="$(extract_frontmatter "$file")"

  if ! has_key "$fm" "name"; then
    record_issue "SKILL:${skill_name}:MISSING_NAME" "Missing 'name' in ${file}"
  else
    local declared_name
    declared_name="$(get_value "$fm" "name")"
    if [[ "$declared_name" != "$skill_name" ]]; then
      record_issue "SKILL:${skill_name}:NAME_MISMATCH" "Frontmatter name '$declared_name' does not match folder '$skill_name'"
    fi
  fi

  if ! has_key "$fm" "description"; then
    record_issue "SKILL:${skill_name}:MISSING_DESCRIPTION" "Missing 'description' in ${file}"
  fi

  if ! has_key "$fm" "owner"; then
    record_issue "SKILL:${skill_name}:MISSING_OWNER" "Missing 'owner' in ${file}"
  fi

  if ! has_key "$fm" "maturity"; then
    record_issue "SKILL:${skill_name}:MISSING_MATURITY" "Missing 'maturity' in ${file}"
  else
    local maturity
    maturity="$(get_value "$fm" "maturity")"
    if [[ ! "$maturity" =~ ^(core|domain|experimental|deprecated)$ ]]; then
      record_issue "SKILL:${skill_name}:INVALID_MATURITY" "Invalid maturity '$maturity' in ${file}"
    fi
  fi

  if ! has_key "$fm" "last-reviewed"; then
    record_issue "SKILL:${skill_name}:MISSING_LAST_REVIEWED" "Missing 'last-reviewed' in ${file}"
  else
    local reviewed
    reviewed="$(get_value "$fm" "last-reviewed")"
    if [[ ! "$reviewed" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
      record_issue "SKILL:${skill_name}:INVALID_LAST_REVIEWED" "Invalid last-reviewed date '$reviewed' in ${file}"
    fi
  fi

  check_common_content "SKILL" "$skill_name" "$file"
}

check_workflow_file() {
  local workflow_name="$1"
  local file="$2"
  local fm

  checked_workflows=$((checked_workflows + 1))

  if ! has_frontmatter "$file"; then
    record_issue "WORKFLOW:${workflow_name}:MISSING_FRONTMATTER" "Missing YAML frontmatter in ${file}"
    return
  fi

  fm="$(extract_frontmatter "$file")"

  if ! has_key "$fm" "description"; then
    record_issue "WORKFLOW:${workflow_name}:MISSING_DESCRIPTION" "Missing 'description' in ${file}"
  fi

  if ! has_key "$fm" "owner"; then
    record_issue "WORKFLOW:${workflow_name}:MISSING_OWNER" "Missing 'owner' in ${file}"
  fi

  if ! has_key "$fm" "maturity"; then
    record_issue "WORKFLOW:${workflow_name}:MISSING_MATURITY" "Missing 'maturity' in ${file}"
  else
    local maturity
    maturity="$(get_value "$fm" "maturity")"
    if [[ ! "$maturity" =~ ^(core|domain|experimental|deprecated)$ ]]; then
      record_issue "WORKFLOW:${workflow_name}:INVALID_MATURITY" "Invalid maturity '$maturity' in ${file}"
    fi
  fi

  if ! has_key "$fm" "last-reviewed"; then
    record_issue "WORKFLOW:${workflow_name}:MISSING_LAST_REVIEWED" "Missing 'last-reviewed' in ${file}"
  else
    local reviewed
    reviewed="$(get_value "$fm" "last-reviewed")"
    if [[ ! "$reviewed" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
      record_issue "WORKFLOW:${workflow_name}:INVALID_LAST_REVIEWED" "Invalid last-reviewed date '$reviewed' in ${file}"
    fi
  fi

  check_common_content "WORKFLOW" "$workflow_name" "$file"
}

main() {
  echo "==> Skill governance check"
  echo "Project: $PROJECT_ROOT"
  echo "Date: $today"
  echo

  load_allowlist

  if [[ -d "$SKILLS_DIR" ]]; then
    while IFS= read -r -d '' skill_file; do
      local skill_name
      skill_name="$(basename "$(dirname "$skill_file")")"
      check_skill_file "$skill_name" "$skill_file"
    done < <(find "$SKILLS_DIR" -type f -name "SKILL.md" -print0 | sort -z)
  fi

  if [[ -d "$WORKFLOWS_DIR" ]]; then
    while IFS= read -r -d '' workflow_file; do
      local workflow_name
      workflow_name="$(basename "$workflow_file" .md)"
      check_workflow_file "$workflow_name" "$workflow_file"
    done < <(find "$WORKFLOWS_DIR" -type f -name "*.md" -print0 | sort -z)
  fi

  echo
  echo "==> Summary"
  echo "Skills checked: $checked_skills"
  echo "Workflows checked: $checked_workflows"
  echo "Issues found: $total_issues"
  echo "Allowlisted debt: $allowed_issues"
  echo "Unallowlisted/expired: $failed_issues"

  if [[ "$failed_issues" -gt 0 ]]; then
    echo
    printf "${red}Governance check failed.${nc}\n"
    exit 1
  fi

  echo
  printf "${green}Governance check passed.${nc}\n"
}

main "$@"
