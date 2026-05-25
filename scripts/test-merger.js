#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Test script for skill merger functionality
 */

const {
  loadSkillsFromSource,
  detectConflicts,
  resolveConflicts,
  applyResolutions,
  generateReport,
} = require('../src/merge/skill-merger');

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const skillsPath = fs.existsSync(path.join(root, '.agent', 'skills', 'local'))
  ? path.join(root, '.agent', 'skills', 'local')
  : path.join(root, '.agent', 'skills');

console.log('Testing Skill Merger');
console.log('====================\n');

// Load skills from fork
console.log('Loading skills from fork...');
const forkSkills = loadSkillsFromSource(skillsPath, 'fork');
console.log(`Loaded ${forkSkills.length} skills\n`);

// Create a test scenario with conflicts
console.log('Creating test conflict scenario...');
const sources = [
  {
    name: 'fork',
    skills: forkSkills.slice(0, 5), // First 5 skills
  },
  {
    name: 'upstream',
    skills: forkSkills.slice(0, 3).map(skill => ({
      ...skill,
      metadata: {
        ...skill.metadata,
        version: '0.2.0', // Different version
        source: 'upstream',
      },
    })),
  },
];

console.log(`Fork: ${sources[0].skills.length} skills`);
console.log(`Upstream: ${sources[1].skills.length} skills\n`);

// Detect conflicts
console.log('Detecting conflicts...');
const conflicts = detectConflicts(sources);
console.log(`Found ${conflicts.length} conflicts\n`);

for (const conflict of conflicts) {
  console.log(`Conflict: ${conflict.name}`);
  console.log(`  Type: ${conflict.type}`);
  if (conflict.similarity) {
    console.log(`  Similarity: ${(conflict.similarity * 100).toFixed(1)}%`);
  }
  console.log(`  Versions: ${conflict.versions.length}`);
  for (const version of conflict.versions) {
    console.log(`    - ${version.sourceName}: v${version.metadata.version}`);
  }
  console.log('');
}

// Resolve conflicts
console.log('Resolving conflicts...');
const resolutions = resolveConflicts(conflicts, {
  allow_namespacing: false,
  preferences: {},
});

console.log(`Generated ${resolutions.length} resolutions\n`);

for (const resolution of resolutions) {
  console.log(`Resolution for: ${resolution.name}`);
  console.log(`  Strategy: ${resolution.resolution}`);
  if (resolution.winner) {
    console.log(`  Winner: ${resolution.winner.sourceName} (v${resolution.winner.metadata.version})`);
  }
  console.log('');
}

const exactNameResolutions = resolutions.filter((resolution) => resolution.type === 'exact_name');
const nonForkWinner = exactNameResolutions.find((resolution) => resolution.winner?.sourceName !== 'fork');
if (nonForkWinner) {
  console.error(`Expected fork/local source to win exact-name conflict: ${nonForkWinner.name}`);
  process.exit(1);
}

// Apply resolutions
console.log('Applying resolutions...');
const merged = applyResolutions(sources, resolutions);
console.log(`Merged result: ${merged.length} skills\n`);

// Generate report
console.log('Generating report...');
const report = generateReport(conflicts, resolutions);
console.log(JSON.stringify(report, null, 2));

console.log('\n✓ Test completed successfully');
