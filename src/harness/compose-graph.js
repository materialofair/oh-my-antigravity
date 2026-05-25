/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { loadSkillsFromSource, parseSkillMetadata } = require('../merge/skill-merger');

const intentRegistry = require('./intent-registry.json');
const layerMap = require('./layer-map.json');

// Build a reverse lookup: skill-name → layer
function buildLayerIndex() {
  const index = new Map();
  for (const [layer, skills] of Object.entries(layerMap)) {
    for (const skill of skills) {
      index.set(skill, layer);
    }
  }
  return index;
}

// Build a reverse lookup: skill-name → intent
function buildIntentIndex() {
  const index = new Map();
  for (const [intent, group] of Object.entries(intentRegistry)) {
    index.set(group.canonical, intent);
    for (const variant of Object.keys(group.variants)) {
      index.set(variant, intent);
    }
  }
  return index;
}

// Parse explicit composition declarations from SKILL.md body. Plain `$skill`
// examples are not dependencies; treating every mention as an edge creates
// cycles between alternative handoff paths.
function parseCompositionRefs(content) {
  const refs = new Set();
  const lines = String(content || '').split(/\r?\n/);
  for (const line of lines) {
    if (!/^\s*(composes?|depends on|requires|delegates to)\s*:/i.test(line)) continue;
    const dollarRefs = line.matchAll(/\$([a-z][a-z0-9-]*)/g);
    for (const m of dollarRefs) refs.add(m[1]);
  }
  return Array.from(refs);
}

// Load skills from all sources
function loadAllSkills(root) {
  const localDir = path.join(root, '.agent', 'skills', 'local');
  const upstreamDir = path.join(root, '.agent', 'skills', 'upstream');
  const skills = new Map();

  if (fs.existsSync(localDir)) {
    for (const s of loadSkillsFromSource(localDir, 'local')) {
      skills.set(s.name, s);
    }
  }

  if (fs.existsSync(upstreamDir)) {
    for (const srcDir of fs.readdirSync(upstreamDir, { withFileTypes: true })) {
      if (!srcDir.isDirectory()) continue;
      for (const s of loadSkillsFromSource(path.join(upstreamDir, srcDir.name), srcDir.name)) {
        if (!skills.has(s.name)) skills.set(s.name, s);
      }
    }
  }

  return skills;
}

