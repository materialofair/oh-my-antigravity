#!/usr/bin/env bash
set -eo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SKIP_FETCH="false"
SOURCE="all"
FROM_PATH=""

# Upstream source definitions (parallel arrays for bash 3 compat)
UPSTREAM_NAMES=("oh-my-codex" "superpowers")
UPSTREAM_REMOTES=("upstream" "superpowers")
UPSTREAM_REFS=("upstream/main" "superpowers/main")
UPSTREAM_URLS=("https://github.com/Yeachan-Heo/oh-my-codex.git" "https://github.com/obra/superpowers.git")

usage() {
  cat <<'EOF'
Usage: ./scripts/sync-upstream-skills.sh [options]

Sync upstream skills into .agent/skills/upstream/<source>/ for local merge/governance.

Options:
  --source <name>      Upstream source to sync: oh-my-codex | superpowers | all (default: all)
  --skip-fetch         Skip git fetch
  --from-path <dir>    Sync from a local directory mirror (offline; expects <dir>/<source>/<skill>/SKILL.md)
  --help               Show this help

Sources:
  oh-my-codex    https://github.com/Yeachan-Heo/oh-my-codex (remote: upstream)
  superpowers    https://github.com/obra/superpowers (remote: superpowers)
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --source)
      SOURCE="$2"
      shift 2
      ;;
    --skip-fetch)
      SKIP_FETCH="true"
      shift
      ;;
    --from-path)
      FROM_PATH="$2"
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

cd "$ROOT_DIR"

# When --skip-fetch, if upstream skills already exist on disk, skip sync entirely
if [[ "$SKIP_FETCH" == "true" ]]; then
  all_present=true
  for name in "${UPSTREAM_NAMES[@]}"; do
    target_dir="$ROOT_DIR/.agent/skills/upstream/$name"
    if [[ ! -d "$target_dir" ]] || [[ -z "$(ls -A "$target_dir" 2>/dev/null)" ]]; then
      all_present=false
      break
    fi
  done
  if [[ "$all_present" == "true" ]]; then
    echo "Upstream skills already present on disk (--skip-fetch). Skipping sync."
    ls -d .agent/skills/upstream/*/
    exit 0
  fi
fi

get_index() {
  local needle="$1"
  for i in "${!UPSTREAM_NAMES[@]}"; do
    if [[ "${UPSTREAM_NAMES[$i]}" == "$needle" ]]; then
      echo "$i"
      return 0
    fi
  done
  return 1
}

sync_source() {
  local name="$1"
  local idx
  idx=$(get_index "$name") || { echo "Unknown source: $name" >&2; return 1; }
  local remote="${UPSTREAM_REMOTES[$idx]}"
  local ref="${UPSTREAM_REFS[$idx]}"
  local url="${UPSTREAM_URLS[$idx]}"
  local target_dir="$ROOT_DIR/.agent/skills/upstream/$name"

  echo "Syncing $name..."

  # Offline mirror mode: copy from a local directory instead of git fetch
  if [[ -n "$FROM_PATH" ]]; then
    local src_dir="$FROM_PATH/$name"
    if [[ ! -d "$src_dir" ]]; then
      echo "  Mirror source not found: $src_dir" >&2
      return 1
    fi
    rm -rf "$target_dir"
    mkdir -p "$target_dir"
    cp -R "$src_dir"/* "$target_dir/"
    local count
    count=$(ls -d "$target_dir"/*/ 2>/dev/null | wc -l | tr -d ' ')
    echo "  Synced $count skills from mirror $src_dir -> $target_dir"
    return 0
  fi

  # Ensure remote exists
  if ! git remote get-url "$remote" >/dev/null 2>&1; then
    echo "  Adding remote '$remote' -> $url"
    git remote add "$remote" "$url"
  fi

  # Fetch
  if [[ "$SKIP_FETCH" != "true" ]]; then
    git fetch "$remote"
  fi

  if ! git rev-parse --verify "$ref" >/dev/null 2>&1; then
    echo "  Upstream ref not found: $ref" >&2
    return 1
  fi

  # Detect skills directory in upstream
  local skills_dir=""
  for candidate in "skills" ".agent/skills" ".codex/skills"; do
    if git cat-file -e "$ref:$candidate" 2>/dev/null; then
      skills_dir="$candidate"
      break
    fi
  done

  if [[ -z "$skills_dir" ]]; then
    echo "  No skills directory found in $ref" >&2
    return 1
  fi

  # Extract skills to target
  rm -rf "$target_dir"
  mkdir -p "$target_dir"

  local tmp_dir
  tmp_dir=$(mktemp -d)
  git archive "$ref" "$skills_dir" | tar -x -C "$tmp_dir"

  # Copy skills (handle nested paths like .agent/skills/)
  cp -R "$tmp_dir/$skills_dir"/* "$target_dir/"
  rm -rf "$tmp_dir"

  local count
  count=$(ls -d "$target_dir"/*/ 2>/dev/null | wc -l | tr -d ' ')
  echo "  Synced $count skills from $ref:$skills_dir -> $target_dir"
}

if [[ "$SOURCE" == "all" ]]; then
  for name in "${UPSTREAM_NAMES[@]}"; do
    sync_source "$name"
  done
else
  if ! get_index "$SOURCE" >/dev/null 2>&1; then
    echo "Unknown source: $SOURCE" >&2
    echo "Available: ${UPSTREAM_NAMES[*]}" >&2
    exit 1
  fi
  sync_source "$SOURCE"
fi

echo ""
echo "Upstream skills synced successfully."
echo "  Layout: .agent/skills/upstream/<source>/"
ls -d .agent/skills/upstream/*/
