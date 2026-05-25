const fs = require('fs');
const path = require('path');
const { validateCatalogManifest, summarizeCatalogCounts } = require('./schema');

function resolveManifestPath(root) {
  const candidates = [
    path.join(root, 'templates', 'catalog-manifest.json'),
    path.join(root, 'src', 'catalog', 'manifest.json'),
  ];

  for (const file of candidates) {
    if (fs.existsSync(file)) return file;
  }
  return null;
}

function readCatalogManifest(root) {
  const manifestPath = resolveManifestPath(root);
  if (!manifestPath) throw new Error('catalog_manifest_missing');
  const raw = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  return validateCatalogManifest(raw);
}

function tryReadCatalogManifest(root) {
  try {
    return readCatalogManifest(root);
  } catch {
    return null;
  }
}

function getCatalogHeadlineCounts(root) {
  const manifest = tryReadCatalogManifest(root);
  if (!manifest) return null;
  const counts = summarizeCatalogCounts(manifest);
  return { prompts: counts.promptCount, skills: counts.skillCount };
}

module.exports = {
  readCatalogManifest,
  tryReadCatalogManifest,
  getCatalogHeadlineCounts,
};
