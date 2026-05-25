#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { validateCatalogManifest, summarizeCatalogCounts } = require('../src/catalog/schema');

const root = path.resolve(__dirname, '..');
const localSkillsRoot = path.join(root, '.agent', 'skills', 'local');
const upstreamSkillsRoot = path.join(root, '.agent', 'skills', 'upstream');
// Legacy fallback
const skillsRoot = fs.existsSync(localSkillsRoot)
  ? localSkillsRoot
  : fs.existsSync(path.join(root, '.agent', 'skills'))
    ? path.join(root, '.agent', 'skills')
    : path.join(root, '.codex', 'skills');
const promptsRoot = path.join(root, 'prompts');

const CATEGORY_MAP = new Map([
  ['autopilot', 'execution'],
  ['ralph', 'execution'],
  ['team', 'execution'],
  ['ultrawork', 'execution'],
  ['ultraqa', 'execution'],
  ['swarm', 'execution'],
  ['ralplan', 'planning'],
  ['plan', 'planning'],
  ['code-review', 'shortcut'],
  ['security-review', 'shortcut'],
  ['tdd', 'shortcut'],
  ['build-fix', 'shortcut'],
]);

const CORE = new Set(['autopilot', 'ralph', 'ultrawork', 'plan']);

function parseSkillMetadata(skillPath) {
  const skillFile = path.join(skillPath, 'SKILL.md');
  if (!fs.existsSync(skillFile)) return null;

  try {
    const content = fs.readFileSync(skillFile, 'utf8');
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return null;

    const frontmatterText = match[1];
    const metadata = {};

    frontmatterText.split('\n').forEach((line) => {
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) return;

      const key = line.slice(0, colonIndex).trim();
      const value = line.slice(colonIndex + 1).trim();
      metadata[key] = value;
    });

    return metadata;
  } catch (err) {
    return null;
  }
}

function detectSkills() {
  const seen = new Map();

  // Load local skills (highest priority)
  if (fs.existsSync(skillsRoot)) {
    for (const entry of fs.readdirSync(skillsRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const metadata = parseSkillMetadata(path.join(skillsRoot, entry.name));
      seen.set(entry.name, { name: entry.name, metadata, source: 'local' });
    }
  }

  // Load upstream skills (lower priority, skip if local already has it)
  if (fs.existsSync(upstreamSkillsRoot)) {
    for (const srcDir of fs.readdirSync(upstreamSkillsRoot, { withFileTypes: true })) {
      if (!srcDir.isDirectory()) continue;
      const srcPath = path.join(upstreamSkillsRoot, srcDir.name);
      for (const entry of fs.readdirSync(srcPath, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;
        if (seen.has(entry.name)) continue; // local wins
        const metadata = parseSkillMetadata(path.join(srcPath, entry.name));
        seen.set(entry.name, { name: entry.name, metadata, source: srcDir.name });
      }
    }
  }

  return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name));
}


function detectPrompts() {
  if (!fs.existsSync(promptsRoot)) return [];
  return fs.readdirSync(promptsRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => entry.name.replace(/\.md$/i, ''))
    .sort();
}

function buildManifest() {
  const skillsData = detectSkills();
  const promptNames = detectPrompts();

  const skills = skillsData.map((skillData) => {
    const { name, metadata } = skillData;
    return {
      name,
      category: CATEGORY_MAP.get(name) || 'utility',
      status: 'active',
      core: CORE.has(name),
      source: metadata?.source || skillData.source || 'unknown',
      version: metadata?.version || '0.1.0',
      layer: metadata?.layer || null,
      intent: metadata?.intent || null,
      composes: metadata?.composes ? metadata.composes.replace(/[\[\]]/g, '').split(',').map((s) => s.trim()).filter(Boolean) : [],
    };
  });

  const agents = promptNames.map((name) => ({
    name,
    category: 'role',
    status: 'active',
    core: ['architect', 'planner', 'executor'].includes(name),
  }));

  return {
    schemaVersion: 1,
    catalogVersion: new Date().toISOString().slice(0, 10),
    skills,
    agents,
  };
}


function main() {
  const manifest = validateCatalogManifest(buildManifest());
  const counts = summarizeCatalogCounts(manifest);

  const templatePath = path.join(root, 'templates', 'catalog-manifest.json');
  const sourcePath = path.join(root, 'src', 'catalog', 'manifest.json');
  const generatedPath = path.join(root, 'src', 'catalog', 'generated', 'public-catalog.json');

  fs.mkdirSync(path.dirname(templatePath), { recursive: true });
  fs.mkdirSync(path.dirname(sourcePath), { recursive: true });
  fs.mkdirSync(path.dirname(generatedPath), { recursive: true });

  fs.writeFileSync(templatePath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  fs.writeFileSync(sourcePath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  fs.writeFileSync(
    generatedPath,
    `${JSON.stringify({ generatedAt: new Date().toISOString(), counts, skills: manifest.skills, agents: manifest.agents }, null, 2)}\n`,
    'utf8',
  );

  console.log(`Catalog generated: ${counts.skillCount} skills, ${counts.promptCount} prompts`);
}

main();
