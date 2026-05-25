const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const SKILL_INDEX_SCHEMA_VERSION = 1;

function sha256(input) {
  return crypto.createHash('sha256').update(String(input || '')).digest('hex');
}

function normalizeScalar(value) {
  return String(value || '')
    .trim()
    .replace(/^['"]|['"]$/g, '');
}

function parseFrontmatter(content) {
  const match = String(content || '').match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const metadata = {};
  let activeKey = null;

  for (const rawLine of match[1].split(/\r?\n/)) {
    if (/^\s+/.test(rawLine) && activeKey) {
      const continuation = normalizeScalar(rawLine);
      if (continuation) metadata[activeKey] = `${metadata[activeKey]} ${continuation}`.trim();
      continue;
    }

    const colonIndex = rawLine.indexOf(':');
    if (colonIndex === -1) {
      activeKey = null;
      continue;
    }

    const key = rawLine.slice(0, colonIndex).trim();
    const value = normalizeScalar(rawLine.slice(colonIndex + 1));
    metadata[key] = value === '>-' || value === '|' ? '' : value;
    activeKey = key;
  }

  return {
    metadata,
    frontmatterText: match[1],
  };
}

function parseList(value) {
  return String(value || '')
    .replace(/^\[|\]$/g, '')
    .split(',')
    .map((item) => normalizeScalar(item).toLowerCase())
    .filter(Boolean);
}

function tokenize(value) {
  return Array.from(new Set(
    String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fff_-]+/g, ' ')
      .split(/\s+/)
      .map((token) => token.trim())
      .filter((token) => token.length > 1),
  ));
}

function getDefaultSkillIndexPath(root) {
  return path.join(root, '.oma', 'cache', 'skill-index.json');
}

function candidateSkillRoots(root) {
  const roots = [];
  const localRoot = path.join(root, '.agent', 'skills', 'local');
  const upstreamRoot = path.join(root, '.agent', 'skills', 'upstream');

  if (fs.existsSync(localRoot)) roots.push({ source: 'local', dir: localRoot, priority: 0 });

  if (fs.existsSync(upstreamRoot)) {
    for (const entry of fs.readdirSync(upstreamRoot, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
      roots.push({ source: entry.name, dir: path.join(upstreamRoot, entry.name), priority: 1 });
    }
  }

  return roots;
}

function scanSkillRoot(root, sourceRoot) {
  if (!fs.existsSync(sourceRoot.dir)) return [];
  const skills = [];

  for (const entry of fs.readdirSync(sourceRoot.dir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) continue;

    const skillDir = path.join(sourceRoot.dir, entry.name);
    const skillFile = path.join(skillDir, 'SKILL.md');
    if (!fs.existsSync(skillFile)) continue;

    const content = fs.readFileSync(skillFile, 'utf8');
    const parsed = parseFrontmatter(content);
    if (!parsed || !parsed.metadata.name) continue;

    const stat = fs.statSync(skillFile);
    const metadata = parsed.metadata;
    const name = normalizeScalar(metadata.name) || entry.name;
    const description = normalizeScalar(metadata.description);
    const source = normalizeScalar(metadata.origin || metadata.source || sourceRoot.source);
    const relPath = path.relative(root, skillDir);
    const relSkillFile = path.relative(root, skillFile);

    skills.push({
      name,
      category: normalizeScalar(metadata.category || 'utility'),
      status: normalizeScalar(metadata.status || 'active'),
      source,
      version: normalizeScalar(metadata.version || '0.1.0'),
      layer: normalizeScalar(metadata.layer || ''),
      intent: normalizeScalar(metadata.intent || ''),
      tags: parseList(metadata.tags),
      description,
      descriptionTokens: tokenize(`${name} ${description} ${metadata.intent || ''} ${metadata.layer || ''} ${metadata.tags || ''}`),
      path: relPath,
      skillFile: relSkillFile,
      mtimeMs: stat.mtimeMs,
      size: stat.size,
      bodyHash: sha256(content),
      frontmatterHash: sha256(parsed.frontmatterText),
      priority: sourceRoot.priority,
    });
  }

  return skills;
}

function buildSkillIndex(root, options = {}) {
  const byName = new Map();
  for (const sourceRoot of candidateSkillRoots(root)) {
    for (const skill of scanSkillRoot(root, sourceRoot)) {
      const existing = byName.get(skill.name);
      if (!existing || skill.priority < existing.priority) {
        byName.set(skill.name, skill);
      }
    }
  }

  const skills = Array.from(byName.values())
    .map(({ priority, ...skill }) => skill)
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    schemaVersion: SKILL_INDEX_SCHEMA_VERSION,
    generatedAt: options.generatedAt || new Date().toISOString(),
    rootFingerprint: sha256(skills.map((skill) => `${skill.skillFile}:${skill.mtimeMs}:${skill.size}:${skill.bodyHash}`).join('\n')),
    counts: {
      skillCount: skills.length,
      activeSkillCount: skills.filter((skill) => skill.status === 'active').length,
    },
    skills,
  };
}

function writeSkillIndex(root, index = buildSkillIndex(root), options = {}) {
  const outFile = options.outFile || getDefaultSkillIndexPath(root);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, `${JSON.stringify(index, null, 2)}\n`, 'utf8');
  return outFile;
}

function readSkillIndex(root, options = {}) {
  const indexPath = options.indexPath || getDefaultSkillIndexPath(root);
  if (!fs.existsSync(indexPath)) return null;
  const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  if (Number(index.schemaVersion) !== SKILL_INDEX_SCHEMA_VERSION || !Array.isArray(index.skills)) return null;
  return index;
}

function isSkillIndexFresh(root, index) {
  if (!index || !Array.isArray(index.skills)) return false;

  for (const skill of index.skills) {
    if (!skill.skillFile) return false;
    const skillFile = path.join(root, skill.skillFile);
    if (!fs.existsSync(skillFile)) return false;
    const stat = fs.statSync(skillFile);
    if (stat.size !== skill.size) return false;
    if (stat.mtimeMs !== skill.mtimeMs) return false;
  }

  return true;
}

function getFreshSkillIndex(root, options = {}) {
  const index = readSkillIndex(root, options);
  if (!isSkillIndexFresh(root, index)) return null;
  return index;
}

module.exports = {
  SKILL_INDEX_SCHEMA_VERSION,
  buildSkillIndex,
  getDefaultSkillIndexPath,
  getFreshSkillIndex,
  isSkillIndexFresh,
  readSkillIndex,
  tokenize,
  writeSkillIndex,
};
