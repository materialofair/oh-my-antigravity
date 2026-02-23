#!/bin/bash

# oh-my-antigravity Global Installer
# Installs skills/workflows globally and creates compatibility links for
# Antigravity workflow discovery paths.

set -euo pipefail

SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/.agent"
TARGET_SKILLS_DIR="$HOME/.gemini/antigravity/skills"
TARGET_WORKFLOWS_DIR="$HOME/.gemini/antigravity/global_workflows"
LEGACY_WORKFLOWS_LINK="$HOME/.gemini/antigravity/workflows"
COMPAT_BASE_DIRS=( ".agent" ".agents" "_agent" "_agents" )

copy_dir_contents() {
    local from_dir="$1"
    local to_dir="$2"
    mkdir -p "$to_dir"
    cp -R "$from_dir/." "$to_dir/"
}

ensure_symlink() {
    local target="$1"
    local link_path="$2"

    if [ -e "$link_path" ] && [ ! -L "$link_path" ]; then
        echo "⚠️  Skip link (path exists and is not a symlink): $link_path"
        return
    fi

    ln -sfn "$target" "$link_path"
    echo "   Linked: $link_path -> $target"
}

echo "🌍 Installing oh-my-antigravity GLOBALLY..."
echo "   Skills     → $TARGET_SKILLS_DIR"
echo "   Workflows  → $TARGET_WORKFLOWS_DIR"

if [ ! -d "$SOURCE_DIR" ]; then
    echo "❌ Error: Source .agent directory not found at $SOURCE_DIR"
    exit 1
fi

echo "📂 Creating global structure..."
mkdir -p "$TARGET_SKILLS_DIR"
mkdir -p "$TARGET_WORKFLOWS_DIR"
mkdir -p "$(dirname "$LEGACY_WORKFLOWS_LINK")"

echo "🧠 Copying skills..."
copy_dir_contents "$SOURCE_DIR/skills" "$TARGET_SKILLS_DIR"

echo "⚡️ Copying workflows..."
copy_dir_contents "$SOURCE_DIR/workflows" "$TARGET_WORKFLOWS_DIR"

echo "🔗 Creating workflow compatibility links..."
ensure_symlink "$TARGET_WORKFLOWS_DIR" "$LEGACY_WORKFLOWS_LINK"

for base_dir in "${COMPAT_BASE_DIRS[@]}"; do
    mkdir -p "$HOME/$base_dir"
    ensure_symlink "$TARGET_WORKFLOWS_DIR" "$HOME/$base_dir/workflows"
done

echo "✅ Global installation complete!"
echo ""
echo "🎉 Skills are available globally via: $TARGET_SKILLS_DIR"
echo "🎉 Workflows are available globally via: $TARGET_WORKFLOWS_DIR"
echo "   plus compatibility links under ~/.agent|~/.agents|~/_agent|~/_agents."
echo ""
echo "ℹ️  If a project has its own .agent/workflows, project-local workflows still take precedence."
