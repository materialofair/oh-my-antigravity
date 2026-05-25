#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Multi-upstream overlap report.
 *
 * Walks .agent/skills/local/ and every .agent/skills/upstream/<name>/ and
 * reports skill-name conflicts between local and any upstream, plus
 * cross-upstream conflicts. This complements report-skill-overlap-governance.js
 * (which scans a single upstream git ref) by mirroring what the runtime
 * skill-merger actually sees on every `oma setup`.
 */

const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

const {
  loadSkillsFromSource,
  detectConflicts,
} = require('../src/merge/skill-merger');

const ROOT = path.resolve(__dirname, '..');
const LOCAL_DIR = path.join(ROOT, '.agent', 'skills', 'local');
const UPSTREAM_BASE = path.join(ROOT, '.agent', 'skills', 'upstream');
const OUT_DIR = path.join(ROOT, '.oma', 'reports');

function loadAllSources() {
  const sources = [];
  if (fs.existsSync(LOCAL_DIR)) {
    const local = loadSkillsFromSource(LOCAL_DIR, 'fork');
    sources.push({ name: 'fork', skills: local });
  }
  if (fs.existsSync(UPSTREAM_BASE)) {
    const entries = fs.readdirSync(UPSTREAM_BASE, { withFileTypes: true })
      .filter((entry) => entry.isDirectory());
    for (const entry of entries) {
      const dir = path.join(UPSTREAM_BASE, entry.name);
      const skills = loadSkillsFromSource(dir, entry.name);
      if (skills.length > 0) {
        sources.push({ name: entry.name, skills });
      }
    }
  }
  return sources;
}

function summarize(sources, conflicts) {
  const sourceSummary = sources.map((src) => ({
    source: src.name,
    skillCount: src.skills.length,
  }));

  const byPair = new Map();
  for (const conflict of conflicts) {
    const versions = conflict.versions || [];
    const sourceNames = versions.map((v) => v.source).sort();
    const pairKey = sourceNames.join(' x ');
    byPair.set(pairKey, (byPair.get(pairKey) || 0) + 1);
  }

  return {
    generatedAt: new Date().toISOString(),
    totals: {
      sources: sources.length,
      skills: sources.reduce((sum, s) => sum + s.skills.length, 0),
      conflicts: conflicts.length,
    },
    sources: sourceSummary,
    overlapByPair: Object.fromEntries(
      Array.from(byPair.entries()).sort((a, b) => b[1] - a[1])
    ),
    conflicts: conflicts.map((c) => ({
      skill: c.name,
      sources: c.versions.map((v) => ({
        source: v.source,
        version: v.version || null,
        description: v.description || null,
      })),
    })),
  };
}

function renderMarkdown(report) {
  const lines = [
    `# Multi-Upstream Overlap Report`,
    '',
    `Generated: ${report.generatedAt}`,
    '',
    `Sources: ${report.totals.sources}    Skills: ${report.totals.skills}    Conflicts: ${report.totals.conflicts}`,
    '',
    `## Source counts`,
    '',
    '| Source | Skills |',
    '|--------|--------|',
    ...report.sources.map((s) => `| ${s.source} | ${s.skillCount} |`),
    '',
    `## Overlap by source pair`,
    '',
  ];

  if (Object.keys(report.overlapByPair).length === 0) {
    lines.push('No overlaps detected.');
  } else {
    lines.push('| Pair | Conflicts |', '|------|-----------|');
    for (const [pair, count] of Object.entries(report.overlapByPair)) {
      lines.push(`| ${pair} | ${count} |`);
    }
  }

  lines.push('', `## Conflicts (${report.conflicts.length})`, '');
  if (report.conflicts.length === 0) {
    lines.push('None.');
  } else {
    for (const c of report.conflicts) {
      lines.push(`### ${c.skill}`);
      lines.push('');
      for (const v of c.sources) {
        lines.push(`- **${v.source}**${v.version ? ` v${v.version}` : ''}${v.description ? ` — ${v.description}` : ''}`);
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

async function main() {
  const sources = loadAllSources();
  const conflicts = detectConflicts(sources);
  const report = summarize(sources, conflicts);

  await fsp.mkdir(OUT_DIR, { recursive: true });
  const jsonPath = path.join(OUT_DIR, 'multi-upstream-overlap-latest.json');
  const mdPath = path.join(OUT_DIR, 'multi-upstream-overlap-latest.md');

  await fsp.writeFile(jsonPath, JSON.stringify(report, null, 2) + '\n', 'utf8');
  await fsp.writeFile(mdPath, renderMarkdown(report) + '\n', 'utf8');

  console.log(`Multi-upstream overlap: ${report.totals.conflicts} conflicts across ${report.totals.sources} sources`);
  for (const [pair, count] of Object.entries(report.overlapByPair)) {
    console.log(`  ${pair}: ${count}`);
  }
  console.log(`Reports: ${jsonPath}`);
  console.log(`Reports: ${mdPath}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
