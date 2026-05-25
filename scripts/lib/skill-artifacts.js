const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

function detectSkillsDir(root, explicit) {
  if (explicit) return path.resolve(explicit);
  const candidates = [
    path.join(root, '.agent', 'skills', 'local'),
    path.join(root, '.agent', 'skills'),
    path.join(root, '.codex', 'skills'),
  ];
  return candidates.find((dir) => fs.existsSync(dir)) || candidates[0];
}

async function walk(dir, predicate, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  const entries = await fsp.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath, predicate, acc);
      continue;
    }
    if (entry.isFile() && predicate(fullPath)) {
      acc.push(fullPath);
    }
  }
  return acc;
}

async function listSkillArtifacts(skillsDir) {
  if (!fs.existsSync(skillsDir)) return [];

  const entries = await fsp.readdir(skillsDir, { withFileTypes: true });
  const skills = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const dir = path.join(skillsDir, entry.name);
    const files = [];
    const skillDoc = path.join(dir, 'SKILL.md');

    if (fs.existsSync(skillDoc)) files.push(skillDoc);

    const commandFiles = await walk(
      path.join(dir, 'commands'),
      (file) => file.endsWith('.toml'),
    );

    commandFiles.sort((a, b) => a.localeCompare(b));
    files.push(...commandFiles);

    const workflowTemplate = path.join(dir, 'templates', 'workflow.md');
    if (fs.existsSync(workflowTemplate)) files.push(workflowTemplate);

    const currentTemplate = path.join(dir, 'templates', 'current.md');
    if (fs.existsSync(currentTemplate)) files.push(currentTemplate);

    const ruleFiles = await walk(
      path.join(dir, 'templates', 'rules'),
      (file) => file.endsWith('.md'),
    );
    ruleFiles.sort((a, b) => a.localeCompare(b));
    files.push(...ruleFiles);

    if (files.length === 0) continue;
    skills.push({ name: entry.name, dir, files });
  }

  skills.sort((a, b) => a.name.localeCompare(b.name));
  return skills;
}

async function readArtifactBundle(skill, options = {}) {
  const maxCharsPerFile = Number(options.maxCharsPerFile) || 0;
  const parts = [];

  for (const file of skill.files) {
    let content = await fsp.readFile(file, 'utf8');
    if (maxCharsPerFile > 0 && content.length > maxCharsPerFile) {
      content = `${content.slice(0, maxCharsPerFile)}\n...[truncated]`;
    }
    const relative = path.relative(skill.dir, file);
    if (relative === 'SKILL.md' && parts.length === 0) {
      parts.push(content);
      continue;
    }
    parts.push(`===== FILE: ${relative} =====\n${content}`);
  }

  return parts.join('\n\n');
}

module.exports = {
  detectSkillsDir,
  listSkillArtifacts,
  readArtifactBundle,
};
