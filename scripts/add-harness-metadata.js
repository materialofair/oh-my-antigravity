#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Batch-update SKILL.md files with intent and layer harness metadata.
 * Reads from intent-registry.json and layer-map.json, injects fields into frontmatter.
 */

const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const intentRegistry = require('../src/harness/intent-registry.json');
const layerMap = require('../src/harness/layer-map.json');

const ROOT = path.resolve(__dirname, '..');
const SKILL_DIRS = [
  path.join(ROOT, '.agent', 'skills', 'local'),
  path.join(ROOT, '.agent', 'skills', 'upstream', 'oh-my-codex'),
  path.join(ROOT, '.agent', 'skills', 'upstream', 'superpowers'),
];

// Build reverse lookups
const skillToIntent = new Map();
const skillToRole = new Map();
for (const [intent, group] of Object.entries(intentRegistry)) {
  skillToIntent.set(group.canonical, intent);
  for (const [name, info] of Object.entries(group.variants)) {
    skillToIntent.set(name, intent);
    skillToRole.set(name, info.role);
  }
}

const skillToLayer = new Map();
for (const [layer, skills] of Object.entries(layerMap)) {
  for (const skill of skills) skillToLayer.set(skill, layer);
}

function parseFrontmatter(content) {
  const match = content.match(/^(---\n)([\s\S]*?)\n(---)/);
  if (!match) return { before: '', frontmatter: '', after: content, fields: {} };

  const before = match[1];
  const frontmatterText = match[2];
  const after = content.slice(match[0].length);
  const fields = {};

  frontmatterText.split('\n').forEach((line) => {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) return;
    const key = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim();
    fields[key] = value;
  });

  return { before, frontmatter: frontmatterText, after, fields };
}

function rebuildFrontmatter(fields, intent, layer) {
  const lines = [];

  // Preserve existing fields in order
  const existing = fields.frontmatter.split('\n');
  for (const line of existing) {
    // Skip existing intent/layer lines (we'll add fresh ones)
    if (line.startsWith('intent:') || line.startsWith('layer:')) continue;
    lines.push(line);
  }

  // Add intent and layer before closing ---
  if (intent) lines.push(`intent: ${intent}`);
  if (layer) lines.push(`layer: ${layer}`);

  return `---\n${lines.join('\n')}\n---`;
}

async function processSkill(skillDir, skillName, dryRun) {
  const skillFile = path.join(skillDir, 'SKILL.md');
  if (!fs.existsSync(skillFile)) return null;

  const content = fs.readFileSync(skillFile, 'utf8');
  const parsed = parseFrontmatter(content);

  if (!parsed.frontmatter) return null;

  const intent = skillToIntent.get(skillName) || null;
  const layer = skillToLayer.get(skillName) || null;

  if (!intent && !layer) return null;

  // Check if already has these fields
  const hasIntent = parsed.fields.intent;
  const hasLayer = parsed.fields.layer;
  if (hasIntent && hasLayer) return null;

  const newFrontmatter = rebuildFrontmatter(parsed, intent, layer);
  const newContent = newFrontmatter + parsed.after;

  // Update checksum
  const checksum = crypto.createHash('sha256').update(newContent).digest('hex');
  const withChecksum = newContent.replace(/checksum:\s*[a-f0-9]+/, `checksum: ${checksum}`);

  if (!dryRun) {
    await fsp.writeFile(skillFile, withChecksum, 'utf8');
  }

  return { skillName, intent, layer, updated: true };
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  let updated = 0;
  let skipped = 0;

  console.log(`Harness metadata migration${dryRun ? ' (dry-run)' : ''}`);
  console.log('='.repeat(50));

  for (const baseDir of SKILL_DIRS) {
    if (!fs.existsSync(baseDir)) continue;

    const sourceName = path.relative(ROOT, baseDir);
    const entries = fs.readdirSync(baseDir, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const result = await processSkill(path.join(baseDir, entry.name), entry.name, dryRun);
      if (result) {
        console.log(`  ${result.skillName.padEnd(35)} intent:${(result.intent || '-').padEnd(18)} layer:${result.layer || '-'}`);
        updated += 1;
      } else {
        skipped += 1;
      }
    }
  }

  console.log(`\n${updated} skills updated, ${skipped} skipped.`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
