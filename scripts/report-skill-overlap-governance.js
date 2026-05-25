#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const { spawnSync } = require('child_process');

function parseArgs(argv) {
  const result = {
    upstreamRef: 'upstream/main',
    localSkillsDir: '',
    upstreamSkillsDir: 'skills',
    outDir: '',
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--upstream-ref' && argv[i + 1]) {
      result.upstreamRef = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg.startsWith('--upstream-ref=')) {
      result.upstreamRef = arg.slice('--upstream-ref='.length);
      continue;
    }
    if (arg === '--local-skills-dir' && argv[i + 1]) {
      result.localSkillsDir = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg.startsWith('--local-skills-dir=')) {
      result.localSkillsDir = arg.slice('--local-skills-dir='.length);
      continue;
    }
    if (arg === '--upstream-skills-dir' && argv[i + 1]) {
      result.upstreamSkillsDir = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg.startsWith('--upstream-skills-dir=')) {
      result.upstreamSkillsDir = arg.slice('--upstream-skills-dir='.length);
      continue;
    }
    if (arg === '--out-dir' && argv[i + 1]) {
      result.outDir = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg.startsWith('--out-dir=')) {
      result.outDir = arg.slice('--out-dir='.length);
    }
  }

  return result;
}

function readFileIfExists(file) {
  if (!fs.existsSync(file)) return null;
  return fs.readFileSync(file, 'utf8');
}

function parseFrontmatter(content = '', fallbackName = '') {
  const nameMatch = content.match(/^name:\s*"?([^"\n]+)"?\s*$/m);
  const descMatch = content.match(/^description:\s*"?([^"\n]+)"?\s*$/m);
  return {
    name: nameMatch ? nameMatch[1].trim() : fallbackName,
    description: descMatch ? descMatch[1].trim() : '',
  };
}

function evaluateContentQuality(content) {
  const signals = [];
  let score = 100;

  if (!/^---\n[\s\S]*?\n---\n?/m.test(content)) {
    score -= 30;
    signals.push('missing_frontmatter');
  }
  if (!/name:\s*[^\n]+/.test(content)) {
    score -= 15;
    signals.push('missing_name');
  }
  if (!/description:\s*[^\n]+/.test(content)) {
    score -= 15;
    signals.push('missing_description');
  }
  if (/(?:`|^\s*)\/[a-z][a-z-]*(?=(?:\s|`|:|$))/m.test(content)) {
    score -= 30;
    signals.push('legacy_slash_command');
  }
  if (/\bTask\s*\(|\bdelegate\s*\(/.test(content)) {
    score -= 20;
    signals.push('legacy_delegate_or_task_api');
  }
  if (/cc\s+--plugin-dir|\/plugin|HUD|omx_state/.test(content)) {
    score -= 20;
    signals.push('non_codex_runtime_reference');
  }
  if (!/\$[\w-]+|[a-z-]+:\s+[^\n]+/i.test(content)) {
    score -= 8;
    signals.push('missing_codex_invocation');
  }
  if (!/usage|when to use|instructions|workflow|步骤|用法/i.test(content)) {
    score -= 8;
    signals.push('missing_structure');
  }

  score = Math.max(0, Math.min(100, score));
  return { score, signals };
}

function listLocalSkills(localSkillsDir) {
  if (!fs.existsSync(localSkillsDir)) return [];
  const entries = fs.readdirSync(localSkillsDir, { withFileTypes: true });
  const skills = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const skillDoc = path.join(localSkillsDir, entry.name, 'SKILL.md');
    if (!fs.existsSync(skillDoc)) continue;
    const content = fs.readFileSync(skillDoc, 'utf8');
    const fm = parseFrontmatter(content, entry.name);
    const quality = evaluateContentQuality(content);
    skills.push({
      name: fm.name || entry.name,
      key: entry.name,
      description: fm.description,
      path: skillDoc,
      quality,
    });
  }
  skills.sort((a, b) => a.key.localeCompare(b.key));
  return skills;
}

function gitReadText(refPath) {
  const result = spawnSync('git', ['show', refPath], { encoding: 'utf8' });
  if (result.status !== 0) return null;
  return result.stdout;
}

function listUpstreamSkills(upstreamRef, upstreamSkillsDir) {
  const list = spawnSync('git', ['ls-tree', '-r', '--name-only', upstreamRef, upstreamSkillsDir], { encoding: 'utf8' });
  if (list.status !== 0) {
    throw new Error(`Failed to list upstream skills from ${upstreamRef}:${upstreamSkillsDir}`);
  }

  const files = list.stdout
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.endsWith('/SKILL.md'));

  const skills = [];
  for (const rel of files) {
    const content = gitReadText(`${upstreamRef}:${rel}`) || '';
    const key = rel.replace(/\/SKILL\.md$/, '').split('/').pop();
    const fm = parseFrontmatter(content, key);
    const hasLegacySlash = /(?:`|^\s*)\/[a-z][a-z-]*(?=(?:\s|`|:|$))/m.test(content);
    const quality = evaluateContentQuality(content);
    skills.push({
      name: fm.name || key,
      key,
      description: fm.description,
      path: rel,
      hasLegacySlash,
      quality,
    });
  }

  skills.sort((a, b) => a.key.localeCompare(b.key));
  return skills;
}

