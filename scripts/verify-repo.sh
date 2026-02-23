#!/bin/bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

echo "==> Catalog"
node scripts/generate-catalog-docs.js
node scripts/generate-catalog-docs.js --verify

echo
echo "==> Governance"
bash scripts/check-skill-governance.sh

echo
echo "==> Metadata Sync"
node scripts/sync-metadata.js
node scripts/sync-metadata.js --verify

echo
echo "✅ Repository verification passed."
