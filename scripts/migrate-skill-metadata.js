#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Skill Metadata Migration Script
 *
 * Scans all skills in .agent/skills/local/ and ensures they have complete metadata.
 * Adds missing fields: version, source, checksum, updated_at
 */

const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

const SKILLS_DIR = path.join(__dirname, '..', '.agent', 'skills', 'local');
const DEFAULT_VERSION = '0.1.0';
const DEFAULT_SOURCE = 'fork';

/**
 * Calculate SHA-256 checksum of file content
 */
function calculateChecksum(content) {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

/**
 * Get file modification time from git or filesystem
 */
function getFileTimestamp(filePath) {
  try {
    // Try git log first
    const gitDate = execSync(
      `git log -1 --format=%cI -- "${filePath}"`,
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }
    ).trim();

    if (gitDate) {
      return gitDate;
    }
  } catch (err) {
    // Git failed, fall back to filesystem
  }

  // Fallback to filesystem mtime
  const stats = fs.statSync(filePath);
  return stats.mtime.toISOString();
}

/**
 * Parse frontmatter from SKILL.md
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    return { frontmatter: {}, body: content, hasFrontmatter: false };
  }

  const frontmatterText = match[1];
  const body = content.slice(match[0].length);
  const frontmatter = {};

  // Parse YAML-like frontmatter
  frontmatterText.split('\n').forEach((line) => {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) return;

    const key = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim();
    frontmatter[key] = value;
  });

  return { frontmatter, body, hasFrontmatter: true };
}

/**
 * Serialize frontmatter to YAML format
 */
function serializeFrontmatter(metadata) {
  const lines = Object.entries(metadata).map(([key, value]) => `${key}: ${value}`);
  return `---\n${lines.join('\n')}\n---`;
}

/**
 * Migrate a single skill file
 */
async function migrateSkill(skillPath) {
  const skillFile = path.join(skillPath, 'SKILL.md');

  if (!fs.existsSync(skillFile)) {
    return { status: 'skip', reason: 'no SKILL.md' };
  }

  const content = await fsp.readFile(skillFile, 'utf8');
  const { frontmatter, body, hasFrontmatter } = parseFrontmatter(content);

  // Check if migration needed
  const needsMigration = !frontmatter.version || !frontmatter.source ||
                         !frontmatter.checksum || !frontmatter.updated_at;

  if (!needsMigration) {
    return { status: 'skip', reason: 'already complete' };
  }

  // Add missing fields
  const updated = { ...frontmatter };

  if (!updated.version) {
    updated.version = DEFAULT_VERSION;
  }

  if (!updated.source) {
    updated.source = DEFAULT_SOURCE;
  }

  if (!updated.checksum) {
    updated.checksum = calculateChecksum(content);
  }

  if (!updated.updated_at) {
    updated.updated_at = getFileTimestamp(skillFile);
  }

  // Write back
  const newContent = `${serializeFrontmatter(updated)}\n${body}`;
  await fsp.writeFile(skillFile, newContent, 'utf8');

  return { status: 'migrated', fields: Object.keys(updated).filter(k => !frontmatter[k]) };
}

/**
 * Main migration function
 */
async function migrate(options = {}) {
  const dryRun = options.dryRun || false;

  console.log('Skill Metadata Migration');
  console.log('========================');
  console.log(`Skills directory: ${SKILLS_DIR}`);
  console.log(`Dry run: ${dryRun}\n`);

  if (!fs.existsSync(SKILLS_DIR)) {
    console.error(`Error: Skills directory not found: ${SKILLS_DIR}`);
    process.exit(1);
  }

  const skillDirs = await fsp.readdir(SKILLS_DIR, { withFileTypes: true });
  const results = {
    total: 0,
    migrated: 0,
    skipped: 0,
    errors: 0,
    details: [],
  };

  for (const entry of skillDirs) {
    if (!entry.isDirectory()) continue;

    const skillPath = path.join(SKILLS_DIR, entry.name);
    results.total += 1;

    try {
      const result = await migrateSkill(skillPath);

      if (result.status === 'migrated') {
        results.migrated += 1;
        console.log(`✓ ${entry.name}: migrated (added: ${result.fields.join(', ')})`);
      } else {
        results.skipped += 1;
        if (options.verbose) {
          console.log(`- ${entry.name}: ${result.reason}`);
        }
      }

      results.details.push({ skill: entry.name, ...result });
    } catch (err) {
      results.errors += 1;
      console.error(`✗ ${entry.name}: ${err.message}`);
      results.details.push({ skill: entry.name, status: 'error', error: err.message });
    }
  }

  console.log('\nMigration Summary');
  console.log('=================');
  console.log(`Total skills: ${results.total}`);
  console.log(`Migrated: ${results.migrated}`);
  console.log(`Skipped: ${results.skipped}`);
  console.log(`Errors: ${results.errors}`);

  return results;
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose') || args.includes('-v'),
  };

  migrate(options)
    .then((results) => {
      process.exit(results.errors > 0 ? 1 : 0);
    })
    .catch((err) => {
      console.error('Fatal error:', err);
      process.exit(1);
    });
}

module.exports = { migrate, migrateSkill };


