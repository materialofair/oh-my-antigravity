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
    mode: 'auto',
    skillsDir: '',
    allowlistPath: '',
    outDir: '',
    maxFiles: 20,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--mode' && argv[i + 1]) {
      result.mode = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg.startsWith('--mode=')) {
      result.mode = arg.slice('--mode='.length);
      continue;
    }
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
    if (arg === '--allowlist' && argv[i + 1]) {
      result.allowlistPath = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg.startsWith('--out-dir=')) {
      result.outDir = arg.slice('--out-dir='.length);
      continue;
    }
    if (arg.startsWith('--allowlist=')) {
      result.allowlistPath = arg.slice('--allowlist='.length);
      continue;
    }
    if (arg === '--max-files' && argv[i + 1]) {
      result.maxFiles = Number(argv[i + 1]) || result.maxFiles;
      i += 1;
      continue;
    }
    if (arg.startsWith('--max-files=')) {
      result.maxFiles = Number(arg.slice('--max-files='.length)) || result.maxFiles;
    }
  }

  return result;
}

function detectOutDir(root, explicit) {
  return explicit ? path.resolve(explicit) : path.join(root, '.oma', 'reports');
}

function readAllowlist(root, explicitPath) {
  const file = explicitPath ? path.resolve(explicitPath) : path.join(root, '.governance', 'skill-llm.allowlist');
  if (!fs.existsSync(file)) return new Set();
  const lines = fs.readFileSync(file, 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));
  return new Set(lines);
}

