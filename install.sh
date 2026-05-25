#!/bin/bash

# oh-my-antigravity — workspace installer
# Installs skills + workflows + GEMINI.md skills block into a project workspace.
# Usage: ./install.sh [target_directory]   (defaults to current directory)

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="${1:-$PWD}"

mkdir -p "$TARGET_DIR"
echo "🚀 Installing oh-my-antigravity into workspace: $TARGET_DIR"
( cd "$TARGET_DIR" && node "$ROOT_DIR/bin/oma.js" setup --scope project-local )

echo ""
echo "✅ Done. Skills installed to .agents/skills + .agent/skills, workflows to .agents/workflows + .agent/workflows,"
echo "   and a skills block was added to $TARGET_DIR/GEMINI.md."
echo "   Restart the Antigravity agent session so it re-scans skills."
echo "   Check: node $ROOT_DIR/bin/oma.js doctor"
