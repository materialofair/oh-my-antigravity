#!/bin/bash

# oh-my-antigravity Global Installer (compat wrapper)

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🌍 Installing oh-my-antigravity globally..."
node "$ROOT_DIR/bin/oma.js" setup --scope user

echo ""
echo "✅ Global installation complete!"
echo "   Try: node $ROOT_DIR/bin/oma.js doctor"