function buildIssueMap(root) {
  const map = new Map();
  const llmPath = path.join(root, '.oma', 'reports', 'skill-governance-sources', 'upstream', 'skill-llm-governance-latest.json');
  const llm = readFileIfExists(llmPath);
  if (llm) {
    const data = JSON.parse(llm);
    for (const row of data.results || []) {
      if (!map.has(row.skill)) map.set(row.skill, new Set());
      for (const issue of row.issues || []) {
        if (issue.severity === 'high') map.get(row.skill).add(`high:${issue.rule}`);
        if (issue.rule === 'missing_structure') map.get(row.skill).add('medium:missing_structure');
      }
    }
  }

  return map;
}

function decideAction(issueSet) {
  const { forkScore, upstreamScore } = issueSet;
  if (forkScore === upstreamScore) return { decision: 'prefer-fork', reason: 'quality_tie_default_fork' };
  if (forkScore > upstreamScore) return { decision: 'prefer-fork', reason: 'fork_quality_higher' };
  return { decision: 'prefer-upstream', reason: 'upstream_quality_higher' };
}

function renderMarkdown(report) {
  const lines = [];
  lines.push('# Skill Overlap Governance Report');
  lines.push('');
  lines.push(`Generated At: ${report.generatedAt}`);
  lines.push(`Upstream Ref: ${report.upstreamRef}`);
  lines.push(`Local Skills: ${report.counts.local}`);
  lines.push(`Upstream Skills: ${report.counts.upstream}`);
  lines.push(`Exact Overlap: ${report.counts.overlap}`);
  lines.push('');
  lines.push('| Skill | Fork Score | Upstream Score | Upstream Issues | Decision | Reason |');
  lines.push('|---|---:|---:|---|---|---|');
  for (const row of report.overlap) {
    const issues = row.upstreamIssues.length > 0 ? row.upstreamIssues.join(', ') : '-';
    lines.push(`| ${row.skill} | ${row.forkScore} | ${row.upstreamScore} | ${issues} | ${row.decision} | ${row.reason} |`);
  }
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- prefer-fork: ${report.summary.preferFork}`);
  lines.push(`- prefer-upstream: ${report.summary.preferUpstream}`);
  return `${lines.join('\n')}\n`;
}

async function main() {
  const root = path.resolve(__dirname, '..');
  const args = parseArgs(process.argv.slice(2));
  const localSkillsDir = args.localSkillsDir
    ? path.resolve(args.localSkillsDir)
    : fs.existsSync(path.join(root, '.agent', 'skills', 'local'))
      ? path.join(root, '.agent', 'skills', 'local')
      : path.join(root, '.agent', 'skills');
  const outDir = args.outDir
    ? path.resolve(args.outDir)
    : path.join(root, '.oma', 'reports');

  const localSkills = listLocalSkills(localSkillsDir);
  const upstreamSkills = listUpstreamSkills(args.upstreamRef, args.upstreamSkillsDir);
  const issues = buildIssueMap(root);

  const localByName = new Map(localSkills.map((item) => [item.name, item]));
  const upstreamByName = new Map(upstreamSkills.map((item) => [item.name, item]));
  const overlapNames = Array.from(localByName.keys())
    .filter((name) => upstreamByName.has(name))
    .sort((a, b) => a.localeCompare(b));

  const overlap = overlapNames.map((name) => {
    const localSkill = localByName.get(name);
    const upstreamSkill = upstreamByName.get(name);
    const rowIssues = new Set(issues.get(name) || []);
    if (upstreamSkill.hasLegacySlash) rowIssues.add('blocker:legacy_slash_command');
    const action = decideAction({
      forkScore: localSkill.quality.score,
      upstreamScore: upstreamSkill.quality.score,
    });
    return {
      skill: name,
      localPath: path.relative(root, localSkill.path),
      upstreamPath: upstreamSkill.path,
      upstreamIssues: Array.from(rowIssues).sort(),
      forkScore: localSkill.quality.score,
      upstreamScore: upstreamSkill.quality.score,
      decision: action.decision,
      reason: action.reason,
    };
  });

  const summary = {
    preferFork: overlap.filter((x) => x.decision === 'prefer-fork').length,
    preferUpstream: overlap.filter((x) => x.decision === 'prefer-upstream').length,
  };

  const report = {
    generatedAt: new Date().toISOString(),
    upstreamRef: args.upstreamRef,
    localSkillsDir,
    upstreamSkillsDir: args.upstreamSkillsDir,
    counts: {
      local: localSkills.length,
      upstream: upstreamSkills.length,
      overlap: overlap.length,
    },
    summary,
    overlap,
  };

  await fsp.mkdir(outDir, { recursive: true });
  const jsonPath = path.join(outDir, 'skill-overlap-governance-latest.json');
  const mdPath = path.join(outDir, 'skill-overlap-governance-latest.md');
  await fsp.writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  await fsp.writeFile(mdPath, renderMarkdown(report), 'utf8');

  console.log(`Overlap governance report generated: ${report.counts.overlap} overlap skills`);
  console.log(`Reports: ${jsonPath}`);
  console.log(`Reports: ${mdPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
