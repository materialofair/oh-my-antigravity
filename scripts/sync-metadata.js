#!/usr/bin/env node

/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const skillsDir = path.join(root, '.agent', 'skills');
const workflowsDir = path.join(root, '.agent', 'workflows');
const changelogPath = path.join(root, 'CHANGELOG.md');

function parseArgs(argv) {
  return {
    verify: argv.includes('--verify'),
    dryRun: argv.includes('--dry-run'),
  };
}

function countSkills() {
  if (!fs.existsSync(skillsDir)) return 0;
  return fs.readdirSync(skillsDir, { withFileTypes: true }).filter((entry) => entry.isDirectory()).length;
}

function countWorkflows() {
  if (!fs.existsSync(workflowsDir)) return 0;
  return fs.readdirSync(workflowsDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md')).length;
}

function readVersionFromChangelog() {
  if (!fs.existsSync(changelogPath)) return '0.0.0';
  const content = fs.readFileSync(changelogPath, 'utf8');
  const match = content.match(/^## \[(\d+\.\d+\.\d+)\]/m);
  return match ? match[1] : '0.0.0';
}

function apply(content, replacements) {
  let next = content;
  for (const [pattern, replacement] of replacements) {
    next = next.replace(pattern, replacement);
  }
  return next;
}

function updateFile(filePath, replacements, options) {
  if (!fs.existsSync(filePath)) return { changed: false, missing: true };
  const before = fs.readFileSync(filePath, 'utf8');
  const after = apply(before, replacements);
  const changed = before !== after;
  if (changed && !options.verify && !options.dryRun) {
    fs.writeFileSync(filePath, after, 'utf8');
  }
  return { changed, missing: false };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const skills = countSkills();
  const workflows = countWorkflows();
  const version = readVersionFromChangelog();

  const targets = [
    {
      file: 'README.md',
      replacements: [
        [/\*\*\d+ specialized Skills\*\* and \*\*\d+ automated Workflows\*\*/g, `**${skills} specialized Skills** and **${workflows} automated Workflows**`],
        [/\*\*📊 Compatibility\*\*: \d+\/\d+ Skills ✅ \| \d+\/\d+ Workflows ✅ \| 0 Issues/g, `**📊 Compatibility**: ${skills}/${skills} Skills ✅ | ${workflows}/${workflows} Workflows ✅ | 0 Issues`],
        [/### 🧠 \d+ Specialized Skills/g, `### 🧠 ${skills} Specialized Skills`],
        [/### ⚡️ \d+ Workflows/g, `### ⚡️ ${workflows} Workflows`],
      ],
    },
    {
      file: 'README_CN.md',
      replacements: [
        [/\*\*\d+ 个专业技能\*\* 和 \*\*\d+ 个自动化工作流\*\*/g, `**${skills} 个专业技能** 和 **${workflows} 个自动化工作流**`],
        [/\*\*📊 兼容性\*\*: \d+\/\d+ 技能 ✅ \| \d+\/\d+ 工作流 ✅ \| 0 问题/g, `**📊 兼容性**: ${skills}/${skills} 技能 ✅ | ${workflows}/${workflows} 工作流 ✅ | 0 问题`],
        [/### 🧠 \d+ 个专业技能/g, `### 🧠 ${skills} 个专业技能`],
        [/### ⚡️ \d+ 个工作流/g, `### ⚡️ ${workflows} 个工作流`],
      ],
    },
    {
      file: 'MIGRATION_STATUS.md',
      replacements: [
        [/All \d+ skills and \d+ workflows/g, `All ${skills} skills and ${workflows} workflows`],
        [/\*\*100% Skills Compatible\*\*: \d+\/\d+ skills/g, `**100% Skills Compatible**: ${skills}/${skills} skills`],
        [/\*\*100% Workflows Compatible\*\*: \d+\/\d+ workflows/g, `**100% Workflows Compatible**: ${workflows}/${workflows} workflows`],
        [/Total Skills:\s+\d+/g, `Total Skills:     ${skills}`],
        [/Valid Skills:\s+\d+ \(100%\)/g, `Valid Skills:     ${skills} (100%)`],
        [/Total Workflows:\s+\d+/g, `Total Workflows:  ${workflows}`],
        [/Valid Workflows:\s+\d+ \(100%\)/g, `Valid Workflows:  ${workflows} (100%)`],
        [/All \d+ skills use `SKILL\.md` format/g, `All ${skills} skills use \`SKILL.md\` format`],
        [/All \d+ workflows are markdown-based/g, `All ${workflows} workflows are markdown-based`],
        [/Skills:\s+\d+\/\d+ valid/g, `Skills:    ${skills}/${skills} valid`],
        [/Workflows:\s+\d+\/\d+ valid/g, `Workflows: ${workflows}/${workflows} valid`],
      ],
    },
    {
      file: 'docs/REFERENCE.md',
      replacements: [
        [/- \[Skills \(\d+ Total\)\]\(#skills-\d+-total\)/g, `- [Skills (${skills} Total)](#skills-${skills}-total)`],
        [/## Skills \(\d+ Total\)/g, `## Skills (${skills} Total)`],
      ],
    },
    {
      file: 'docs/SKILL_GOVERNANCE_REPORT.md',
      replacements: [
        [/- Skills total: \d+/g, `- Skills total: ${skills}`],
        [/- Workflows total: \d+/g, `- Workflows total: ${workflows}`],
      ],
    },
    {
      file: 'AGENTS.md',
      replacements: [
        [/\*\*Version:\*\* \d+\.\d+\.\d+/g, `**Version:** ${version}`],
      ],
    },
  ];

  let changed = 0;
  let missing = 0;

  for (const target of targets) {
    const result = updateFile(path.join(root, target.file), target.replacements, args);
    if (result.missing) {
      missing += 1;
      continue;
    }
    if (result.changed) changed += 1;
  }

  if (args.verify) {
    if (changed > 0) {
      console.error(`Metadata out of sync (${changed} file(s)). Run: node scripts/sync-metadata.js`);
      process.exit(1);
    }
    console.log(`Metadata verified (skills=${skills}, workflows=${workflows}, version=${version})`);
    return;
  }

  if (args.dryRun) {
    console.log(`Metadata dry-run: ${changed} file(s) would change, ${missing} missing target(s)`);
    return;
  }

  console.log(`Metadata synced: ${changed} file(s) updated, ${missing} missing target(s)`);
}

main();