function heuristicAudit(skillName, content) {
  const issues = [];

  if (!/^---\n[\s\S]*?\n---\n?/.test(content)) {
    issues.push({ severity: 'high', rule: 'missing_frontmatter', message: 'SKILL.md missing frontmatter block.' });
  }
  if (!/name:\s*[^\n]+/.test(content)) {
    issues.push({ severity: 'high', rule: 'missing_frontmatter_name', message: 'frontmatter.name is missing.' });
  }
  if (!/description:\s*[^\n]+/.test(content)) {
    issues.push({ severity: 'high', rule: 'missing_frontmatter_description', message: 'frontmatter.description is missing.' });
  }
  if (/\bTask\s*\(/.test(content)) {
    issues.push({ severity: 'high', rule: 'legacy_task_api', message: 'Legacy Task(...) syntax is not codex-native.' });
  }
  if (/cc\s+--plugin-dir|\/plugin|HUD/.test(content)) {
    issues.push({ severity: 'high', rule: 'non_codex_runtime', message: 'Contains runtime guidance not supported by Codex.' });
  }
  if (!/\$[\w-]+|[a-z-]+:\s+[^\n]+/i.test(content)) {
    issues.push({ severity: 'medium', rule: 'missing_invocation_example', message: 'No explicit Codex invocation example found.' });
  }
  if (/\betc\.\b|\bmaybe\b|\bif possible\b/i.test(content)) {
    issues.push({ severity: 'low', rule: 'ambiguous_wording', message: 'Contains ambiguous wording that can reduce determinism.' });
  }
  if (!/step|workflow|instructions|usage|how to use|when to use|步骤|用法/i.test(content)) {
    issues.push({ severity: 'medium', rule: 'missing_structure', message: 'Missing clear workflow/instruction sections.' });
  }

  return {
    skill: skillName,
    mode: 'heuristic',
    issues,
  };
}

function extractJson(content) {
  const trimmed = String(content || '').trim();
  try {
    return JSON.parse(trimmed);
  } catch {}

  const fenced = trimmed.match(/```(?:json)?\n([\s\S]*?)\n```/i);
  if (fenced) {
    try {
      return JSON.parse(fenced[1]);
    } catch {}
  }
  return null;
}

async function llmAudit(skillName, content, options) {
  const prompt = [
    'Audit the Codex skill document and return JSON.',
    'Rules:',
    '- Identify execution blockers and ambiguous instructions.',
    '- Focus on Codex compatibility and deterministic execution.',
    '- Keep findings concise.',
    'Output JSON schema:',
    '{"issues":[{"severity":"high|medium|low","rule":"string","message":"string"}]}',
    '',
    `Skill name: ${skillName}`,
    'Document:',
    content.slice(0, 7000),
  ].join('\n');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${options.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: options.model,
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You are a strict governance auditor for Codex skill docs.' },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`llm_http_${response.status}: ${body.slice(0, 240)}`);
  }

  const data = await response.json();
  const contentText = data && data.choices && data.choices[0] && data.choices[0].message
    ? data.choices[0].message.content
    : '';
  const parsed = extractJson(contentText);
  if (!parsed || !Array.isArray(parsed.issues)) {
    throw new Error('llm_invalid_json_output');
  }
  return {
    skill: skillName,
    mode: 'llm',
    issues: parsed.issues
      .filter((issue) => issue && typeof issue === 'object')
      .map((issue) => ({
        severity: ['high', 'medium', 'low'].includes(issue.severity) ? issue.severity : 'medium',
        rule: String(issue.rule || 'llm_rule'),
        message: String(issue.message || '').slice(0, 400),
      })),
  };
}

function mergeAudits(heuristic, llm) {
  if (!llm) return heuristic;
  return {
    skill: heuristic.skill,
    mode: 'hybrid',
    issues: [...heuristic.issues, ...llm.issues],
  };
}

function summarize(results) {
  const severity = { high: 0, medium: 0, low: 0 };
  for (const result of results) {
    for (const issue of result.issues) {
      if (severity[issue.severity] !== undefined) severity[issue.severity] += 1;
    }
  }
  const blockers = results.filter((result) => result.issues.some((issue) => issue.severity === 'high'));
  return {
    totalSkills: results.length,
    severity,
    blockerSkills: blockers.map((item) => item.skill),
    blockerCount: blockers.length,
  };
}

async function main() {
  const root = path.resolve(__dirname, '..');
  const args = parseArgs(process.argv.slice(2));
  const skillsDir = detectSkillsDir(root, args.skillsDir);
  const outDir = detectOutDir(root, args.outDir);
  const allowlist = readAllowlist(root, args.allowlistPath);

  const skills = await listSkillArtifacts(skillsDir);
  const mode = ['auto', 'heuristic', 'llm'].includes(args.mode) ? args.mode : 'auto';
  const apiKey = process.env.OPENAI_API_KEY;
  const llmEnabled = mode === 'llm' || (mode === 'auto' && !!apiKey);
  const model = process.env.OMX_GOVERNANCE_MODEL || 'gpt-4o-mini';

  const results = [];
  for (let i = 0; i < skills.length; i += 1) {
    const item = skills[i];
    const content = await readArtifactBundle(item, { maxCharsPerFile: 5000 });
    const heuristic = heuristicAudit(item.name, content);
    let llm = null;

    if (llmEnabled && i < Math.max(1, Number(args.maxFiles) || 20)) {
      try {
        llm = await llmAudit(item.name, content, { apiKey, model });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        heuristic.issues.push({
          severity: 'medium',
          rule: 'llm_fallback',
          message: `LLM audit unavailable, fallback to heuristic: ${message}`,
        });
      }
    }

    const merged = mergeAudits(heuristic, llm);
    merged.auditedFiles = item.files.map((file) => path.relative(item.dir, file));
    merged.issues = merged.issues.map((issue) => {
      const key = `${issue.rule}:${merged.skill}`;
      if (allowlist.has(key)) {
        return {
          ...issue,
          severity: issue.severity === 'high' ? 'medium' : issue.severity,
          message: `${issue.message} [allowlisted:${key}]`,
        };
      }
      return issue;
    });
    results.push(merged);
  }

  const summary = summarize(results);
  const report = {
    generatedAt: new Date().toISOString(),
    mode: llmEnabled ? (mode === 'llm' ? 'llm' : 'auto-llm') : 'heuristic',
    model: llmEnabled ? model : null,
    skillsDir,
    allowlist: Array.from(allowlist).sort(),
    summary,
    results,
  };

  await fsp.mkdir(outDir, { recursive: true });
  const reportPath = path.join(outDir, 'skill-llm-governance-latest.json');
  await fsp.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log(`Skill governance (LLM gate) completed: ${summary.totalSkills} skills`);
  console.log(`High=${summary.severity.high} Medium=${summary.severity.medium} Low=${summary.severity.low}`);
  console.log(`Report: ${reportPath}`);

  if (summary.blockerCount > 0) {
    console.error(`Blockers detected in skills: ${summary.blockerSkills.join(', ')}`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
