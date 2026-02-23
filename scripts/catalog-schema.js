#!/usr/bin/env node

const REQUIRED_CORE_SKILLS = new Set([
  'autopilot',
  'ultrawork',
  'pipeline',
  'ralph',
  'plan',
  'doctor',
  'help',
]);

const REQUIRED_CORE_WORKFLOWS = new Set([
  'autopilot',
  'ultrawork',
  'pipeline',
  'ralph',
  'plan',
  'doctor',
  'help',
]);

const STATUSES = new Set(['active', 'alias', 'merged', 'deprecated', 'internal']);

function assertString(value, field) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`catalog_manifest_invalid:${field}`);
  }
}

function normalizeEntries(input, key) {
  if (!Array.isArray(input)) throw new Error(`catalog_manifest_invalid:${key}`);
  const seen = new Set();

  return input.map((entry, index) => {
    if (!entry || typeof entry !== 'object') throw new Error(`catalog_manifest_invalid:${key}[${index}]`);
    assertString(entry.name, `${key}[${index}].name`);
    const status = entry.status || 'active';
    if (!STATUSES.has(status)) {
      throw new Error(`catalog_manifest_invalid:${key}[${index}].status`);
    }
    if (seen.has(entry.name)) throw new Error(`catalog_manifest_invalid:duplicate_${key}:${entry.name}`);
    seen.add(entry.name);
    return {
      name: entry.name,
      category: entry.category || 'utility',
      status,
      canonical: typeof entry.canonical === 'string' ? entry.canonical : undefined,
      core: entry.core === true,
    };
  });
}

function validateCatalogManifest(input) {
  if (!input || typeof input !== 'object') throw new Error('catalog_manifest_invalid:root');
  const skills = normalizeEntries(input.skills, 'skills');
  const workflows = normalizeEntries(input.workflows, 'workflows');

  for (const name of REQUIRED_CORE_SKILLS) {
    const found = skills.find((item) => item.name === name && item.status === 'active');
    if (!found) throw new Error(`catalog_manifest_invalid:missing_core_skill:${name}`);
  }

  for (const name of REQUIRED_CORE_WORKFLOWS) {
    const found = workflows.find((item) => item.name === name && item.status === 'active');
    if (!found) throw new Error(`catalog_manifest_invalid:missing_core_workflow:${name}`);
  }

  return {
    schemaVersion: Number(input.schemaVersion || 1),
    catalogVersion: String(input.catalogVersion || '0.1.0'),
    skills,
    workflows,
  };
}

function summarizeCatalogCounts(manifest) {
  return {
    skillCount: manifest.skills.length,
    workflowCount: manifest.workflows.length,
    activeSkillCount: manifest.skills.filter((item) => item.status === 'active').length,
    activeWorkflowCount: manifest.workflows.filter((item) => item.status === 'active').length,
  };
}

module.exports = {
  validateCatalogManifest,
  summarizeCatalogCounts,
};
