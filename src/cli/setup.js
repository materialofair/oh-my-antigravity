/* eslint-disable no-console */
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const {
  globalSkillsDir,
  globalWorkflowsDir,
  globalRulesFile,
  globalMcpConfigPath,
  workspaceSkillsDirs,
  workspaceWorkflowsDirs,
  workspaceRulesFile,
  skillsSource,
  workflowsSource,
  rulesSource,
  stateDir,
  GEMINI_HOME,
} = require('../utils/paths');
const { mergeMcpConfig, injectGeminiSkills } = require('../config/generator');
const { getCatalogHeadlineCounts } = require('../catalog/reader');
const {
  loadSkillsFromSource,
  detectConflicts,
  resolveConflicts,
  applyResolutions,
  generateReport,
} = require('../merge/skill-merger');

const SETUP_SCOPES = new Set(['user', 'project-local', 'project']);

function readPersistedScope(cwd) {
  const scopeFile = path.join(stateDir(cwd), 'setup-scope.json');
  if (!fs.existsSync(scopeFile)) return null;
  try {
    const parsed = JSON.parse(fs.readFileSync(scopeFile, 'utf8'));
    if (SETUP_SCOPES.has(parsed.scope)) return parsed.scope;
  } catch {}
  return null;
}

async function persistScope(cwd, scope, dryRun) {
  const scopeFile = path.join(stateDir(cwd), 'setup-scope.json');
  if (dryRun) return;
  await fsp.mkdir(path.dirname(scopeFile), { recursive: true });
  await fsp.writeFile(scopeFile, `${JSON.stringify({ scope }, null, 2)}\n`, 'utf8');
}

async function copyDirectory(src, dest, options) {
  if (!fs.existsSync(src)) return 0;
  if (!options.dryRun) {
    await fsp.mkdir(dest, { recursive: true });
  }
  const entries = await fsp.readdir(src, { withFileTypes: true });
  let count = 0;

  for (const entry of entries) {
    if (entry.name === '.DS_Store') continue;
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      count += await copyDirectory(from, to, options);
      continue;
    }
    if (!entry.isFile()) continue;
    if (!options.force && fs.existsSync(to)) continue;
    if (!options.dryRun) {
      await fsp.mkdir(path.dirname(to), { recursive: true });
      await fsp.copyFile(from, to);
    }
    count += 1;
  }
  return count;
}

function evaluateSkillQuality(skill) {
  const skillDoc = path.join(skill.path, 'SKILL.md');
  if (!fs.existsSync(skillDoc)) {
    return { score: 0, signals: ['missing_skill_doc'] };
  }
  const content = fs.readFileSync(skillDoc, 'utf8');
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
    score -= 20;
    signals.push('missing_description');
  }
  if (!/usage|when to use|instructions|workflow|步骤|用法/i.test(content)) {
    score -= 8;
    signals.push('missing_structure');
  }

  score = Math.max(0, Math.min(100, score));
  return { score, signals };
}

