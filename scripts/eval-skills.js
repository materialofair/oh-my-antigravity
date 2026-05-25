#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const {
  detectSkillsDir,
  listSkillArtifacts,
  readArtifactBundle,
} = require('./lib/skill-artifacts');

function parseArgs(argv) {
  const result = {
    skillsDir: '',
    outDir: '',
    minScore: 70,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--skills-dir' && argv[i + 1]) {
      result.skillsDir = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg.startsWith('--skills-dir=')) {
      result.skillsDir = arg.slice('--skills-dir='.length);
      continue;
    }
    if (arg === '--out-dir' && argv[i + 1]) {
      result.outDir = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg.startsWith('--out-dir=')) {
      result.outDir = arg.slice('--out-dir='.length);
      continue;
    }
    if (arg === '--min-score' && argv[i + 1]) {
      result.minScore = Number(argv[i + 1]) || result.minScore;
      i += 1;
      continue;
    }
    if (arg.startsWith('--min-score=')) {
      result.minScore = Number(arg.slice('--min-score='.length)) || result.minScore;
    }
  }

  return result;
}

function detectOutDir(root, explicit) {
  return explicit ? path.resolve(explicit) : path.join(root, '.oma', 'reports');
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return null;
  const lines = match[1].split('\n');
  const map = {};
  for (const line of lines) {
    const idx = line.indexOf(':');
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    map[key] = value;
  }
  return map;
}

function hasCodeFence(content) {
  return content.includes('```');
}

function evaluateSkill(name, content) {
  const findings = [];
  let score = 100;
  const frontmatter = parseFrontmatter(content);

  if (!frontmatter) {
    score -= 40;
    findings.push('missing frontmatter');
  } else {
    if (!frontmatter.name) {
      score -= 20;
      findings.push('frontmatter.name missing');
    }
    if (!frontmatter.description) {
      score -= 20;
      findings.push('frontmatter.description missing');
    }
  }

  if (!/\$[\w-]+|[a-z-]+:\s+/i.test(content)) {
    score -= 15;
    findings.push('missing codex invocation example');
  }

  if (!/usage|when to use|instructions|workflow|步骤|用法/i.test(content)) {
    score -= 10;
    findings.push('missing workflow guidance sections');
  }

  if (!hasCodeFence(content)) {
    score -= 8;
    findings.push('missing runnable examples');
  }

  if (/\bTask\s*\(/.test(content)) {
    score -= 12;
    findings.push('contains legacy Task(...) syntax');
  }

  if (/cc\s+--plugin-dir|\/plugin|HUD/i.test(content)) {
    score -= 12;
    findings.push('contains non-codex runtime reference');
  }

  if (/\betc\.\b|\bmaybe\b|\bif possible\b/i.test(content)) {
    score -= 4;
    findings.push('contains ambiguous instruction wording');
  }

  score = Math.max(0, Math.min(100, score));
  return {
    skill: name,
    score,
    findings,
    pass: score >= 70,
  };
}

function renderMarkdownReport(summary) {
  const lines = [];
  lines.push('# Skill Eval Report');
  lines.push('');
  lines.push(`Generated At: ${summary.generatedAt}`);
  lines.push(`Skills Evaluated: ${summary.total}`);
  lines.push(`Average Score: ${summary.averageScore}`);
  lines.push(`Pass: ${summary.passCount}`);
  lines.push(`Fail: ${summary.failCount}`);
  lines.push('');
  lines.push('| Skill | Score | Pass | Findings |');
  lines.push('|---|---:|:---:|---|');

  for (const row of summary.results) {
    lines.push(`| ${row.skill} | ${row.score} | ${row.pass ? 'Y' : 'N'} | ${row.findings.join('; ') || '-'} |`);
  }

  return `${lines.join('\n')}\n`;
}

async function main() {
  const root = path.resolve(__dirname, '..');
  const args = parseArgs(process.argv.slice(2));
  const skillsDir = detectSkillsDir(root, args.skillsDir);
  const outDir = detectOutDir(root, args.outDir);
  const minScore = Math.max(1, Number(args.minScore) || 70);

  const skills = await listSkillArtifacts(skillsDir);
  const results = [];
  for (const item of skills) {
    const content = await readArtifactBundle(item);
    const score = evaluateSkill(item.name, content);
    score.auditedFiles = item.files.map((file) => path.relative(item.dir, file));
    results.push(score);
  }

  const average = results.length === 0
    ? 0
    : Number((results.reduce((sum, item) => sum + item.score, 0) / results.length).toFixed(2));
  const passCount = results.filter((item) => item.score >= minScore).length;
  const failCount = results.length - passCount;
  const summary = {
    generatedAt: new Date().toISOString(),
    skillsDir,
    minScore,
    total: results.length,
    averageScore: average,
    passCount,
    failCount,
    results,
  };

  await fsp.mkdir(outDir, { recursive: true });
  const jsonPath = path.join(outDir, 'skill-eval-latest.json');
  const mdPath = path.join(outDir, 'skill-eval-latest.md');
  await fsp.writeFile(jsonPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
  await fsp.writeFile(mdPath, renderMarkdownReport(summary), 'utf8');

  console.log(`Skill eval completed: ${summary.total} skills, avg=${summary.averageScore}, fail=${summary.failCount}`);
  console.log(`Reports: ${jsonPath}`);
  console.log(`Reports: ${mdPath}`);

  if (summary.failCount > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
