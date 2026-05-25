const fs = require('fs');
const os = require('os');
const path = require('path');

/**
 * Path resolution for oh-my-antigravity.
 *
 * This is the single choke point for every target the installer writes to.
 * Google Antigravity 2.0 reorganized its config under ~/.gemini/ (the 5/21
 * ".migrated" migration), and its skill/workflow discovery differs from Codex:
 *
 *   - Global skills:    ~/.gemini/antigravity/skills/        (documented path;
 *                       in 2.0 a symlink -> ~/.gemini/config/skills)
 *   - Global workflows: ~/.gemini/antigravity/global_workflows/
 *   - Global rules:     ~/.gemini/GEMINI.md
 *   - Global MCP:       ~/.gemini/config/mcp_config.json (JSON, not TOML)
 *
 * Workspace skills/workflows are written to BOTH .agents/ (the 2.0 default)
 * and .agent/ (backward-compat) because Antigravity searches "{.agents,.agent}".
 */

const GEMINI_HOME = path.join(os.homedir(), '.gemini');
const ANTIGRAVITY_HOME = path.join(GEMINI_HOME, 'antigravity');

// ---------------------------------------------------------------------------
// Global (scope=user) targets
// ---------------------------------------------------------------------------

function globalSkillsDir() {
  return path.join(ANTIGRAVITY_HOME, 'skills');
}

function globalWorkflowsDir() {
  return path.join(ANTIGRAVITY_HOME, 'global_workflows');
}

function globalRulesFile() {
  return path.join(GEMINI_HOME, 'GEMINI.md');
}

/**
 * Antigravity 2.0 stores MCP config as JSON. Prefer the migrated location
 * (~/.gemini/config/mcp_config.json); fall back to the legacy antigravity
 * path if the config dir does not exist yet.
 */
function globalMcpConfigPath() {
  const migrated = path.join(GEMINI_HOME, 'config', 'mcp_config.json');
  const legacy = path.join(ANTIGRAVITY_HOME, 'mcp_config.json');
  if (fs.existsSync(path.dirname(migrated))) return migrated;
  return legacy;
}

// ---------------------------------------------------------------------------
// Workspace (scope=project-local|project) targets — dual write
// ---------------------------------------------------------------------------

/** Both skill destinations: .agents/skills (2.0 default) + .agent/skills (compat). */
function workspaceSkillsDirs(cwd) {
  return [
    path.join(cwd, '.agents', 'skills'),
    path.join(cwd, '.agent', 'skills'),
  ];
}

/** Both workflow destinations: .agents/workflows + .agent/workflows. */
function workspaceWorkflowsDirs(cwd) {
  return [
    path.join(cwd, '.agents', 'workflows'),
    path.join(cwd, '.agent', 'workflows'),
  ];
}

function workspaceRulesFile(cwd) {
  return path.join(cwd, 'GEMINI.md');
}

// ---------------------------------------------------------------------------
// Repo sources (what we install FROM)
// ---------------------------------------------------------------------------

function skillsSource(root) {
  const localSkills = path.join(root, '.agent', 'skills', 'local');
  const upstreamDir = path.join(root, '.agent', 'skills', 'upstream');
  const legacyFlat = path.join(root, '.agent', 'skills');
  // Legacy alias kept for callers that expect `agentSkills`.
  const agentSkills = localSkills;
  return { localSkills, upstreamDir, legacyFlat, agentSkills };
}

function workflowsSource(root) {
  return path.join(root, '.agent', 'workflows');
}

function promptsSource(root) {
  return path.join(root, 'prompts');
}

function rulesSource(root) {
  return path.join(root, 'templates', 'rules');
}

// ---------------------------------------------------------------------------
// Runtime state (per-cwd)
// ---------------------------------------------------------------------------

function stateDir(cwd) {
  return path.join(cwd, '.oma');
}

module.exports = {
  GEMINI_HOME,
  ANTIGRAVITY_HOME,
  globalSkillsDir,
  globalWorkflowsDir,
  globalRulesFile,
  globalMcpConfigPath,
  workspaceSkillsDirs,
  workspaceWorkflowsDirs,
  workspaceRulesFile,
  skillsSource,
  workflowsSource,
  promptsSource,
  rulesSource,
  stateDir,
};
