#!/usr/bin/env node
/* eslint-disable no-console */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  buildSkillIndex,
  getDefaultSkillIndexPath,
  isSkillIndexFresh,
  readSkillIndex,
  writeSkillIndex,
} = require('../src/catalog/skill-index');
const { routeTaskToSkills } = require('../src/router/skill-router');

function writeSkill(root, sourcePath, name, frontmatter, body) {
  const skillDir = path.join(root, sourcePath, name);
  fs.mkdirSync(skillDir, { recursive: true });
  const lines = ['---'];
  for (const [key, value] of Object.entries(frontmatter)) {
    lines.push(`${key}: ${value}`);
  }
  lines.push('---', '', body);
  fs.writeFileSync(path.join(skillDir, 'SKILL.md'), `${lines.join('\n')}\n`, 'utf8');
}

function main() {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'oma-skill-index-'));

  writeSkill(
    tmpRoot,
    path.join('.agent', 'skills', 'local'),
    'alpha-auth',
    {
      name: 'alpha-auth',
      description: 'Use when optimizing authentication login flows and token refresh prompts',
      version: '1.2.3',
      origin: 'local',
      intent: 'debugging',
      layer: 'quality',
      tags: '[auth, login, token]',
    },
    'SECRET_BODY_SHOULD_NOT_BE_CACHED local body text',
  );

  writeSkill(
    tmpRoot,
    path.join('.agent', 'skills', 'upstream', 'vendor'),
    'alpha-auth',
    {
      name: 'alpha-auth',
      description: 'Upstream copy that should lose to local',
      version: '9.9.9',
      origin: 'vendor',
    },
    'SECRET_BODY_SHOULD_NOT_BE_CACHED upstream duplicate',
  );

  writeSkill(
    tmpRoot,
    path.join('.agent', 'skills', 'upstream', 'vendor'),
    'beta-review',
    {
      name: 'beta-review',
      description: 'Use when reviewing code quality and security sensitive diffs',
      version: '0.5.0',
      origin: 'vendor',
      intent: 'code-review',
      layer: 'quality',
    },
    'SECRET_BODY_SHOULD_NOT_BE_CACHED beta body text',
  );

  const index = buildSkillIndex(tmpRoot, { generatedAt: '2026-05-13T00:00:00.000Z' });
  assert.strictEqual(index.schemaVersion, 1);
  assert.strictEqual(index.skills.length, 2);
  assert.strictEqual(index.counts.skillCount, 2);

  const alpha = index.skills.find((skill) => skill.name === 'alpha-auth');
  assert(alpha, 'alpha-auth should be indexed');
  assert.strictEqual(alpha.source, 'local');
  assert.strictEqual(alpha.version, '1.2.3');
  assert.strictEqual(alpha.intent, 'debugging');
  assert.strictEqual(alpha.layer, 'quality');
  assert(alpha.descriptionTokens.includes('authentication'));
  assert(alpha.tags.includes('auth'));
  assert(alpha.path.endsWith(path.join('.agent', 'skills', 'local', 'alpha-auth')));
  assert(alpha.skillFile.endsWith(path.join('.agent', 'skills', 'local', 'alpha-auth', 'SKILL.md')));
  assert(alpha.bodyHash, 'bodyHash should exist for freshness checks');
  assert(alpha.frontmatterHash, 'frontmatterHash should exist for metadata checks');

  const serialized = JSON.stringify(index);
  assert(!serialized.includes('SECRET_BODY_SHOULD_NOT_BE_CACHED'), 'index must not cache skill bodies');
  assert(!serialized.includes('Upstream copy that should lose to local'), 'local skill should override upstream duplicate');

  const outFile = getDefaultSkillIndexPath(tmpRoot);
  writeSkillIndex(tmpRoot, index, { outFile });
  assert(fs.existsSync(outFile), 'writeSkillIndex should create default cache file');

  const readBack = readSkillIndex(tmpRoot, { indexPath: outFile });
  assert.strictEqual(readBack.skills.length, 2);
  assert.strictEqual(isSkillIndexFresh(tmpRoot, readBack), true);

  const staleCatalogDir = path.join(tmpRoot, 'templates');
  fs.mkdirSync(staleCatalogDir, { recursive: true });
  fs.writeFileSync(path.join(staleCatalogDir, 'catalog-manifest.json'), `${JSON.stringify({
    schemaVersion: 1,
    catalogVersion: 'stale-test',
    skills: ['autopilot', 'ralph', 'ultrawork', 'swarm', 'plan'].map((name) => ({
      name,
      status: 'active',
      core: true,
    })),
    agents: [],
  }, null, 2)}\n`, 'utf8');

  const routed = routeTaskToSkills('optimize token refresh login prompt', {
    root: tmpRoot,
    limit: 1,
  });
  assert.strictEqual(routed.recommendations[0].skill, 'alpha-auth');
  assert.match(routed.recommendations[0].rationale, /skill-index/);

  const alphaFile = path.join(tmpRoot, '.agent', 'skills', 'local', 'alpha-auth', 'SKILL.md');
  fs.appendFileSync(alphaFile, '\nNew line that invalidates the cache.\n', 'utf8');
  assert.strictEqual(isSkillIndexFresh(tmpRoot, readBack), false);

  console.log('Skill index tests passed.');
}

main();