async function mergeSkillsFromSources(root) {
  const sources = [];
  let forkSkills = [];
  let upstreamSkillsRaw = [];
  const qualityWinners = [];

  // Local (fork) skills from .agent/skills/local/
  const src = skillsSource(root);
  const forkPath = fs.existsSync(src.localSkills) ? src.localSkills : src.legacyFlat;
  if (fs.existsSync(forkPath)) {
    forkSkills = loadSkillsFromSource(forkPath, 'fork');
    sources.push({ name: 'fork', skills: forkSkills });
  }

  // Upstream skills from .agent/skills/upstream/<source>/
  const upstreamBaseDir = src.upstreamDir;
  if (fs.existsSync(upstreamBaseDir)) {
    const upstreamSources = fs.readdirSync(upstreamBaseDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory());
    for (const srcDir of upstreamSources) {
      const srcPath = path.join(upstreamBaseDir, srcDir.name);
      const srcSkills = loadSkillsFromSource(srcPath, srcDir.name);
      if (srcSkills.length > 0) {
        upstreamSkillsRaw.push(...srcSkills);
        sources.push({ name: srcDir.name, skills: srcSkills });
      }
    }
  }

  // Merge config (preferences for conflict resolution)
  const defaultMergeConfigPath = path.join(root, 'templates', 'merge-config.json');
  let mergeConfig = { allow_namespacing: false, preferences: {} };
  if (fs.existsSync(defaultMergeConfigPath)) {
    try {
      mergeConfig = JSON.parse(fs.readFileSync(defaultMergeConfigPath, 'utf8'));
    } catch (err) {
      console.warn(`Warning: Failed to load merge config: ${err.message}`);
    }
  }

  // Auto quality preferences for overlapping skills.
  const forkByName = new Map(forkSkills.map((item) => [item.name, item]));
  const upstreamByName = new Map(upstreamSkillsRaw.map((item) => [item.name, item]));
  const overlapNames = Array.from(forkByName.keys())
    .filter((name) => upstreamByName.has(name))
    .sort((a, b) => a.localeCompare(b));
  const autoPreferences = {};
  for (const name of overlapNames) {
    const forkQuality = evaluateSkillQuality(forkByName.get(name));
    const upstreamSkill = upstreamByName.get(name);
    const upstreamQuality = evaluateSkillQuality(upstreamSkill);
    const winner = forkQuality.score >= upstreamQuality.score ? 'fork' : (upstreamSkill.source || 'upstream');
    autoPreferences[name] = winner;
    qualityWinners.push({ skill: name, winner, forkScore: forkQuality.score, upstreamScore: upstreamQuality.score });
  }

  const mergeConfigWithAuto = {
    ...mergeConfig,
    preferences: { ...autoPreferences, ...(mergeConfig.preferences || {}) },
  };

  const conflicts = detectConflicts(sources);
  const resolutions = resolveConflicts(conflicts, mergeConfigWithAuto);
  const merged = applyResolutions(sources, resolutions);
  const report = generateReport(conflicts, resolutions);

  const sourceStats = {
    forkCount: forkSkills.length,
    upstreamRawCount: upstreamSkillsRaw.length,
    overlapCount: overlapNames.length,
    qualityWinners,
  };
  return { merged, report, sourceStats };
}

async function copyMergedSkills(merged, dest, options) {
  if (!options.dryRun) {
    await fsp.mkdir(dest, { recursive: true });
  }
  let count = 0;
  for (const skill of merged) {
    const skillDest = path.join(dest, skill.name);
    count += await copyDirectory(skill.path, skillDest, options);
  }
  return count;
}

