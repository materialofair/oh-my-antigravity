/* eslint-disable no-console */
const path = require('path');
const { buildComposeGraph } = require('../harness');
const intentRegistry = require('../harness/intent-registry.json');

function getRoot() {
  return path.resolve(__dirname, '..', '..');
}

async function showGraph(options = {}) {
  const graph = buildComposeGraph(getRoot());
  const targetSkill = options.skill;

  if (targetSkill) {
    if (!graph.skills.has(targetSkill)) {
      console.log(`Skill not found: ${targetSkill}`);
      return;
    }
    console.log(`Compose graph for: ${targetSkill}`);
    console.log(`  Layer: ${graph.layerIndex.get(targetSkill) || 'unknown'}`);
    console.log(`  Intent: ${graph.intentIndex.get(targetSkill) || 'none'}`);
    console.log(`  Depends on: ${graph.dependsOn(targetSkill).join(', ') || 'none'}`);
    console.log(`  Required by: ${graph.requiredBy(targetSkill).join(', ') || 'none'}`);
    console.log(`  Execution chain: ${graph.chain(targetSkill).join(' -> ')}`);
  } else {
    const stats = graph.stats();
    console.log('Skills Harness - Compose Graph');
    console.log('==============================');
    console.log(`Total skills: ${stats.totalSkills}`);
    console.log(`Total composition edges: ${stats.totalEdges}`);
    console.log(`Cycles: ${stats.cycles}`);
    console.log(`Layer violations: ${stats.violations}`);
    console.log(`Orphan skills: ${stats.orphans}`);
    console.log('');
    console.log('Layer distribution:');
    for (const [layer, count] of Object.entries(stats.layerCounts).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${layer.padEnd(15)} ${count}`);
    }
  }
}

async function showIntents() {
  console.log('Intent Registry');
  console.log('===============\n');

  for (const [intent, group] of Object.entries(intentRegistry)) {
    const variantCount = Object.keys(group.variants).length;
    console.log(`[${intent}] canonical: ${group.canonical} (${variantCount} variants)`);
    for (const [name, info] of Object.entries(group.variants)) {
      console.log(`  - ${name.padEnd(30)} [${info.source}] ${info.role}`);
    }
    console.log('');
  }
}

async function lintHarness() {
  const graph = buildComposeGraph(getRoot());
  let issues = 0;

  // Check 1: Cycles
  const cycles = graph.detectCycles();
  if (cycles.length > 0) {
    console.log(`[WARN] ${cycles.length} composition cycles detected:`);
    for (const cycle of cycles.slice(0, 5)) {
      console.log(`  ${cycle.join(' -> ')}`);
    }
    if (cycles.length > 5) console.log(`  ... and ${cycles.length - 5} more`);
    issues += cycles.length;
  }

  // Check 2: Layer violations
  const violations = graph.layerViolations();
  if (violations.length > 0) {
    console.log(`\n[ERROR] ${violations.length} layer violations:`);
    for (const v of violations) {
      console.log(`  ${v.skill} (${v.skillLayer}) -> ${v.dep} (${v.depLayer})`);
    }
    issues += violations.length;
  }

  // Check 3: Orphan skills
  const orphans = graph.orphanSkills();
  if (orphans.length > 0) {
    console.log(`\n[INFO] ${orphans.length} orphan skills (no composition edges, no intent group):`);
    console.log(`  ${orphans.join(', ')}`);
  }

  // Check 4: Skills not in layer map
  const unmapped = [];
  for (const name of graph.skills.keys()) {
    if (!graph.layerIndex.has(name)) unmapped.push(name);
  }
  if (unmapped.length > 0) {
    console.log(`\n[WARN] ${unmapped.length} skills missing from layer-map.json:`);
    console.log(`  ${unmapped.join(', ')}`);
    issues += unmapped.length;
  }

  console.log(`\nHarness lint: ${issues} issues found.`);
  return issues;
}

async function showChain(skill) {
  if (!skill) {
    console.log('Usage: oma harness chain <skill-name>');
    return;
  }
  const graph = buildComposeGraph(getRoot());
  if (!graph.skills.has(skill)) {
    console.log(`Skill not found: ${skill}`);
    return;
  }
  const chain = graph.chain(skill);
  console.log(`Execution chain for ${skill}:`);
  console.log(`  ${chain.join(' -> ')}`);
  console.log('');
  console.log('Details:');
  for (const name of chain) {
    const layer = graph.layerIndex.get(name) || '?';
    const intent = graph.intentIndex.get(name) || '-';
    console.log(`  ${name.padEnd(30)} [${layer}] intent:${intent}`);
  }
}

module.exports = { showGraph, showIntents, lintHarness, showChain };