function buildComposeGraph(root) {
  const skills = loadAllSkills(root);
  const layerIndex = buildLayerIndex();
  const intentIndex = buildIntentIndex();

  // adjacency: skill → Set of skills it composes/delegates to
  const edges = new Map();
  // reverse: skill → Set of skills that depend on it
  const reverseEdges = new Map();

  for (const [name, skill] of skills) {
    const deps = new Set();

    // From metadata composes field
    const composes = skill.metadata.composes;
    if (composes) {
      const list = composes.replace(/^\[|\]$/g, '').split(',').map((s) => s.trim()).filter(Boolean);
      for (const dep of list) deps.add(dep);
    }

    // From explicit composition refs in SKILL.md body
    const skillFile = path.join(skill.path, 'SKILL.md');
    if (fs.existsSync(skillFile)) {
      const content = fs.readFileSync(skillFile, 'utf8');
      for (const ref of parseCompositionRefs(content)) {
        if (ref !== name && skills.has(ref)) deps.add(ref);
      }
    }

    edges.set(name, deps);
    for (const dep of deps) {
      if (!reverseEdges.has(dep)) reverseEdges.set(dep, new Set());
      reverseEdges.get(dep).add(name);
    }
  }

  return {
    skills,
    edges,
    reverseEdges,
    layerIndex,
    intentIndex,

    dependsOn(skill) {
      return Array.from(edges.get(skill) || []);
    },

    requiredBy(skill) {
      return Array.from(reverseEdges.get(skill) || []);
    },

    chain(skill, visited = new Set()) {
      if (visited.has(skill)) return [];
      visited.add(skill);
      const deps = this.dependsOn(skill);
      const result = [];
      for (const dep of deps) {
        result.push(...this.chain(dep, visited));
      }
      result.push(skill);
      return result;
    },

    detectCycles() {
      const cycles = [];
      const visiting = new Set();
      const visited = new Set();

      const dfs = (node, path) => {
        if (visited.has(node)) return;
        if (visiting.has(node)) {
          const cycleStart = path.indexOf(node);
          cycles.push(path.slice(cycleStart).concat(node));
          return;
        }
        visiting.add(node);
        path.push(node);
        for (const dep of edges.get(node) || []) {
          dfs(dep, [...path]);
        }
        visiting.delete(node);
        visited.add(node);
      };

      for (const name of skills.keys()) dfs(name, []);
      return cycles;
    },

    layerViolations() {
      const LAYER_ORDER = ['foundation', 'quality', 'research', 'domain', 'utility', 'meta', 'orchestration'];
      const violations = [];

      for (const [skill, deps] of edges) {
        const skillLayer = layerIndex.get(skill);
        if (!skillLayer) continue;

        for (const dep of deps) {
          const depLayer = layerIndex.get(dep);
          if (!depLayer) continue;

          // Orchestration depending on orchestration is a violation
          if (skillLayer === 'orchestration' && depLayer === 'orchestration' && skill !== dep) {
            // Allow known exceptions (ralph -> ultrawork is valid composition)
            const allowedOrchPairs = new Set([
              'ralph->ultrawork', 'autopilot->ralph', 'pipeline->team', 'swarm->team',
              'ultrapilot->ultrawork', 'ralplan->team', 'ralplan->ralph', 'team->ralph',
              'start-dev->conductor',
            ]);
            if (!allowedOrchPairs.has(`${skill}->${dep}`)) {
              violations.push({ skill, dep, skillLayer, depLayer, reason: 'orchestration-to-orchestration' });
            }
          }
        }
      }

      return violations;
    },

    orphanSkills() {
      const orphans = [];
      for (const name of skills.keys()) {
        const hasInbound = reverseEdges.has(name) && reverseEdges.get(name).size > 0;
        const hasOutbound = edges.has(name) && edges.get(name).size > 0;
        const hasIntent = intentIndex.has(name);
        if (!hasInbound && !hasOutbound && !hasIntent) {
          orphans.push(name);
        }
      }
      return orphans;
    },

    stats() {
      const layerCounts = {};
      for (const [, layer] of layerIndex) {
        layerCounts[layer] = (layerCounts[layer] || 0) + 1;
      }
      const intentCounts = {};
      for (const [, intent] of intentIndex) {
        intentCounts[intent] = (intentCounts[intent] || 0) + 1;
      }
      return {
        totalSkills: skills.size,
        totalEdges: Array.from(edges.values()).reduce((sum, deps) => sum + deps.size, 0),
        layerCounts,
        intentCounts,
        cycles: this.detectCycles().length,
        violations: this.layerViolations().length,
        orphans: this.orphanSkills().length,
      };
    },
  };
}

module.exports = { buildComposeGraph, buildLayerIndex, buildIntentIndex, loadAllSkills };

// Self-test when run directly
if (require.main === module) {
  const root = path.resolve(__dirname, '..', '..');
  const graph = buildComposeGraph(root);
  const stats = graph.stats();

  console.log('Skills Harness - Compose Graph');
  console.log('==============================');
  console.log(`Total skills: ${stats.totalSkills}`);
  console.log(`Total edges: ${stats.totalEdges}`);
  console.log(`Cycles: ${stats.cycles}`);
  console.log(`Layer violations: ${stats.violations}`);
  console.log(`Orphan skills: ${stats.orphans}`);
  console.log('');
  console.log('Layer distribution:');
  for (const [layer, count] of Object.entries(stats.layerCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${layer}: ${count}`);
  }
  console.log('');
  console.log('Intent groups:');
  for (const [intent, count] of Object.entries(stats.intentCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${intent}: ${count} skills`);
  }

  const cycles = graph.detectCycles();
  if (cycles.length > 0) {
    console.log(`\nCycles detected (${cycles.length}):`);
    for (const cycle of cycles) console.log(`  ${cycle.join(' -> ')}`);
  }

  const violations = graph.layerViolations();
  if (violations.length > 0) {
    console.log(`\nLayer violations (${violations.length}):`);
    for (const v of violations) console.log(`  ${v.skill} (${v.skillLayer}) -> ${v.dep} (${v.depLayer}): ${v.reason}`);
  }

  const orphans = graph.orphanSkills();
  if (orphans.length > 0) {
    console.log(`\nOrphan skills (${orphans.length}):`);
    console.log(`  ${orphans.join(', ')}`);
  }
}
