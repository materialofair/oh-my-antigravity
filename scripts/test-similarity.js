#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Test description similarity detection
 */

const {
  detectConflicts,
  resolveConflicts,
  generateReport,
} = require('../src/merge/skill-merger');

console.log('Testing Description Similarity Detection');
console.log('=========================================\n');

// Create test skills with similar descriptions
const sources = [
  {
    name: 'fork',
    skills: [
      {
        name: 'skill-a',
        path: '/fake/path/skill-a',
        metadata: {
          name: 'skill-a',
          description: 'This is a test skill for automated code generation and testing',
          version: '1.0.0',
          source: 'fork',
        },
      },
      {
        name: 'skill-b',
        path: '/fake/path/skill-b',
        metadata: {
          name: 'skill-b',
          description: 'Completely different functionality for data processing',
          version: '1.0.0',
          source: 'fork',
        },
      },
    ],
  },
  {
    name: 'upstream',
    skills: [
      {
        name: 'skill-c',
        path: '/fake/path/skill-c',
        metadata: {
          name: 'skill-c',
          description: 'This is a test skill for automated code generation and testing workflows',
          version: '1.0.0',
          source: 'upstream',
        },
      },
    ],
  },
];

console.log('Test scenario:');
console.log('- skill-a (fork): "automated code generation and testing"');
console.log('- skill-b (fork): "data processing" (different)');
console.log('- skill-c (upstream): "automated code generation and testing workflows" (similar to skill-a)\n');

// Detect conflicts
const conflicts = detectConflicts(sources);

console.log(`Found ${conflicts.length} conflicts:\n`);

for (const conflict of conflicts) {
  console.log(`Conflict: ${conflict.name}`);
  console.log(`  Type: ${conflict.type}`);
  if (conflict.similarity) {
    console.log(`  Similarity: ${(conflict.similarity * 100).toFixed(1)}%`);
  }
  if (conflict.versions) {
    for (const version of conflict.versions) {
      console.log(`    - ${version.name} (${version.sourceName}): "${version.metadata.description}"`);
    }
  }
  console.log('');
}

// Resolve conflicts
const resolutions = resolveConflicts(conflicts, {});

console.log('Resolutions:');
for (const resolution of resolutions) {
  console.log(`  ${resolution.name}: ${resolution.resolution}`);
  if (resolution.message) {
    console.log(`    ${resolution.message}`);
  }
}

// Generate report
const report = generateReport(conflicts, resolutions);
console.log('\nReport summary:');
console.log(`  Total conflicts: ${report.summary.total_conflicts}`);
console.log(`  Exact name conflicts: ${report.summary.exact_name_conflicts}`);
console.log(`  Similar description warnings: ${report.summary.similar_description_warnings}`);

console.log('\n✓ Test completed successfully');
