#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "Harness Governance Check"
echo "========================"
echo ""

# Run harness lint via CLI
node "$ROOT_DIR/bin/oma.js" harness lint
