#!/bin/bash

# oh-my-antigravity — global installer
# Installs skills to ~/.gemini/antigravity/skills, workflows to
# ~/.gemini/antigravity/global_workflows, registers MCP servers, and writes a
# skills block into ~/.gemini/GEMINI.md so Antigravity 2.0 can discover the
# global skills (the 2.0 agent prompt does not advertise the global skills dir).

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🌍 Installing oh-my-antigravity globally (~/.gemini/antigravity)..."
node "$ROOT_DIR/bin/oma.js" setup --scope user

echo ""
echo "✅ Global installation complete."
echo "   A skills block was added to ~/.gemini/GEMINI.md so global skills surface in Antigravity 2.0."
echo "   Restart the Antigravity agent session, then check: node $ROOT_DIR/bin/oma.js doctor"
