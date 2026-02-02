#!/bin/bash

# oh-my-antigravity Installer
# Usage: ./install.sh [target_directory]

set -e

SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/.agent"
TARGET_DIR="${1:-.}"
TARGET_AGENT_DIR="$TARGET_DIR/.agent"

echo "🚀 Installing oh-my-antigravity to '$TARGET_DIR'..."

if [ ! -d "$SOURCE_DIR" ]; then
    echo "❌ Error: Source .agent directory not found at $SOURCE_DIR"
    exit 1
fi

# Create target directories
echo "📂 Creating .agent structure..."
mkdir -p "$TARGET_AGENT_DIR/skills"
mkdir -p "$TARGET_AGENT_DIR/workflows"
mkdir -p "$TARGET_AGENT_DIR/rules"

# Copy Skills
echo "🧠 Copying 72+ Skills..."
cp -R "$SOURCE_DIR/skills/"* "$TARGET_AGENT_DIR/skills/"

# Copy Workflows
echo "⚡️ Copying 32 Workflows..."
cp -R "$SOURCE_DIR/workflows/"* "$TARGET_AGENT_DIR/workflows/"

# Copy Rules
echo "📜 Copying System Rules..."
cp -R "$SOURCE_DIR/rules/"* "$TARGET_AGENT_DIR/rules/"

echo "✅ Installation Complete!"
echo ""
echo "🎉 You can now use all oh-my-antigravity features in this project."
echo "   Try running: /help"
