#!/bin/bash

# oh-my-antigravity Installer (compat wrapper)
# Usage: ./install.sh [target_directory]

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="${1:-.}"

echo "🚀 Installing oh-my-antigravity to '$TARGET_DIR'..."
node "$ROOT_DIR/bin/oma.js" setup --scope project-local --target "$TARGET_DIR"

echo ""
echo "✅ Installation Complete!"
echo "   Try: node $ROOT_DIR/bin/oma.js doctor"
