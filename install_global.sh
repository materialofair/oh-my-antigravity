#!/bin/bash

# oh-my-antigravity Global Installer
# Installs skills to ~/.agent so they are accessible from any subdirectory in your home folder.

set -e

SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/.agent"
# Correct Gemini Antigravity global configuration paths
TARGET_SKILLS_DIR="$HOME/.gemini/antigravity/skills"
TARGET_WORKFLOWS_DIR="$HOME/.gemini/antigravity/global_workflows"

echo "🌍 Installing oh-my-antigravity GLOBALLY..."
echo "   Skills     → $TARGET_SKILLS_DIR"
echo "   Workflows  → $TARGET_WORKFLOWS_DIR"

if [ ! -d "$SOURCE_DIR" ]; then
    echo "❌ Error: Source .agent directory not found at $SOURCE_DIR"
    exit 1
fi

# Create target directories
echo "📂 Creating global structure..."
mkdir -p "$TARGET_SKILLS_DIR"
mkdir -p "$TARGET_WORKFLOWS_DIR"

# Copy Skills
echo "🧠 Copying 72+ Skills..."
cp -R "$SOURCE_DIR/skills/"* "$TARGET_SKILLS_DIR/"

# Copy Workflows
echo "⚡️ Copying 32 Workflows..."
cp -R "$SOURCE_DIR/workflows/"* "$TARGET_WORKFLOWS_DIR/"

echo "✅ Global Installation Complete!"
echo ""
echo "🎉 You can now use oh-my-antigravity features in ANY project."
echo "   Try: /help or /doctor in a new window."
