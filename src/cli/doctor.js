/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const {
  globalSkillsDir,
  globalWorkflowsDir,
  globalRulesFile,
  globalMcpConfigPath,
  workspaceSkillsDirs,
  skillsSource,
  ANTIGRAVITY_HOME,
} = require('../utils/paths');
const { tryReadCatalogManifest } = require('../catalog/reader');

function countSkillDirs(dir) {
  if (!fs.existsSync(dir)) return 0;
  try {
    return fs.readdirSync(dir, { withFileTypes: true })
      .filter((e) => e.isDirectory() && fs.existsSync(path.join(dir, e.name, 'SKILL.md')))
      .length;
  } catch {
    return 0;
  }
}

function countWorkflows(dir) {
  if (!fs.existsSync(dir)) return 0;
  try {
    return fs.readdirSync(dir).filter((f) => f.endsWith('.md')).length;
  } catch {
    return 0;
  }
}

function geminiHasSkillsBlock(file) {
  if (!fs.existsSync(file)) return false;
  try {
    return fs.readFileSync(file, 'utf8').includes('oh-my-antigravity managed: skills');
  } catch {
    return false;
  }
}

async function doctor() {
  const root = path.resolve(__dirname, '..', '..');
  const cwd = process.cwd();

  // --- Repo health (gates exit code) ---------------------------------------
  const checks = [];
  const src = skillsSource(root);
  const localDir = fs.existsSync(src.localSkills) ? src.localSkills : src.legacyFlat;
  const localOk = fs.existsSync(localDir);
  checks.push({ name: 'Skills source (local)', pass: localOk, msg: localOk ? `${countSkillDirs(localDir)} skills @ ${localDir}` : 'missing' });
  checks.push({ name: 'Prompts source', pass: fs.existsSync(path.join(root, 'prompts')), msg: path.join(root, 'prompts') });
  const manifest = tryReadCatalogManifest(root);
  checks.push({ name: 'Catalog manifest', pass: !!manifest, msg: manifest ? `ok (${manifest.skills.length} skills)` : 'missing (run npm run catalog:generate)' });

  // --- Install / environment status (informational, never gates) -----------
  const info = [];
  const isMac = process.platform === 'darwin';
  const hasAntigravity = (isMac && fs.existsSync('/Applications/Antigravity.app')) || fs.existsSync(ANTIGRAVITY_HOME);
  info.push({ name: 'Antigravity', msg: hasAntigravity ? `found (${ANTIGRAVITY_HOME})` : 'not detected' });
  info.push({ name: 'Upstream skills', msg: fs.existsSync(src.upstreamDir) && fs.readdirSync(src.upstreamDir).length ? fs.readdirSync(src.upstreamDir).join(', ') : 'none (npm run source:skills:sync)' });

  const gSkills = globalSkillsDir();
  const gCount = countSkillDirs(gSkills);
  info.push({ name: 'Global skills', msg: gCount > 0 ? `${gCount} @ ${gSkills}` : `none (oma setup --scope user)` });
  info.push({ name: 'Global workflows', msg: `${countWorkflows(globalWorkflowsDir())} @ ${globalWorkflowsDir()}` });
  const gGemini = globalRulesFile();
  info.push({ name: 'GEMINI.md skills block', msg: geminiHasSkillsBlock(gGemini) ? `present @ ${gGemini}` : `MISSING — global skills are invisible to Antigravity 2.0 until you run: oma setup --scope user` });
  const mcpFile = globalMcpConfigPath();
  info.push({ name: 'MCP config', msg: fs.existsSync(mcpFile) ? mcpFile : `not created (${mcpFile})` });

  const [wsAgents, wsAgent] = workspaceSkillsDirs(cwd);
  const wsCount = Math.max(countSkillDirs(wsAgents), countSkillDirs(wsAgent));
  if (wsCount > 0) {
    info.push({ name: 'Workspace skills', msg: `.agents=${countSkillDirs(wsAgents)}, .agent=${countSkillDirs(wsAgent)} @ ${cwd}` });
  }

  let passCount = 0;
  console.log('Repo health:');
  for (const check of checks) {
    const icon = check.pass ? '[OK]' : '[XX]';
    if (check.pass) passCount += 1;
    console.log(`  ${icon} ${check.name}: ${check.msg}`);
  }
  console.log('\nInstall status:');
  for (const item of info) {
    console.log(`  [i] ${item.name}: ${item.msg}`);
  }

  console.log(`\nResult: ${passCount}/${checks.length} repo-health checks passed.`);
  if (passCount !== checks.length) {
    process.exitCode = 1;
  }
}

module.exports = { doctor };
