#!/usr/bin/env node

/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { validateCatalogManifest, summarizeCatalogCounts } = require('./catalog-schema');

const root = path.resolve(__dirname, '..');
const skillsRoot = path.join(root, '.agent', 'skills');
const workflowsRoot = path.join(root, '.agent', 'workflows');

const CATEGORY_MAP_SKILLS = new Map([
  ['autopilot', 'execution'],
  ['ultrawork', 'execution'],
  ['swarm', 'execution'],
  ['pipeline', 'execution'],
  ['ralph', 'execution'],
  ['plan', 'planning'],
  ['review', 'planning'],
  ['analyze', 'analysis'],
  ['research', 'analysis'],
  ['security-review', 'quality'],
  ['code-review', 'quality'],
  ['tdd', 'quality'],
  ['doctor', 'utility'],
  ['help', 'utility'],
]);

const CATEGORY_MAP_WORKFLOWS = new Map([
  ['autopilot', 'execution'],
  ['ultrawork', 'execution'],
  ['swarm', 'execution'],
  ['pipeline', 'execution'],
  ['ralph', 'execution'],
  ['plan', 'planning'],
  ['review', 'planning'],
  ['analyze', 'analysis'],
  ['research', 'analysis'],
  ['security-review', 'quality'],
  ['code-review', 'quality'],
  ['tdd', 'quality'],
  ['doctor', 'utility'],
  ['help', 'utility'],
]);

const CORE_SKILLS = new Set(['autopilot', 'ultrawork', 'pipeline', 'ralph', 'plan', 'doctor', 'help']);
const CORE_WORKFLOWS = new Set(['autopilot', 'ultrawork', 'pipeline', 'ralph', 'plan', 'doctor', 'help']);

function parseArgs(argv) {
  return {
    verify: argv.includes('--verify'),
    dryRun: argv.includes('--dry-run'),
  };
}

function detectSkills() {
  if (!fs.existsSync(skillsRoot)) return [];
  return fs.readdirSync(skillsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function detectWorkflows() {
  if (!fs.existsSync(workflowsRoot)) return [];
  return fs.readdirSync(workflowsRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => entry.name.replace(/\.md$/i, ''))
    .sort();
}

function buildManifest() {
  const skillNames = detectSkills();
  const workflowNames = detectWorkflows();

  const skills = skillNames.map((name) => ({
    name,
    category: CATEGORY_MAP_SKILLS.get(name) || 'utility',
    status: 'active',
    core: CORE_SKILLS.has(name),
  }));

  const workflows = workflowNames.map((name) => ({
    name,
    category: CATEGORY_MAP_WORKFLOWS.get(name) || 'utility',
    status: 'active',
    core: CORE_WORKFLOWS.has(name),
  }));

  return {
    schemaVersion: 1,
    catalogVersion: new Date().toISOString().slice(0, 10),
    skills,
    workflows,
  };
}

function writeOrVerify(filePath, content, verify) {
  if (!verify) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  if (!fs.existsSync(filePath)) return false;
  const existing = fs.readFileSync(filePath, 'utf8');
  return existing === content;
}

function stable(value) {
  return JSON.stringify(value);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const manifest = validateCatalogManifest(buildManifest());
  const counts = summarizeCatalogCounts(manifest);

  const manifestPath = path.join(root, '.governance', 'catalog-manifest.json');
  const generatedPath = path.join(root, 'docs', 'generated', 'public-catalog.json');

  const manifestContent = `${JSON.stringify(manifest, null, 2)}\n`;
  const generatedContent = `${JSON.stringify(
    { generatedAt: new Date().toISOString(), counts, skills: manifest.skills, workflows: manifest.workflows },
    null,
    2,
  )}\n`;

  if (args.dryRun) {
    console.log(`Catalog preview: ${counts.skillCount} skills, ${counts.workflowCount} workflows`);
    return;
  }

  const manifestOk = writeOrVerify(manifestPath, manifestContent, args.verify);
  let generatedOk;
  if (!args.verify) {
    generatedOk = writeOrVerify(generatedPath, generatedContent, false);
  } else {
    if (!fs.existsSync(generatedPath)) {
      generatedOk = false;
    } else {
      const existing = JSON.parse(fs.readFileSync(generatedPath, 'utf8'));
      const expected = {
        counts,
        skills: manifest.skills,
        workflows: manifest.workflows,
      };
      const actual = {
        counts: existing.counts,
        skills: existing.skills,
        workflows: existing.workflows,
      };
      generatedOk = stable(actual) === stable(expected);
    }
  }

  if (args.verify) {
    if (!manifestOk || !generatedOk) {
      console.error('Catalog files are out of sync. Run: node scripts/generate-catalog-docs.js');
      process.exit(1);
    }
    console.log(`Catalog verified: ${counts.skillCount} skills, ${counts.workflowCount} workflows`);
    return;
  }

  console.log(`Catalog generated: ${counts.skillCount} skills, ${counts.workflowCount} workflows`);
}

main();