async function setup(options = {}) {
  const cwd = process.cwd();
  const root = path.resolve(__dirname, '..', '..');
  const scope = options.scope || readPersistedScope(cwd) || 'user';

  if (!SETUP_SCOPES.has(scope)) {
    throw new Error(`Invalid scope: ${scope}. Expected one of user, project-local, project.`);
  }

  const isUser = scope === 'user';

  console.log('oh-my-antigravity setup');
  console.log('=======================');
  console.log(`Scope: ${scope}${isUser ? ' (global ~/.gemini/antigravity)' : ' (workspace .agents + .agent)'}`);

  await persistScope(cwd, scope, options.dryRun);

  // --- [1/6] Skills ---------------------------------------------------------
  console.log('[1/6] Installing skills...');
  const skillsTargets = isUser ? [globalSkillsDir()] : workspaceSkillsDirs(cwd);
  let mergedSkills = [];

  if (options.installSkills === false) {
    console.log('  Skipped (--no-skills)');
  } else {
    const { merged, report, sourceStats } = await mergeSkillsFromSources(root);
    mergedSkills = merged;
    const label = options.dryRun ? 'Would install/update' : 'Installed/updated';
    for (const dest of skillsTargets) {
      const count = await copyMergedSkills(merged, dest, options);
      console.log(`  ${label} ${count} files from ${merged.length} skills -> ${dest}`);
    }
    if (sourceStats.upstreamRawCount > 0) {
      console.log(`  Sources: fork=${sourceStats.forkCount}, upstream=${sourceStats.upstreamRawCount}, overlap=${sourceStats.overlapCount}`);
    }
    if (report.conflicts.length > 0 && !options.dryRun) {
      const reportPath = path.join(stateDir(cwd), 'merge-report.json');
      await fsp.mkdir(path.dirname(reportPath), { recursive: true });
      await fsp.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');
      console.log(`  Resolved ${report.conflicts.length} conflicts -> ${reportPath}`);
    }
  }

  // --- [2/6] Workflows ------------------------------------------------------
  console.log('[2/6] Installing workflows...');
  const workflowsSrc = workflowsSource(root);
  if (options.installWorkflows === false) {
    console.log('  Skipped (--no-workflows)');
  } else if (!fs.existsSync(workflowsSrc)) {
    console.log(`  Skipped (missing source: ${workflowsSrc})`);
  } else {
    const workflowTargets = isUser ? [globalWorkflowsDir()] : workspaceWorkflowsDirs(cwd);
    const label = options.dryRun ? 'Would install/update' : 'Installed/updated';
    for (const dest of workflowTargets) {
      const count = await copyDirectory(workflowsSrc, dest, options);
      console.log(`  ${label} ${count} workflows -> ${dest}`);
    }
  }

  // --- [3/6] Rules ----------------------------------------------------------
  console.log('[3/6] Installing rules...');
  const rulesSrc = rulesSource(root);
  if (options.installRules === false) {
    console.log('  Skipped (--no-rules)');
  } else if (!fs.existsSync(rulesSrc)) {
    console.log(`  Skipped (missing source: ${rulesSrc})`);
  } else {
    const rulesDest = isUser
      ? path.join(GEMINI_HOME, 'config', 'rules')
      : path.join(cwd, '.agent', 'rules');
    const count = await copyDirectory(rulesSrc, rulesDest, options);
    const label = options.dryRun ? 'Would install/update' : 'Installed/updated';
    console.log(`  ${label} ${count} rule files -> ${rulesDest}`);
  }

  // --- [4/6] GEMINI.md skills injection (the 2.0 discovery fix) -------------
  console.log('[4/6] Injecting skills into GEMINI.md...');
  if (options.installRules === false || mergedSkills.length === 0) {
    console.log('  Skipped (no skills or --no-rules)');
  } else {
    const geminiFile = isUser ? globalRulesFile() : workspaceRulesFile(cwd);
    const listedDir = isUser ? globalSkillsDir() : workspaceSkillsDirs(cwd)[0];
    const skillList = mergedSkills.map((s) => ({
      name: s.name,
      description: (s.metadata && s.metadata.description) || '',
    }));
    const n = injectGeminiSkills(geminiFile, skillList, listedDir, options);
    const label = options.dryRun ? 'Would list' : 'Listed';
    console.log(`  ${label} ${n} skills -> ${geminiFile}`);
  }

  // --- [5/6] MCP servers (JSON) ---------------------------------------------
  console.log('[5/6] Registering MCP servers...');
  if (options.installConfig === false) {
    console.log('  Skipped (--no-config)');
  } else if (!isUser) {
    console.log('  Skipped (MCP servers register at user scope; rerun with --scope user)');
  } else {
    const mcpFile = globalMcpConfigPath();
    const names = mergeMcpConfig(mcpFile, root, {
      enableContext7: options.enableContext7,
      dryRun: options.dryRun,
    });
    const label = options.dryRun ? 'Would register' : 'Registered';
    console.log(`  ${label} ${names.join(', ')} -> ${mcpFile}`);
  }

  // --- [6/6] Catalog check --------------------------------------------------
  console.log('[6/6] Catalog check...');
  const headline = getCatalogHeadlineCounts(root);
  if (headline) {
    console.log(`  Catalog baseline: ${headline.skills} skills, ${headline.prompts} prompts`);
  } else {
    console.log('  Catalog manifest missing (run npm run catalog:generate)');
  }

  console.log('\nDone.');
  if (!isUser && !options.dryRun) {
    console.log('Tip: restart the Antigravity agent session so it re-scans skills.');
  }
}

module.exports = { setup };
